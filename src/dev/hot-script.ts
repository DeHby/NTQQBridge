import { log, trace } from "console";
import { WrapperSession } from "@/ntqq-loader/index";
import { NTMsgService } from "@/ntqq-loader/msgService";

async function main() {
  try {
    const MsgServer = WrapperSession.getMsgService();
    if (MsgServer) {
      MsgServer.sendMsg(
        "0",
        { chatType: 2, peerUid: "981833072", guildId: "" },
        [
          {
            elementType: 1,
            elementId: "",
            textElement: {
              content: "123456",
              atType: 0,
              atUid: "",
              atTinyId: "",
              atNtUid: "",
            },
          },
        ],
        new Map()
      );
    } else {
      console.log("实例不存在");
    }
  } catch (error) {
    console.log(error);
  }
}

main();
