import { app as o, BrowserWindow as t } from "electron";
import { fileURLToPath as l } from "node:url";
import n from "node:path";
const s = n.dirname(l(import.meta.url));
process.env.APP_ROOT = n.join(s, "..");
const i = process.env.VITE_DEV_SERVER_URL, u = n.join(process.env.APP_ROOT, "dist-electron"), r = n.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = i ? n.join(process.env.APP_ROOT, "public") : r;
let e;
const a = o.requestSingleInstanceLock();
a ? o.on("second-instance", (d, m, p) => {
  e && (e.isMinimized() && e.restore(), e.focus());
}) : o.quit();
function c() {
  if (e && !e.isDestroyed()) {
    e.focus();
    return;
  }
  e = new t({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    maximizable: !0,
    minimizable: !0,
    fullscreenable: !0,
    icon: n.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: n.join(s, "preload.mjs")
    }
  }), e.maximize(), e.on("closed", () => {
    e = null;
  }), e.webContents.on("did-finish-load", () => {
    e == null || e.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), i ? e.loadURL(i) : e.loadFile(n.join(r, "index.html"));
}
o.on("window-all-closed", () => {
  process.platform !== "darwin" && (o.quit(), e = null);
});
o.on("activate", () => {
  t.getAllWindows().length === 0 && c();
});
o.whenReady().then(c);
export {
  u as MAIN_DIST,
  r as RENDERER_DIST,
  i as VITE_DEV_SERVER_URL
};
