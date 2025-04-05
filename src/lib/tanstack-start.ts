export type ServerFnData<TFn> = TFn extends (arg: { data: infer TData }) => unknown
  ? TData
  : never;
