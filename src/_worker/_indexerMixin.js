var url = require("url");

var logger = require("../_utils/logger");


module.exports = function ()
{
    var that = this;

    /** index
     *
     * @param urlObject
     * @param callback
     *
     */
    this.index = function (urlObject, callback)
    {
        var msg = urlObject.href.substring(0, 100);
        msg += "\n\t\t depth: " + urlObject["__depth"];

        var canFetchPage = this.canFetchSync(urlObject["path"]);

        if (!canFetchPage || that.stopSignal === true)
        {
            if (!canFetchPage)
            {
                msg += "\n\t\t blocked by robots.txt!";
            }
            else
            {
                msg += "\n\t\t stop signal!";
            }

            logger.log("index::url", msg);

            callback();
            return;
        }

        // calls the plugins' beforeGetPage
        that.pluginAsyncCall("beforeGetPage", [urlObject], /* all plugins */ null, function (ret)
        {
            var interestedPlugins = [], skipPage = false;

            for (var pluginName in ret)
            {
                if (ret[pluginName][0] === true)
                {
                    interestedPlugins.push(pluginName);
                }
                else if (ret[pluginName][0] === false && ret[pluginName][1] && ret[pluginName][1]["action"] === that.plugins_conts.PLUGIN_SKIP_PAGE)
                {
                    skipPage = true;
                    break;
                }
            }
            if (interestedPlugins.length === 0 || skipPage === true)
            {
                // none is interested in this page!
                msg += "\n\t\t page discarded by all plugins!";
                logger.log("index::url", msg);

                callback();
                return;
            }

            // prepare the pages map cache
            urlObject["__pagesMapCache"] = {};

            var startDownloadTime = new Date();
            that.getPage(urlObject, interestedPlugins, function (data, responseObject, stillInterestedPlugins)
            {
                var downloadedBytes = data ? data.length : 0;
                var msgSize;
                if (downloadedBytes < 2048)
                {
                    msgSize = downloadedBytes + " bytes";
                }
                else
                {
                    msgSize = (Math.floor(downloadedBytes / 1024)) + " kb";
                }
                msg += "\n\t\t downloaded " + msgSize + " in " + (new Date() - startDownloadTime) + " ms";

                if (responseObject)
                {
                    msg += "\n\t\t HTTP Status code: " + responseObject.statusCode + " -- Content-Type: " + responseObject.headers["content-type"];
                }

                // calls the plugins' indexPage
                if (data)
                {
                    that.pluginAsyncCall("beforeIndexPage", [urlObject, data, responseObject], stillInterestedPlugins, function (ret)
                    {
                        var interestedPlugins = [], skipPage = false;

                        for (var pluginName in ret)
                        {
                            if (ret[pluginName][0] === true)
                            {
                                interestedPlugins.push(pluginName);
                            }
                            else if (ret[pluginName][0] === false && ret[pluginName][1] && ret[pluginName][1]["action"] === that.plugins_conts.PLUGIN_SKIP_PAGE)
                            {
                                skipPage = true;
                                break;
                            }
                        }
                        if (interestedPlugins.length === 0 || skipPage === true)
                        {
                            // none is interested in this page!
                            msg += "\n\t\t page discarded by all plugins!";
                            logger.log("index::url", msg);

                            callback();
                            return;
                        }

                        msg += "\n\t\t plugin: " + stillInterestedPlugins.join(", ");

                        var startIndexTime = new Date();

                        that.pluginAsyncCall("indexPage", [urlObject, data, responseObject], stillInterestedPlugins, function ()
                        {
                            // page indexed!!!
                            that.indexedUrls++;
                            that.totalIndexedUrls++;

                            msg += "\n\t\t indexed in " + (new Date() - startIndexTime) + " ms";

                            // clean the pages map cache
                            urlObject["__pagesMapCache"] = {};

                            logger.log("index::url", msg);

                            callback();
                        });

                    });

                }
                else
                {
                    msg += "\n\t\t invalid or empty content!";
                    logger.log("index::url", msg);

                    callback();
                }
            });
        });
    };


    /*
     { protocol: 'http:',
     slashes: true,
     auth: null,
     host: 'www.test.com:90',
     port: '90',
     hostname: 'www.test.com',
     hash: null,
     search: null,
     query: null,
     pathname: '/asdasd',
     path: '/asdasd',
     href: 'http://www.test.com:90/asdasd' }
     */
    this.addURL = function (u, urlObject, anchorText, baseURL)
    {
        if (that.stopSignal === true || !u || u === "" ||
            (u && (u.substr(0, 1) === "#" || u.substr(0, 11) === "javascript:")))
        {
            return;
        }

        var resolvedUrl = that.removeBookmark(url.resolve(baseURL ? baseURL : urlObject.href, u));
        var parsedUrl = url.parse(resolvedUrl);

        if (parsedUrl["protocol"] !== "http:")
        {
            return;
        }

        // pages map
        if (that.CONF.get("PAGES_MAP") > 0)
        {
            // if same host or addHostMode: On
            if (parsedUrl["host"] === urlObject["host"] || that.CONF.get("ADD_EXTERNAL_HOSTS") === true)
            {
                if (!urlObject["__pagesMapCache"][parsedUrl.href])
                {
                    // not in cache: add it
                    that.pendingPagesMap.push({
                        "page": that.CONF.get("PAGES_MAP") == 2 ? urlObject["path"] : "/",
                        "linkedHost": parsedUrl["host"],
                        "linkedPage": that.CONF.get("PAGES_MAP") == 2 ? parsedUrl["path"] : "/",
                        "anchor": anchorText || ""
                    });

                    // add in cache
                    urlObject["__pagesMapCache"][parsedUrl.href] = true;
                }
            }
        }

        if (parsedUrl["host"] === urlObject["host"])
        {
            // same host
            if (!that.addedPagesMap[resolvedUrl])
            {
                // updates the cache
                that.addedPagesMap[parsedUrl.href] = true;

                if ((that.CONF.get("MAX_DEPTH") === null || urlObject["__depth"] < that.CONF.get("MAX_DEPTH")) &&
                    (that.CONF.get("MAX_PAGES") === null || that.addedUrls < that.CONF.get("MAX_PAGES")))
                {
                    parsedUrl["__hostID"] = urlObject["__hostID"];
                    parsedUrl["__depth"] = urlObject["__depth"] + 1;
                    parsedUrl["__status"] = 0;

                    if (anchorText !== undefined)
                    {
                        parsedUrl["__anchorText"] = anchorText;
                    }

                    that.pages.push(parsedUrl);
                    that.addedUrls++;
                }

            }
        }
        else
        {
            // external URL
            if (that.CONF.get("ADD_EXTERNAL_HOSTS") === true)
            {
                // stores the host
                that.pendingHosts[parsedUrl["host"]] = true;
            }
        }
    };


    this.onlyOneWhitespace = function (s)
    {
        if (!s)
        {
            return s;
        }
        return s.replace(/\s+/g, " ");
    };


    this.removeBookmark = function (u)
    {
        if (!u)
        {
            return u;
        }
        var sharpPos = u.indexOf("#");
        if (sharpPos > 0)
        {
            return u.substr(0, sharpPos);
        }
        return u;
    };

};
