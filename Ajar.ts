import { paths } from './testing'

type PartialRecord<K extends keyof any, T> = Partial<Record<K, T>>

type Methods = "get" | "post" | "put" | "post" | "patch" | "delete"
type JsonTypes = "application/json" | "text/json" | "application/*+json"

type EndpointTyping = {
  parameters?: PartialRecord<"path" | "query", { [key: string]: string }>
  requestBody?: Record<string, any>
  responses: {
    [key: string]: {
      content: Record<string, any>
    }
  } | never
}

type Endpoint = Partial<{
  [method in Methods]: EndpointTyping
}>

type Endpoints = {
  [path: string]: Endpoint
}

type KOfEP<
  T extends Endpoint,
  Method extends keyof T,
  E extends keyof EndpointTyping
  > = E extends keyof T[Method]
  ? T[Method][E]
  : never

type ToFns<T extends Endpoint> = {
  [method in keyof T]: (params: KOfEP<T, method, 'parameters'>) => Promise<KOfEP<T, method, 'responses'>>
}

type PathToChain<
  E extends Endpoints,
  Path extends keyof E,
  Original extends string = ''
  > = Path extends `/${infer P}`
    ? PathToChain<E, P, Path>
    // Known issue, doesn't work with {id}-{id-2} or whatever
    : Path extends `{${infer P}}${infer N}`
      // K should be infered from method's parameters, but too lasy
      ? { [K: string]: PathToChain<E, N, Original> }
      : Path extends `${infer P}/${infer R}`
        ? { [K in P]: PathToChain<E, R, Original> }
        : Path extends ''
          ? ToFns<E[Original]>
          : {
            [K in Path]: ToFns<E[Original]>
          }

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never

const createProxy = (callback: (path: string, args: Partial<{
  [param in 'path' | 'query' | 'body']: { [key: string]: string }
}>) => Promise<any>, path: string[]) => {
  const proxy: unknown = new Proxy(() => { }, {
    get(_obj, key) {
      if (typeof key !== 'string') return undefined
      return createProxy(callback, [...path, key])
    },
    apply(_1, _2, args) {
      return callback(path.join('/'), args)
    },
  })
  return proxy
}

export default function Ajar<T extends Endpoints>(opts?: {
  fetch?: typeof fetch
}) {
  return createProxy(async (path, args) => {
    let query: string | undefined

    if (args.query) {
      const searchQuery = new URLSearchParams()
      Object.keys(args.query).forEach(key => searchQuery.append(key, args.query[key]))
      query = '?' + searchQuery.toString()
    }


    return new Promise((r) => r(''))
  }, []) as UnionToIntersection<PathToChain<T, keyof T>>
}

Ajar<paths>().api.auth.login.get