/*  This script is only intended for use during development so console.log statements
 are always executed. */

// eslint-disable-next-line no-unused-vars
module.exports = function ({ resources, options }) {
    console.log(
        "[Everis UI5 template] No olvides reemplazar la configuración " +
            "de los destinos SCP en 'lib/middleware/config/local.json'. Ver 'default.json'.\n"
    );
    
    process.env["NODE_CONFIG_DIR"] = __dirname + "/config";
    const config = require("config");
    const httpProxy = require("http-proxy");

    // Read config and start proxy
    const routing = config.get("proxy");
    const proxy = new httpProxy.createProxyServer();

    return function (req, res, next) {
        console.log("\n[New Connection]");

        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Credentials", "true");
        res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
        res.header(
            "Access-Control-Allow-Headers",
            "X-Requested-With, Accept, Origin, Referer, User-Agent, Content-Type, Authorization, X-Mindflash-SessionID"
        );
        // Intercept OPTIONS method
        if ("OPTIONS" === req.method) {
            res.header(200);
            console.log(req.method + "(options): " + req.url);
            next();
            return;
        }

        var dirname = req.url.replace(/^\/([^/]*).*$/, "$1"); //get root directory name eg sdk, app, sap
        const service = routing[dirname];

        if (!service) {
            console.log(req.method + ": " + req.url);
            next();
            return;
        }

        var sEntryPath = "";
        if (Object.prototype.hasOwnProperty.call(service, "entryPath")) {
            sEntryPath = service.entryPath;

            console.log("before entryPath: " + req.url);
            req.url = req.url.replace(dirname, sEntryPath).replace(/\/\/+/g, "/");
            console.log("after entryPath: " + req.url);
        }

        if (service.auth) {
            console.log("Authorization header added.");
            req.headers.Authorization = "Basic " + Buffer.from(service.auth).toString("base64");
        }

        const oOptions = {
            changeOrigin: true, // changeOrigin neccesary for HTTPS
            target: service.target,
        };

        console.log(
          req.method +
            " (redirect): " +
            "\n[req.hostname]: " +
            req.hostname +
            "\n[req.url]: " +
            req.url +
            "\n[theorical url]: " +
            routing[dirname].target +
            req.url +
            "\n[proxy target]:" +
            service.target
        );

        let cookies; // To store cookies for x-csrf-token requests
        // eslint-disable-next-line no-unused-vars
        proxy.on("proxyRes", function (proxyRes, req, res) {
            if (proxyRes.headers["x-csrf-token"]) {
                if (proxyRes.headers["set-cookie"] != undefined) {
                    cookies = proxyRes.headers["set-cookie"];
                }
            }
        });

        // eslint-disable-next-line no-unused-vars
        proxy.on("proxyReq", function (proxyReq, req, res) {
            // Allow cookies for SCP Workflow service
            if (
                proxyReq.path.includes("workflow-service") &&
                proxyReq._headers["x-csrf-token"] &&
                proxyReq._headers["x-csrf-token"] !== "Fetch"
            ) {
                if (cookies) {
                    proxyReq.setHeader("cookie", cookies);
                }
            }
        });

        proxy.web(req, res, oOptions, function (err) {
            if (err) {
                next(err);
            }
        });
    };
};
