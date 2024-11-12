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
          client.write(argArray[0]);
          return Reflect.apply(target, thisArg, argArray);
        },
      });
    const client = createConnection({ path: PIPE_NAME }, () => {
      console.log("connected to Pipe");
      process.stdout.write = createNewOutputStream(process.stdout.write);
      process.stderr.write = createNewOutputStream(process.stderr.write);
    });

    // 连不上默认不处理
    client.on("error", (err) => {});
  }
}
