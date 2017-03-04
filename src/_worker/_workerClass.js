var url = require("url");

var conf = require("../_app/_confClass");
var logger = require("../_utils/logger");
var DbClass = require("../_db/_dbClass");


var _pluginMixin = require("./_pluginMixin");
var _httpMixin = require("./_httpMixin");
var _indexerMixin = require("./_indexerMixin");
var _robotstxtMixin = require("./_robotstxtMixin");
var _statusMixin = require("../_process/_statusMixin");


module.exports = function (/* UNUSED (yet)*/ crawler_id)
{
    var that = this;

    // inherits
    _pluginMixin.call(this);
    _statusMixin.call(this);
    _httpMixin.call(this);
    _indexerMixin.call(this);
    _robotstxtMixin.call(this);


    this.CONF = new conf();

    var workerIsRunning = false;
    var workerStarted = new Date();

    var startingHost = "";
    this.startingUrl = null;
    this.dbHostID = null;

    // list of pages to be indexed
    this.pages = [];

    // cache of added pages
    this.addedPagesMap = {};

    // structures used to temporary store hosts and pages map
    this.pendingHosts = {};
    this.pendingPagesMap = [];

    // *** counters ***
    this.indexedUrls = 0;
    this.addedUrls = 0;
    var parallelWorker = 0;
    this.downloadedBytes = 0;

    // *** totals ***
    this.totalIndexedUrls = 0;
    this.totalIndexedHosts = 0;

    var lastAccessedPage = null;

    this.dbManager = null;

    // *** signals ***
    this.stopSignal = false;    // stop current host ...
    this.quitSignal = false;    // ... and quits
    this.notifyEventsCallback = null;

    this.onEndCallback = null;


    /** start
     *
     * @param u URL
     * @param cb Callback
     *
     * @return {Boolean} If false: the worker is working!
     *
     */
    this.start = function (u, cb)
    {
        if (workerIsRunning === true)
        {
            cb && cb(false);
            return false;
        }
        workerIsRunning = true;

        // *** init ***
        workerStarted = new Date();
        that.updateStage(that.STAGE_CONF_ZERO);
        that.pages.length = 0;
        that.addedPagesMap = {};
        that.indexedUrls = 0;
        that.addedUrls = 0;
        that.downloadedBytes = 0;
        lastAccessedPage = new Date();
        that.startingUrl = null;
        startingHost = "";
        that.dbHostID = null;
        that.pendingHosts = {};
        that.pendingPagesMap.length = 0;
        that.onIndexingEndCallable = false;
        that.onEndCallback = cb;
        that.stopSignal = false;

        u = that.removeBookmark(u);

        if (that.dbManager === null)
        {
            that.dbManager = new DbClass(that.CONF);
        }

        // loading plugins...
        this.loadPlugins(function ()
        {
            // *** connects to the DB ***
            that.updateStage(that.STAGE_CONF_DB_CONNECT);
            that.dbManager.connect(function (err)
            {
                if (err)
                {
                    that.updateStage(that.STAGE_CONF_DB_ERROR);
                    that.cleanup();
                }
                else
                {
                    that.updateStage(that.STAGE_CONF_DB_OK);
                    that.stage2(u);
                }
            });
        });
    };


    this.stage2 = function (u)
    {
        var lockHost = null, lockPort = null, urlObj = null;
        if (u !== null)
        {
            urlObj = url.parse(u);
            lockHost = urlObj["host"];
            lockPort = urlObj["port"];
        }

        logger.log("worker", "stage2: locking host: " + u);
        that.dbManager.lockHost(lockHost, lockPort, function (err, host_id, lockedUrl)
        {
            if (err)
            {
                that.cleanup();
            }
            else
            {
                if (urlObj !== null)
                {
                    that.startingUrl = urlObj;
                }
                else
                {
                    u = lockedUrl;
                    that.startingUrl = url.parse(that.removeBookmark(lockedUrl));
                }
                that.startingUrl["__hostID"] = host_id;
                that.startingUrl["__depth"] = 0;
                that.startingUrl["__status"] = 0;
                startingHost = that.startingUrl["host"];
                that.dbHostID = host_id;

                logger.log("worker", "stage2: locked host: " + u);

                that.stage3(u);
            }
        });
    };

    this.stage3 = function (u)
    {
        that.pages.push(that.startingUrl);
        that.addedPagesMap[that.startingUrl.href] = true;

        logger.log("worker", "stage3: parsing robots.txt...");
        that.updateStage(that.STAGE_CONF_ROBOTSTXT);
        this.robotsTxtParse(that.startingUrl, function ()
        {
            logger.log("worker", "stage3: parsing robots.txt... OK! [crawldelay: " + that.crawlDelay + "]");
            that.onIndexingEndCallable = true;
            that.updateStage(that.STAGE_CONF_INDEXING);

            that.pluginAsyncCall("afterLockHost", [that.startingUrl], /* all plugins */ null, function (ret)
            {
                var interestedPlugins = [], skipHost = false;

                for (var pluginName in ret)
                {
                    if (ret[pluginName][0] === true)
                    {
                        interestedPlugins.push(pluginName);
                    }
                    else if (ret[pluginName][0] === false && ret[pluginName][1] && ret[pluginName][1]["action"] === that.plugins_conts.PLUGIN_SKIP_HOST)
                    {
                        skipHost = true;
                        break;
                    }
                }
                if (interestedPlugins.length === 0 || skipHost === true)
                {
                    // none is interested in this page!
                    logger.log("worker", "stage3: skip host!");

                    that.stopSignal = true;
                }

                that.mainLoop();
            });
        });

        return true;
    };

    this.nextHost = function ()
    {
        logger.log("worker", "Next host!");
        that.stopSignal = true;
    };

    this.stop = function ()
    {
        logger.log("worker", "Stop signal!");
        that.stopSignal = true;
        that.quitSignal = true;
        that.updateStage(that.STAGE_CONF_STOPPING);
    };


    this.cleanup = function ()
    {
        // on exit:
        logger.log("worker", "Cleanup!");

        // 1. calls plugins' cleanup
        that.pluginAsyncCall("cleanup", /* arguments */ null, /* all plugins */ null, function ()
        {
            // 2. close DB connection
            that.dbManager && that.dbManager.close();
            that.dbManager = null;

            // 3. reset status
            workerIsRunning = false;

            // 4. call the callback once (if defined)
            that.onEndCallback && that.onEndCallback(true);
            that.onEndCallback = null;
        });
    };


    // used to call the callback once
    this.onIndexingEndCallable = false;
    this.onIndexingEnd = function ()
    {
        if (that.onIndexingEndCallable === false)
        {
            return;
        }
        that.onIndexingEndCallable = false;

        // increment the number of total hosts indexed!
        that.totalIndexedHosts++;

        // unlock the host
        logger.log("worker", "unlocking host");
        that.dbManager.updateHostStatus(that.dbHostID, /* Status: Indexed! */ 1);

        if (that.CONF.get("DELETE_DUP_PAGES", true) === true)
        {
            // delete duplicate pages
            logger.log("worker", "deleting duplicate pages");
            that.dbManager.deleteDuplicatePages(that.dbHostID);
        }

        logger.log("worker", "saving hosts");
        that.dbManager.saveHosts(Object.keys(that.pendingHosts), function ()
        {

            logger.log("worker", "saving pages map");
            that.dbManager.savePagesMap(that.dbHostID, that.startingUrl, that.pendingPagesMap, function ()
            {
                if (that.quitSignal === false && that.CONF.get("SINGLE_HOST_MODE", true) === false)
                {
                    // start with another host
                    // waits 250ms and starts from scratch
                    setTimeout(function ()
                    {
                        workerIsRunning = false;
                        that.start(null, that.onEndCallback);
                    }, 250);
                    logger.log("worker", "restarting...");
                }
                else
                {
                    // single host mode or quit signal: we've done!
                    that.cleanup();
                }
            });
        });
    };


    /** mainLoop
     *
     */
    this.mainLoop = function ()
    {
        if (that.stopSignal === false && that.CONF.get("MAX_SECONDS") !== null && (new Date() - workerStarted) / 1000 > that.CONF.get("MAX_SECONDS"))
        {
            logger.log("worker", "Max seconds [" + Math.floor((new Date() - workerStarted) / 1000) + "]!");
            that.stopSignal = true;
        }

        while (that.stopSignal === false && that.pages.length > 0 && parallelWorker < that.CONF.get("CONCURRENCY"))
        {
            if (that.crawlDelay !== null)
            {
                var timeLapse = new Date() - lastAccessedPage;
                if (timeLapse < that.crawlDelay)
                {
                    // call the main loop
                    var callAt = that.crawlDelay - timeLapse;
                    setTimeout(that.mainLoop, callAt);
                    return;
                }
            }

            parallelWorker++;
            (function (p)
            {
                // aggiorna immediatamente la variabile dell'ultimo accesso per evitare che altri "worker" vengano eseguiti
                lastAccessedPage = new Date();
                setTimeout(function ()
                {
                    that.index(p, function ()
                    {
                        parallelWorker--;
                        setTimeout(that.mainLoop, 100);
                    });
                }, 200);
            })(that.pages.shift());
        }

        if (parallelWorker === 0 && (that.pages.length === 0 || that.stopSignal === true))
        {
            that.onIndexingEnd();
        }
    };


    this.getInfo = function ()
    {
        return {
            "startingHost": startingHost,
            "pages": {
                "pending": that.pages.length,
                "indexed": that.indexedUrls,
                "totalHosts": that.totalIndexedHosts,
                "totalUrls": that.totalIndexedUrls
            },
            "subWorkers": parallelWorker,
            "lastAccessedPage": ( lastAccessedPage !== null ? new Date() - lastAccessedPage : null ),
            "stage": that.getStage(),
            "started": workerStarted,
            "downloadedBytes": that.downloadedBytes
        };
    };

};
