import { log, trace } from "console";
import { WrapperSession } from "@/ntqq-loader/index";
import { NTMsgService } from "@/ntqq-loader/msgService";


async function main() {
  try {
    WrapperSession.getMsgService().sendMsg(
      "0",
      { chatType: 2, peerUid: "", guildId: "" },
      [
        {
          elementType: 1,
          elementId: "",
          textElement: {
            content: "你好家人们",
            atType: 0,
            atUid: "",
            atTinyId: "",
            atNtUid: "",
          },
        },
      ],
      new Map()
    )
  } catch (error) {
    console.log(error);
  }
}


