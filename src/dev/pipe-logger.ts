import { createConnection, createServer, Socket } from "net";

if (!process.env.TEST) {
  const PIPE_NAME = "\\\\.\\pipe\\mnt_debug";

  if (process.env.DEBUG) {
    const server = createServer(function (socket) {
      socket.on("close", function () {});
      socket.on("data", function (data) {
        process.stdout.write(data);
      });
    });

    server.listen(PIPE_NAME);
  } else {
    let remainLog: Array<any> = [];
    let connectStatus = 0;
    const createNewOutputStream = (_origin) =>
      new Proxy(_origin, {
        apply(
          target,
          thisArg,
          argArray: [
            str: Uint8Array | string,
            encoding: BufferEncoding,
            cb: (error: Error | null | undefined) => void,
          ]
        ) {
          switch (connectStatus) {
            case 0:
              remainLog.push(argArray[0]);
              break;
            case 1:
              client.write(argArray[0]);
              break;
          }
          return Reflect.apply(target, thisArg, argArray);
        },
      });
    process.stdout.write = createNewOutputStream(process.stdout.write);
    process.stderr.write = createNewOutputStream(process.stderr.write);
    const client = createConnection({ path: PIPE_NAME }, () => {
      console.log("connected to Pipe");
      connectStatus = 1;
      if (remainLog.length > 0) {
        remainLog.forEach((v) => {
          client.write(v);
        });
        remainLog = [];
      }
    });

    // 连不上默认不处理
    client.on("error", (err) => {
      connectStatus = 2;
      remainLog = [];
    });
  }
}
