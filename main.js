const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const net = require("net");
const fs = require("fs");

let backendProcess;

function checkBackendRunning(port, timeout = 5000) {
  return new Promise((resolve) => {
    const start = Date.now();
    const check = () => {
      const socket = net.createConnection(port, "127.0.0.1");
      socket.once("connect", () => {
        socket.destroy();
        resolve(true);
      });
      socket.once("error", () => {
        socket.destroy();
        if (Date.now() - start > timeout) resolve(false);
        else setTimeout(check, 300);
      });
    };
    check();
  });
}

async function createWindow() {
  const win = new BrowserWindow({
    width: 1900, // 💡 Similar to fullscreen but adjustable
    height: 1080,
    fullscreen: false, // ❌ no fullscreen
    frame: true,        // ✅ shows title bar with X, ⬜, ➖
    autoHideMenuBar: true, // hides the default menu (File, Edit, etc.)
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Start backend process
  const backendPath = path.join(process.resourcesPath, "app", "backend", "server.js");
  const devBackendPath = path.join(__dirname, "backend", "server.js");
  const serverFile = fs.existsSync(backendPath) ? backendPath : devBackendPath;

  console.log("Starting backend from:", serverFile);

  backendProcess = spawn("node", [serverFile], {
    shell: true,
    env: { ...process.env, PORT: 5000 },
  });

  backendProcess.stdout.on("data", (data) => console.log(`BACKEND: ${data}`));
  backendProcess.stderr.on("data", (data) => console.error(`BACKEND ERR: ${data}`));

  // Wait until backend is ready
  const backendReady = await checkBackendRunning(5000, 8000);
  if (backendReady) {
    console.log("✅ Backend is running on port 5000");
  } else {
    console.error("❌ Backend failed to start in time");
  }

  // Load React build
  const frontendPath = path.join(__dirname, "frontend", "build", "index.html");
  win.loadFile(frontendPath);

  // When ready, maximize window
  win.once("ready-to-show", () => {
    win.maximize();
    win.show();
  });

  // Cleanup when closed
  win.on("closed", () => {
    if (backendProcess) backendProcess.kill();
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    if (backendProcess) backendProcess.kill();
    app.quit();
  }
});
