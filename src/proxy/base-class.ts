import { ProxyFunction, ProxyFunctionThis } from "@/types";
import { createGetProxy } from "./common";

export type Instance = object | undefined;
export type MethodThis<T extends BaseClassProxy> = ProxyFunctionThis<T>;

export abstract class BaseClassProxy<T extends BaseClassProxy<T> = any> {
  // 代理的原始实例
  private _originInstance: Instance;
  // 实例方法映射表
  private _methodHookCb: Map<string, ProxyFunction<T>> = new Map();

  static MethodHook<T extends BaseClassProxy>(methodName?: string) {
    return function (
      value: (this: MethodThis<T>, ...args: any[]) => any,
      context: ClassMethodDecoratorContext<MethodThis<T>, ProxyFunction<T>>
    ) {
      const hookName = methodName ? methodName : String(context.name);

      if (context.kind == "method") {
        const fn = function (this: MethodThis<T>, ...args: any[]) {
          if (!this.origin) {
            if (this._originInstance === undefined)
              throw new Error("Instance Not Attached");
            return this._originInstance[hookName](...args);
          }
          return value.apply(this, args);
        };

        context.addInitializer(function () {
          // 不需要bind this
          this._methodHookCb.set(hookName, fn);
        });
        return fn;
      }

      return value;
    };
  }

  get baseInstance() {
    return this._originInstance;
  }

  // 附加接管对象 可能多次调用
  protected attach(obj: object) {
    if (obj && !this._originInstance && obj !== this._originInstance)
      this._originInstance = obj;

    const self = this;
    return createGetProxy(
      obj,
      (method, value) => {
        const cb = this._methodHookCb.get(method);
        const origin = value.bind(obj);
        if (cb) {
          return function (...args: any[]) {
            return cb.apply(
              { ...self, method, origin } as unknown as MethodThis<T>,
              args
            );
          };
        }
        return origin;
      },
      "function"
    );
  }
}
