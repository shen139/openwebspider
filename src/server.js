var url = require("url");
var http = require("http");
var finalhandler = require("finalhandler");
var serveStatic = require("serve-static");

var _confClass = require("./_app/_confClass");

global.__base_path = __dirname + "/";

var conf = new _confClass();
var banner = "" +
" _____             _ _ _     _   _____     _   _\n" +
"|     |___ ___ ___| | | |___| |_|   __|___|_|_| |___ ___\n" +
"|  |  | . | -_|   | | | | -_| . |__   | . | | . | -_|  _|\n" +
"|_____|  _|___|_|_|_____|___|___|_____|  _|_|___|___|_|\n" +
"      |_|                             |_|               v" + conf.VERSION + "\n\n";

console.log(banner);

var mirrorJS = require("./mirrorjs/mirror");
mirrorJS.widgets.controller.installAll();
var processManager = new (require("./_process/processManager"))();
var searchHandler = require("./search");
var indexerHandler = require("./ws/indexer");

var serve = serveStatic(global.__base_path);

var server = http.createServer(function (req, res)
{
    var done = finalhandler(req, res);

    var url_parts = url.parse(req.url, true);

    // handled requests
    if(url_parts.pathname === "/search")
    {
        searchHandler(req, res, url_parts.query, done);
    }
    else if(url_parts.pathname === "/index")
    {
        indexerHandler(req, res, url_parts.query, done);
    }
    else
    {
        // static files
        serve(req, res, done);
    }
});

var serverConf = mirrorJS.servers.readConf(global.__base_path + "../conf/server.conf", true);
var appParams = {
    "processManager": processManager
};
var owsAppServer = new mirrorJS.servers.SockJS(serverConf, appParams, server);

server.listen(serverConf["port"]);

console.log("openwebspider server: http://127.0.0.1:" + serverConf["port"] + "/");
