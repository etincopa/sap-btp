const { app, BrowserWindow, Tray, Menu, dialog, session } = require("electron");
var path = require("path");
var url = require("url");
var iconpath = path.join(__dirname, "/assets/icons/ship.ico");
// Global reference of the window object.
let mainWindow, loadingScreen;

const dialogOptions = {
    type: "info",
    buttons: ["OK"],
    message: "¿Desea cerrar la aplicación? Recuerde que tendrá que iniciar sesión nuevamente",
};

function flushCookiesStore(session) {
    session.cookies.flushStore((err) => {
        if (err) {
            console.log(err);
        }
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        show: false,
        icon: "assets/icons/ship.ico",
        webPreferences: {
            nodeIntegration: false,
            partition: "persist:main",
            devTools: false
        },
    });
    // Path to your index.html
    //app.commandLine.appendSwitch('--allow-cross-origin-auth-prompt')

    //mainWindow.openDevTools();

    var appIcon = new Tray(iconpath);
    appIcon.setToolTip("Informe de Flota");

    appIcon.on("double-click", () => {
        mainWindow.show();
    });

    var contextMenu = Menu.buildFromTemplate([
        {
            label: "Mostrar App",
            click: function () {
                mainWindow.show();
            },
        },
        {
            label: "Salir",
            click: function () {
                dialog.showMessageBox(dialogOptions, (i) => {
                    if (i === 0) {
                        app.isQuiting = true;
                        app.quit();
                    }
                });
            },
        },
    ]);

    appIcon.setContextMenu(contextMenu);

    mainWindow.on("close", function (event) {
        app.isQuiting = true;
        app.quit();
        // if (!app.isQuiting) {
        //     event.preventDefault();
        //     mainWindow.hide();
        // }

        // return false;
    });

    mainWindow.on("minimize", function (event) {
        event.preventDefault();
        mainWindow.minimize();
    });

    mainWindow.on("show", function () {
        /*
        const ses = mainWindow.webContents.session;
        var cookies = ses.cookies;

        ses.cookies.get({}, (error, cookies) => {
            console.log(error, cookies)
        })  */
        //appIcon.setHighlightMode('always')
    });

    /*
    mainWindow.webContents.on('did-start-navigation', function (event, newUrl) {
        const ses = mainWindow.webContents.session;
        //flushCookiesStore(ses);
        var cookies = ses.cookies;
        /*
        ses.cookies.get({}, (error, cookies) => {
            console.log(error, cookies)
         })  */
    /*
       cookies.on('changed', function (event, cookie, cause, removed) {
           if (cookie.session && !removed) {
               //var url = util.format('%s://%s%s', (!cookie.httpOnly && cookie.secure) ? 'https' : 'http', cookie.domain, cookie.path);
               const scheme = cookie.secure ? "https" : "http";
               const host = cookie.domain[0] === "." ? cookie.domain.substr(1) : cookie.domain;
               const url = scheme + "://" + host;
               console.log('url', url);
               cookies.set({
                   url: url,
                   name: cookie.name,
                   value: cookie.value,
                   domain: cookie.domain,
                   path: cookie.path,
                   secure: cookie.secure,
                   httpOnly: cookie.httpOnly,
                   expirationDate: (Math.floor(new Date().getTime()/1000)+1209600)/2
               }, function(err) {
                   if (err) {
                       console.log('Error trying to persist cookie');
                   }
               });
           }
       }); 
    
    }); */

    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, "/webapp/index.html"),
        })
    );

    mainWindow.webContents.on("did-finish-load", () => {
        mainWindow.maximize();
        mainWindow.show();

        if (loadingScreen) {
            //let loadingScreenBounds = loadingScreen.getBounds();
            //mainWindow.setBounds(loadingScreenBounds);
            loadingScreen.close();
        }
    });
}

function createLoadingScreen() {
    loadingScreen = new BrowserWindow(
        Object.assign(
            {
                width: 600,
                height: 310,
                show: false,
                frame: false,
                resizable: false,
            },
            { parent: mainWindow }
        )
    );
    loadingScreen.loadURL(
        url.format({
            pathname: path.join(__dirname, "/assets/loading.html"),
        })
    );
    loadingScreen.on("closed", () => (loadingScreen = null));
    loadingScreen.webContents.on("did-finish-load", () => {
        loadingScreen.show();
    });
}

app.on("ready", () => {
    createLoadingScreen();
    createWindow();
});

function setCookie(cookie) {
    if (cookie) {
        var cookies = mainWindow.webContents.session.cookies;

        const scheme = cookie.secure ? "https" : "http";
        const host = cookie.domain[0] === "." ? cookie.domain.substr(1) : cookie.domain;
        const url = scheme + "://" + host;
        console.log("url", url);

        cookies.set(
            {
                url: url,
                name: cookie.name,
                value: cookie.value,
                domain: cookie.domain,
                path: cookie.path,
                secure: cookie.secure,
                httpOnly: cookie.httpOnly,
                expirationDate: (Math.floor(new Date().getTime() / 1000) + 1209600) / 2,
            },
            function (err) {
                if (err) {
                    console.log("Error trying to persist cookie");
                }
            }
        );
    }
}

app.on("before-quit", () => {
    /*
    const ses = mainWindow.webContents.session;
    ses.cookies.get({}, (error, cookies) => {
        //console.log(error, cookies)
        if (cookies && cookies.length) {
            var iCount = 0;
            var index = cookies.length - 1;
            while (iCount < 4) {
                setCookie(cookies[index]);
                iCount++;
                index--;
            }
        }

    }) */
    flushCookiesStore(mainWindow.webContents.session);
});

app.on("browser-window-blur", () => {
    flushCookiesStore(mainWindow.webContents.session);
});
