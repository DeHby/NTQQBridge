import {
  BaseClassProxy,
  CallerType,
  createFunctionProxy,
  MethodFunction,
  MethodThis,
  ModuleLoader,
} from "@/proxy";

export class NTQQLoader extends ModuleLoader {
  private static _instance = new NTQQLoader();
  private _exportHookCb = new Map<
    string,
    (obj: object, invokeType: CallerType) => any
  >();

  public constructor() {
    super("wrapper.node");
  }

  protected _exportLoader(exportName: string, exportObject: any) {
    const self = this;
    return createFunctionProxy(
      exportObject,
      function (...args: any[]) {
        const result = this.origin(...args);
        const cb = self._exportHookCb.get(`${exportName}.${this.method}`);
        if (cb) return cb(result, CallerType.System);
        return result;
      },
      true
    );
  }

  static MethodHook<T extends BaseClassProxy>(methodName?: string) {
    return BaseClassProxy.methodHook<T>(methodName);
  }

  static AttachClassWithArg<
    T extends BaseClassProxy,
    T2 extends BaseClassProxy,
  >(target: new (...args: any[]) => T, indexOfArg: number = 0) {
    const self = this;
    const constructorName = Object.getPrototypeOf(target).name;

    return function (
      value: (this: MethodThis<T2>, ...args: any[]) => any,
      context: ClassMethodDecoratorContext<MethodThis<T2>, MethodFunction<T2>>
    ) {
      if (context.kind == "method") {
        const cb = self._instance._exportHookCb.get(constructorName);

        if (cb) {
          return function (this: MethodThis<T2>, ...args: any[]) {
            if (!this.origin)
              throw new Error(
                `You must use @MethodHook before using @AttachClassWithArg on method "${String(
                  context.name
                )}"`
              );

            args[indexOfArg] = cb(args[indexOfArg], this.invokeType);
            return value.apply(this, args);
          };
        }
      }
    };
  }

  static AttachClassWithRet<
    T extends BaseClassProxy,
    T2 extends BaseClassProxy,
  >(target: new (...args: any[]) => T) {
    const self = this;
    const constructorName = Object.getPrototypeOf(target).name;

    return function (
      value: (this: MethodThis<T2>, ...args: any[]) => any,
      context: ClassMethodDecoratorContext<MethodThis<T2>, MethodFunction<T2>>
    ) {
      if (context.kind == "method") {
        const cb = self._instance._exportHookCb.get(constructorName);

        if (cb) {
          return function (this: MethodThis<T2>, ...args: any[]) {
            if (!this.origin)
              throw new Error(
                `You must use @MethodHook before using @AttachClassWithRet on method "${String(
                  context.name
                )}"`
              );

            return cb(value.apply(this, args), this.invokeType);
          };
        }
      }
    };
  }

  static AttachClass<T extends BaseClassProxy, T2 extends BaseClassProxy>(
    target: new (...args: any[]) => T
  ) {
    return NTQQLoader.AttachClassWithRet<T, T2>(target);
  }

  // 垃圾TS 只能先any了 搞不定
  static Constructor<T extends BaseClassProxy>(constructor?: string): any {
    const self = this;

    return <C extends new (...args: any[]) => T>(
      value: C,
      context: ClassDecoratorContext
    ) => {
      if (context.kind === "class") {
        return class extends (value as new (...args: any[]) => BaseClassProxy) {
          constructor(...args: any[]) {
            super(...args);
            self._instance._exportHookCb.set(
              constructor ? constructor : String(context.name),
              this.attach.bind(this)
            );
          }
        };
      }

      return value;
    };
  }

  public static getInstance() {
    return NTQQLoader._instance;
  }
}

export { default as WrapperSession } from "./instances/wrapper-session";
