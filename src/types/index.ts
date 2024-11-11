type ProxyFunctionThis<T = {}> = {
  method: string;
  origin: (...args: any[]) => any;
} & T;

type ProxyFunction<T = {}> = (
  this: ProxyFunctionThis<T>,
  ...args: any[]
) => any;

export { ProxyFunction, ProxyFunctionThis };
