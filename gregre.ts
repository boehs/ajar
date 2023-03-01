type PartialRecord<K extends keyof any, T> =  Partial<Record<K, T>>
  
type Methods = "get" | "post" | "put" | "post" | "patch" | "delete";

type Endpoint = {
  parameters?: PartialRecord<"path" | "query", { [key: string]: string }>
  requestBody?: Record<string,any>
  responses: {
    [key: string]: {
      content: Record<string,any>
    }
  } | never
}

type Endpoints = {
  [path: string]: Partial<{
    [method in Methods]: Endpoint
  }>
}

type InferResponse<
  T extends Endpoints,
  Path extends keyof T,
  Method extends keyof T[Path]> = 'response' extends keyof T[Path][Method] ? T[Path][Method]['response'] : never;
