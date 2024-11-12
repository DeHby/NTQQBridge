# Monitor NTQQ

**NTQQ 开发框架，适用于自动化、机器人等场景的解决方案**

**实现原理：通过注入 JavaScript 代码至 NTQQ 的入口，劫持 `wrapper.node` 的 `export` 对象实现主动调用/被动监听，实现发送消息、监听消息等功能**

---

## 特性

- **轻松注入：通过注入 JS 代码，轻松 Hook NTQQ。**
- **主动调用/被动监听：支持消息发送、消息监听等功能。**
- **支持装饰器：使用 TypeScript 装饰器简化 Hook 操作。**

---

## 注意事项

1. **开发阶段：项目仍在开发中，功能可能会有变动。**
2. **手动注入：本项目不提供注入方式，你需要自行实现。**
3. **代码编写能力：需要具备一定的开发能力（Node.js && TypeScript）**

---

## 开发环境

- **TypeScript 5.6.3**

### 命令

- **dev --- 开发测试代码 仅运行 `/dev/test.ts` 代码**
- **build --- 编译项目**
- **clean --- 清理编译文件**
- **debug --- 接收调试日志**

---

## 上手指南

1. **项目编译后将 NTQQ 的代码入口引导至`./dist/index.js`，需要在 wrapper.node 模块加载前被执行**
2. **现大多 NTQQ 开源框架流行的注入方式：修改`../resources/app/package.json` 内的 main 配置进行引导**

---

## 装饰器

### @NTQQLoader.Constructor

- #### 功能
  **`@NTQQLoader.Constructor`是一个 类装饰器，用于 Hook NTQQ 类实例的构造函数入口。通过这个装饰器，可以在 NTQQ 类实例化时，执行自定义逻辑，实现对类实例的构造过程进行拦截和处理。**
- #### 参数
  **ConstructorName(可选): `export` 对象实例构造路径/自定义标识入口,默认为当前自定义处理类的类名**
- #### 使用场景
  **1.用于自动 Hook/Attach 至自定义处理类通过 `export` 对象进行标准化 `create/get` 实例构造的NTQQ 类**
  ```typescript
  @NTQQLoader.Constructor("NodeIQQNTWrapperSession.create")
  class WrapperSession extends BaseClassProxy {}
  ```
  **2.支持非标准实例化：特别适合那些无法通过 `export` 顶层对象直接 `create` 或 get 实例的情况。例如，通过静态方法（如 `NodeIQQNTWrapperSession.getMsgService`）获取的实例**
  ```typescript
  @NTQQLoader.Constructor() // default "Custom"
  class Custom extends BaseClassProxy {}
  ```
- #### 使用要求
  **使该装饰器的类必须为`BaseClassProxy`的子类**

### @NTQQLoader.MethodHook

- #### 功能
  **`@NTQQLoader.MethodHook`是一个 方法装饰器，用于 Hook NTQQ 类的方法。在方法调用时拦截执行，提供 origin（原始函数）和 method（原始方法名）作为参数，使得开发者可以在调用前后执行自定义逻辑。**
- #### 参数
  **MethodName（可选）：指定需要 Hook 的原始方法名。如果不传递此参数，默认使用当前被装饰的方法名。**
- #### 使用场景

  **1.拦截和增强方法功能：适用于在调用方法之前或之后进行日志记录、权限校验、参数处理等。**

  ```typescript
  @NTQQLoader.Constructor() // // default "NTMsgService"
  export class NTMsgService extends BaseClassProxy {
    private static _instance = new NTMsgService();

    public constructor() {
      super();
    }

    public static getInstance() {
      return this._instance;
    }

    @NTQQLoader.MethodHook()
    public sendMsg(this: MethodThis<NTMsgService>, ...args: any[]) {
      args[0].content = "Hello!";
      return this.origin(...args);
    }
  }
  ```

  **2.当方法签名内使用本类This时,支持主动调用**

  ```typescript
  @NTQQLoader.Constructor()
  export class NTMsgService extends BaseClassProxy {
    private static _instance = new NTMsgService();

    public constructor() {
      super();
    }

    public static getInstance() {
      return this._instance;
    }

    public sendMsg(...args: any[]): any;
    @NTQQLoader.MethodHook()
    public sendMsg(this: MethodThis<NTMsgService>, ...args: any[]) {
      if(CallerType.Manual === this.invokeType)
      {
        // 来自主动调用
        return "恭喜你调用成功";
      }
      return this.origin(...args);
    }
  }
  // 主动调用原始方法
  NTMsgService.getInstance().sendMsg(......);
  ```

- #### 使用要求
  **依赖 `@NTQQLoader.Constructor` 装饰器：`@NTQQLoader.MethodHook` 装饰的方法所属类，必须使用 `@NTQQLoader.Constructor` 进行装饰，确保在类实例化时，Hook 机制能够正确生效。**

### @NTQQLoader.AttachClassWithArg
- #### 功能
  **`@NTQQLoader.AttachClassWithArg` 是一个方法装饰器，主要用于将类方法传入的指定参数实例对象绑定到自定义处理类上。适用于那些无法直接通过 `export` 顶层对象进行构造或 `create/get` 方法实例化的类或者某些用于添加回调事件对象的方法。**
- #### 参数
  **target：用于绑定对象的`BaseClassProxy`子类**
  **indexOfArg：方法参数索引**
- #### 使用场景

  **1.通过返回值进行非标准实例化处理：某些类无法通过 `export` 直接实例化，也没有标准的 `create/get` 方法。这类实例通常无法直接通过 `@NTQQLoader.Constructor` 进行拦截和 Hook，它们在一些类方法的返回值内，即可以使用该装饰器实现返回值自动绑定**

  **2.`@NTQQLoader.AttachClassWithArg` 允许通过类方法的参数实例对象，自动绑定到指定的自定义处理类上，实现对实例的进一步 Hook 和控制。**

  ```typescript
  @NTQQLoader.Constructor()
  class NTMsgListener extends BaseClassProxy {
    public constructor() {
      super();
    }

    @NTQQLoader.MethodHook()
    public onRecvMsg(this: MethodThis<NTMsgListener>, ...args: any[])....
  }

  @NTQQLoader.MethodHook()
  @NTQQLoader.AttachClass(NTMsgListener, 0) // indexOfArg：0
  public addKernelMsgListener(this: MethodThis<NTMsgService>, listener:any) {
    return this.origin(listener);
  }
  ```

- #### 使用要求
  **与 `@NTQQLoader.MethodHook` 联合使用：通常需要结合 `@NTQQLoader.MethodHook`，在方法级别进行拦截，并对目标实例对象进行处理。**

### @NTQQLoader.AttachClassWithRet
- #### 功能
  **`@NTQQLoader.AttachClassWithRet` 是一个方法装饰器，主要用于将类方法返回的实例对象绑定到自定义处理类上。适用于那些无法直接通过 `export` 顶层对象进行构造或 `create/get` 方法实例化的类或者某些用于添加回调事件对象的方法。**
- #### 参数
  **target：用于绑定对象的`BaseClassProxy`子类**
- #### 使用场景

  **1.通过参数进行非标准实例化处理：某些类无法通过 `export` 直接实例化，也没有标准的 `create/get` 方法。这类实例通常无法直接通过 `@NTQQLoader.Constructor` 进行拦截和 Hook，它们在一些类方法的参数内，即可以使用该装饰器实现通过参数自动绑定，同时不影响原本的`MethodHook`执行流程**

  **2.`@NTQQLoader.AttachClassWithArg`(`AttachClass`) 允许通过类方法的参数实例对象，自动绑定到指定的自定义处理类上，实现对实例的进一步 Hook 和控制。**

  ```typescript

  @NTQQLoader.Constructor("NodeIQQNTWrapperSession.create")
  class WrapperSession extends BaseClassProxy {
    @NTQQLoader.MethodHook()
    @NTQQLoader.AttachClassWithArg(NTMsgService) // 实例返回后自动附加至NTMsgService自定义处理类
    public getMsgService(
      this: MethodThis<WrapperSession>,
      ...args: any[]
    ) {
      return this.origin(...args);
    }
  }

  @NTQQLoader.Constructor() // default "NTMsgService"
  export class NTMsgService extends BaseClassProxy {
  // 必须是public
    public constructor() {
      super();
    }
    @NTQQLoader.MethodHook()
    .....
  }
  ```


- #### 使用要求
  **与 `@NTQQLoader.MethodHook` 联合使用：通常需要结合 `@NTQQLoader.MethodHook`，在方法级别进行拦截，并对目标实例对象进行处理。**


---

## 版权声明

**该项目签署了 AGPL-3 授权许可，详情请参阅 [LICENSE](./LICENSE)**
