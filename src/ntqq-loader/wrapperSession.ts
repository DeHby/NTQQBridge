import { BaseClassProxy, MethodThis } from "@/proxy";
import { NTQQLoader } from "@/ntqq-loader";
import { log } from "console";

import { NTMsgService } from "./msgService";

@NTQQLoader.Constructor("NodeIQQNTWrapperSession.create")
class WrapperSession extends BaseClassProxy {
  public static _instance = new WrapperSession();

  // 禁止主动实例化
  private constructor() {
    super();
  }

  public getMsgService(): NTMsgService | undefined;
  @NTQQLoader.MethodHook()
  @NTQQLoader.AttachClass(NTMsgService)
  public getMsgService(this: MethodThis<WrapperSession>, ...args: any[]) {
    log("getMsgService");
    return this.origin(...args);
  }
}

export default WrapperSession._instance;
