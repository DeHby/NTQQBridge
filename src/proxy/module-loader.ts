import { createGetProxy, proxyDlopen } from "./common";

export abstract class ModuleLoader {

  constructor(moduleName: string) {
    this._moduleLoader(moduleName);
  }

  protected abstract _exportLoader(exportName: string, exportObject: any): any;

  private _moduleLoader(moduleName: string) {
    proxyDlopen(moduleName, (moduleExports) => {
      // TODO: 目前只用到导出的函数(class)
      // 如需object,后期修改filter即可
      return createGetProxy(
        moduleExports,
        (exportName, exportObject) => {
          return this._exportLoader(exportName, exportObject);
        },
        "function"
      );
    });
  }
}
