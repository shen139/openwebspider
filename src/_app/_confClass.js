var fs = require("fs");


/** CONF Class
 *
 */
module.exports = function ()
{

    var __VERSION = {
        "MAJOR": 0,
        "MINOR": 2,
        "REVISION": 3
    };
    this.VERSION = __VERSION["MAJOR"] + "." + __VERSION["MINOR"] + "." + __VERSION["REVISION"];
    this.VERSION_NUMBER = __VERSION["MAJOR"] * 10000 + __VERSION["MINOR"] * 100 + __VERSION["REVISION"];
    // console.log( "VERSION_NUMBER: ", this.VERSION_NUMBER );

    var __CONF = {
        "DB_CONNECTION_TYPE"     : "mysql",
        "DB_CONNECTION_HOST"     : "127.0.0.1",
        "DB_CONNECTION_PORT"     : 3306,
        "DB_CONNECTION_USER"     : "root",
        "DB_CONNECTION_PASS"     : "root",
        "DB_CONNECTION_HOST_DB"  : "ows_hosts",
        "DB_CONNECTION_INDEX_DB" : "ows_index",

        "SINGLE_HOST_MODE"      : true,
        "ADD_EXTERNAL_HOSTS"    : false,
        "CONCURRENCY"           : 10,           // 10 concurrent http requests
        "CACHE_MODE"            : 0,            // 0 no, 1: OK, 2: Compressed
        "PAGES_MAP"             : 0,            // o: no, 1: base, 2: full

        "MAX_DEPTH"             : 3,
        "MAX_PAGES"             : 200,
        "MAX_PAGE_SIZE"         : 200,          //kb
        "MAX_SECONDS"           : null,

        "CRAWL_DELAY"           : 500,

        "INDEX_PAGES"           : true,
        "DELETE_DUP_PAGES"      : true,        // delete duplicate pages
        "UPDATE_MODE"           : false,

        "CRAWLER_NAME"          : "OpenWebSpider",

        "SOCKET_TIMEOUT"        : 2000,          // timeout in ms

        /* *** HISTORY *** */
        "HISTORY_WORKER_URL"    : null,
        "HISTORY_PAGESMAP_URL"  : null,
        "HISTORY_SEARCH_QUERY"  : null

    };


    var that = this;


    this.get = function (k, defaultValue)
    {
        return __CONF[k] === undefined ? defaultValue : __CONF[k];
    };


    this.getAll = function ()
    {
        // clone
        var copy = {};
        for (var attr in __CONF)
        {
            if (__CONF.hasOwnProperty(attr))
            {
                copy[attr] = __CONF[attr];
            }
        }
        return copy;
    };


    this.set = function (k, v)
    {
        // console.log("Setting: ", k, " >> ", v);
        __CONF[k] = v;
        return v;
    };


    this.setAll = function (obj)
    {
        for (var k in obj)
        {
            __CONF[k] = obj[k];
        }
    };


    this.stringify = function ()
    {
        return JSON.stringify(__CONF, null, "\t");
    };


    this.loadFile = function (callback)
    {
        fs.readFile(global.__base_path + "../conf/ows.conf",
            'utf8',
            function (err, data)
            {
                if (err)
                {
                    // file not found!
                    // NOP
                }
                else
                {
                    if(data.length > 5)
                    {
                        try
                        {
                            var obj = JSON.parse(data);
                            that.setAll(obj);
                        }
                        catch(e)
                        {}
                    }
                }

                callback(err);
            });

    };

};
