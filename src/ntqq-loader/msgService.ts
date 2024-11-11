import { NTQQLoader } from "@/ntqq-loader";
import { log } from "console";
import { BaseClassProxy, MethodThis } from "@/proxy";

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
    log("sendMsg", args);
    return this.origin(...args);
  }
}
