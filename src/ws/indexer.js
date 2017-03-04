var url = require("url");
var async = require('async');

var indexerClass = require("../_worker/_indexerClass");

var conf = new (require("../_app/_confClass"))();

/* reads the conf file only one time at startup;
 * so if you modify it: you have to reload the application server
 * (this is not a bug, this is an optimization!) :)
 */
conf.loadFile();


/**
 * Sample URL: http://127.0.0.1:9999/index?u=aHR0cDovL3d3dy5leGFtcGxlLmNvbTo4MDgwL3Rlc3Q_cXM9MTIzNA==
 *
 * @param req
 * @param res
 * @param queryStringObj
 * @param done
 */
module.exports = function (req, res, queryStringObj, done)
{
    res.setHeader("Content-Type", "application/json");

    var decodedUrl = null;
    var errorMessage = null;
    var parsedUrl = null;
    var retObj = {
        'status': null,
        'error': null
    };
    try
    {
        decodedUrl = new Buffer(queryStringObj["u"] || "", 'base64').toString();
        parsedUrl = url.parse(decodedUrl);
    }
    catch (e)
    {
        decodedUrl = null;
        errorMessage = e.message;
    }

    if (parsedUrl && parsedUrl["host"] && parsedUrl["path"])
    {
        retObj['status'] = 'ok';
        retObj['host'] = parsedUrl["host"];
        retObj['path'] = parsedUrl["path"];
        retObj['error'] = null;

        var indexer = new indexerClass();
        indexer.CONF.setAll(conf.getAll());

        // disables useless conf
        indexer.CONF.set("SINGLE_HOST_MODE", true);
        indexer.CONF.set("ADD_EXTERNAL_HOSTS", false);
        indexer.CONF.set("PAGES_MAP", 0);
        indexer.CONF.set("MAX_DEPTH", 0);
        indexer.CONF.set("MAX_PAGES", 1);
        indexer.CONF.set("CRAWL_DELAY", null);
        indexer.CONF.set("INDEX_PAGES", true);
        indexer.CONF.set("DELETE_DUP_PAGES", false);
        indexer.CONF.set("UPDATE_MODE", true);
        var cacheMode = indexer.CONF.get("CACHE_MODE");
        indexer.CONF.set("CACHE_MODE", cacheMode || 1);

        return indexer.init(function (err)
        {
            if (err)
            {
                retObj['status'] = 'ko';
                retObj['error'] = err.message;
                res.end(JSON.stringify(retObj));
            }
            else
            {
                return async.waterfall([
                    function (next)
                    {
                        indexer.dbManager.lockHost(parsedUrl["host"], parsedUrl["port"], function (err, host_id, lockedUrl)
                        {
                            next(err, host_id);
                        });

                    },

                    function (host_id, next)
                    {
                        // sets base page info
                        indexer.setPageBaseInfo(parsedUrl, host_id);

                        indexer.index(parsedUrl, function (err, msg)
                        {
                            if (err)
                            {
                                retObj['status'] = 'ko';
                                retObj['error'] = msg;
                            }
                            next(false);
                        });
                    },

                    function (next)
                    {
                        indexer.dbManager.updateHostStatus(parsedUrl['__hostID'], /* Status: Indexed! */ 1, function ()
                        {
                            next(false);
                        });
                    },

                    function (next)
                    {
                        indexer.finalize();
                        next(false);
                    }
                ], function (err)
                {
                    res.end(JSON.stringify(retObj));
                });
            }
        });
    }
    else
    {
        retObj['status'] = 'ko';
        retObj['error'] = errorMessage || "Invalid URL";
    }

    res.end(JSON.stringify(retObj));
};
