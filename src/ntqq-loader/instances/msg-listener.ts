import { NTQQLoader } from "@/ntqq-loader";
import { BaseClassProxy, MethodThis } from "@/proxy";

@NTQQLoader.Constructor()
export class NTMsgListener extends BaseClassProxy {
  private static _instance = new NTMsgListener();

  public constructor() {
    super();
  }

  public static getInstance() {
    return this._instance;
  }

  @NTQQLoader.MethodHook()
  public onRecvMsg(this: MethodThis<NTMsgListener>, ...args: any[]) {
    console.log(`onRecvMsg invokeType:${this.invokeType}`);
    console.log(`onRecvMsg msg:${JSON.stringify(args[0])}`);
    return this.origin(...args);
  }
}
