import { ProxyFunctionThis } from "@/types";
import { createGetProxy } from "./common";

export type Instance = object | undefined;
export type MethodThis<T extends BaseClassProxy> = ProxyFunctionThis<T> & {
  isHooked: boolean;
};
export type MethodFunction<T extends BaseClassProxy> = (
  this: MethodThis<T>,
  ...args: any[]
) => any;

export abstract class BaseClassProxy<T extends BaseClassProxy<T> = any> {
  // 代理的原始实例
  private _originInstance: Instance;
  // 实例方法映射表
  private _methodHookCb: Map<string, MethodFunction<T>> = new Map();

  static methodHook<T extends BaseClassProxy>(methodName?: string) {
    return function (
      value: (this: MethodThis<T>, ...args: any[]) => any,
      context: ClassMethodDecoratorContext<MethodThis<T>, MethodFunction<T>>
    ) {
      const method = methodName ? methodName : String(context.name);
      if (context.kind == "method") {
        const fn = function (this: MethodThis<T>, ...args: any[]) {
          // 判断用户调用 补充上下文
          if (!this.origin) {
            if (this._originInstance === undefined)
                throw new Error("Instance not attached");
            this.method = method;
            this.isHooked = false;
            this.origin = this._originInstance[method].bind(
              this._originInstance
            );
            console.log("补充上下文", this);
          }
          return value.apply(this, args);
        };

        context.addInitializer(function () {
          // 不需要bind this
          this._methodHookCb.set(method, fn);
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
  protected attach(obj: object, hooked: boolean) {
    const self = this;
    if (obj && !this._originInstance && obj !== this._originInstance)
      this._originInstance = obj;

    return obj
      ? createGetProxy(
          obj,
          (method: string, value: any) => {
            const cb = this._methodHookCb.get(method);
            const origin = value.bind(this._originInstance);
            if (cb) {
              return function (...args: any[]) {
                return cb.apply(
                  {
                    ...(self as unknown as T),
                    method,
                    origin,
                    isHooked: hooked,
                  },
                  args
                );
              };
            }
            return origin;
          },
          "function"
        )
      : obj;
  }
}
