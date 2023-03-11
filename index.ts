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
  [method in keyof T]: (params: KOfEP<T, method, 'parameters'>) => KOfEP<T, method, 'responses'>
}

type PathToChain<
  E extends Endpoints,
  Path extends keyof E,
  Original extends string = ''
  > = Path extends `/${infer Part}`
    ? PathToChain<E, Part, Path>
    // Known issue, doesn't work with {id}-{id-2} or whatever
    : Path extends `{${infer Param}}${infer Next}`
        ? { [K: string]: PathToChain<E, Next extends `/${infer N2}` ? N2 : Next, Original>[] }
      : Path extends `${infer Current}/${infer Next}`
        ? { [K in Current]: PathToChain<E, Next, Original> }
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

const createProxy = (callback: (path: string[], args: Partial<{
  [param in 'path' | 'query' | 'body']: { [key: string]: string }
}>) => Promise<any>, path: string[]) => {
  const proxy: unknown = new Proxy(() => { }, {
    get(_obj, key) {
      if (typeof key !== 'string') return undefined
      return createProxy(callback, [...path, key])
    },
    apply(_1, _2, args) {
      return callback(path, args[0])
    },
  })
  return proxy
}

export default function Ajar<T extends Endpoints>(opts?: {
  fetch?: typeof fetch,
  base?: string
  defaults?: RequestInit
} = {}) {
  return createProxy((path, args) => {
    let query: string | undefined

    if (args.query) {
      const searchQuery = new URLSearchParams()
      Object.keys(args.query).forEach(key => searchQuery.append(key, args.query[key]))
      query = '?' + searchQuery.toString()
    }
    
    let method = path.pop()!
    
    const url = (opts.base || '') + path.join('/') + (query || '')
    
    const m: RequestInit = {
      ...opts.defaults,
      method: method.toUpperCase()
    }
    return {
      compile: () => [url,m] as const
    }
    
  }, []) as UnionToIntersection<PathToChain<T, keyof T>>
}