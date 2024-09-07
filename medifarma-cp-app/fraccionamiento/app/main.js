// Modules to control application life and create native browser window
const { app, BrowserWindow } = require("electron");
const path = require("path");
const isDevelopment = false;
let splash;
__global = {};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", function () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nativeWindowOpen: true, // ADD THIS
    },
  });

  //1284 x 1024 convertido a 1027 x 819 80%
  // and load the index.html of the app.
  //mainWindow.loadFile('./app/index.html')
  //

  // create a new `splash`-Window
  splash = new BrowserWindow({
    autoHideMenuBar: true,
    transparent: false,
    frame: false,
    alwaysOnTop: true,
  });
  splash.loadFile("./app/loading.html");
  splash.show();
  splash.maximize();
  //splash.setFullScreen(true);
  mainWindow.loadFile("./app/index.html");

  // if main window is ready to show, then destroy the splash window and show up the main window
  mainWindow.once("ready-to-show", () => {
    const serverApp = require("./server/app");
    splash.destroy();
    mainWindow.show();
    if (!isDevelopment) {
      //mainWindow.setAlwaysOnTop(true);
      mainWindow.maximize();
      mainWindow.setFullScreen(true);
      //mainWindow.removeMenu();
    } else {
      mainWindow.maximize();
      //mainWindow.setFullScreen(true);
      //mainWindow.removeMenu();
      mainWindow.webContents.openDevTools();
    }
  });

  // Open the DevTools.
  //__global.aImpresoras = mainWindow.webContents.getPrinters();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  app.quit();
});

app.allowRendererProcessReuse = false;
