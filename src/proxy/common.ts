import { log } from "console";
import { ProxyFunctionThis } from "@/types";

export function proxyDlopen(moduleName: string, cb: (obj: any) => object) {
  process.dlopen = new Proxy(process.dlopen, {
    apply: function (
      target,
      thisArg,
      args: [
        {
          id: number;
          loaded: boolean;
          exports: Record<string, any>;
          paths: [];
          children: [];
        },
        string,
      ]
    ) {
      const ret = Reflect.apply(target, thisArg, args);
      try {
        if (args[1].indexOf(moduleName) != -1)
          args[0].exports = cb(args[0].exports);
      } catch (e) {
        log(e);
      }
      return ret;
    },
  });
}

type ALL_TYPE =
  | "string"
  | "number"
  | "bigint"
  | "boolean"
  | "symbol"
  | "undefined"
  | "object"
  | "function"
  | "";

export function createGetProxy(
  obj: any,
  cb: (propertyName: string, getObj: any) => object,
  filterType: ALL_TYPE = "",
  parent: boolean = false
) {
  return new Proxy(parent ? new obj.constructor() : obj, {
    get(_, propertyName: string, receiver) {
      const result = Reflect.get(obj, propertyName, receiver);
      if (filterType !== "" && typeof result !== filterType) return result;
      return cb(propertyName, result);
    },
  });
}

export function createFunctionProxy(
  obj: any,
  cb: (this: ProxyFunctionThis, ...args: any[]) => object,
  parent: boolean = false
) {
  return createGetProxy(
    obj,
    (method, value) => {
      return (...args: any[]) => {
        return cb.apply({ method, origin: value.bind(obj) }, args);
      };
    },
    "function",
    parent
  );
}

export {};
