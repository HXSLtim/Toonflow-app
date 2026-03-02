import { app, BrowserWindow, dialog } from "electron";
import path from "path";
import startServe, { closeServe } from "src/app";
import { number } from "zod";

// 默认端口配置
const defaultPort = 60000;

function createMainWindow(port: any): void {
  const win = new BrowserWindow({
    width: 900,
    height: 600,
    show: true,
    autoHideMenuBar: true,
  });
  // 开发环境和生产环境使用不同的路径
  const isDev = process.env.NODE_ENV === "dev" || !app.isPackaged;
  const htmlPath = isDev
    ? path.join(process.cwd(), "scripts", "web", "index.html")
    : path.join(app.getAppPath(), "scripts", "web", "index.html");
  
  // 使用实际端口构建地址
  const baseUrl = `http://localhost:${port}`;
  const wsBaseUrl = `ws://localhost:${port}`;
  
  // 构建带有 query 参数的 URL
  const url = new URL(`file://${htmlPath}`);
  url.searchParams.set("baseUrl", baseUrl);
  url.searchParams.set("wsBaseUrl", wsBaseUrl);
  
  console.log("%c Line:30 🥓 url", "background:#33a5ff", url.toString());

  void win.loadURL(url.toString());
}
app.whenReady().then(async () => {
  try {
    const port = await startServe(false);
    createMainWindow(port);
  } catch (err) {
    console.error("[服务启动失败]:", err);

    // 显示错误对话框
    const result = await dialog.showMessageBox({
      type: "error",
      title: "服务启动失败",
      message: "后端服务启动失败，应用可能无法正常工作",
      detail: `错误信息：${err instanceof Error ? err.message : String(err)}\n\n可能的原因：\n- 端口 ${defaultPort} 已被占用\n- 缺少必要的依赖\n- 权限不足`,
      buttons: ["重试", "退出"],
      defaultId: 0,
      cancelId: 1
    });

    if (result.response === 0) {
      // 用户选择重试
      app.relaunch();
      app.quit();
    } else {
      // 用户选择退出
      app.quit();
    }
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    // 重新激活时使用默认端口
    createMainWindow(defaultPort);
  }
});

app.on("before-quit", async (event) => {
  await closeServe();
});
