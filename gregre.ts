import { paths } from './testing'

type PartialRecord<K extends keyof any, T> = Partial<Record<K, T>>

type Methods = "get" | "post" | "put" | "post" | "patch" | "delete"

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

type InferResponse<
  T extends Endpoint,
  Method extends keyof T> = 'responses' extends keyof T[Method] ? T[Method]['responses'] : never
  
  type InferInput<
  T extends Endpoint,
  Method extends keyof T> = 'parameters' extends keyof T[Method] ? T[Method]['parameters'] : never

type ToFns<T extends Endpoint> = {
  [method in keyof T]: (params: InferInput<T,method>) => InferResponse<T,method> 
}

type PathToChain<
  E extends Endpoints,
  Path extends keyof E,
  Original extends string = ''
  > = Path extends `/${infer P}`
  ? PathToChain<E, P, Path>
  : Path extends `${infer P}/${infer R}`
  ? { [K in P]: PathToChain<E, R, Original> }
  : {
    [K in Path extends '' ? 'index' : Path]: ToFns<E[Original]>
  }

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never

type ChainedPaths = UnionToIntersection<PathToChain<paths, keyof paths>>