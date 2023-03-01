import { paths } from './testing'

type PartialRecord<K extends keyof any, T> = Partial<Record<K, T>>

type Methods = "get" | "post" | "put" | "post" | "patch" | "delete"

type Endpoint = {
  parameters?: PartialRecord<"path" | "query", { [key: string]: string }>
  requestBody?: Record<string, any>
  responses: {
    [key: string]: {
      content: Record<string, any>
    }
  } | never
}

type Endpoints = {
  [path: string]: Partial<{
    [method in Methods]: Endpoint
  }>
}

type InferResponse<
  T extends Partial<{
    [method in Methods]: Endpoint
  }>,
  Method extends keyof T> = 'responses' extends keyof T[Method] ? T[Method]['responses'] : never

type PathToChain<
  E extends Endpoints,
  Path extends keyof Endpoints,
  Original extends string = ''
  > = Path extends `/${infer P}`
  ? PathToChain<E, P, Path>
  : Path extends `${infer P}/${infer R}`
  ? { [K in P]: PathToChain<E, R, Original> }
  : {
    [K in Path extends '' ? 'index' : Path]: E[Original]
  }