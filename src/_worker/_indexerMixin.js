var async = require('async');
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
        var interestedPlugins = [];
        msg += "\n\t\t depth: " + urlObject["__depth"];

        async.waterfall([
            function (next)
            {
                var canFetchPage = that.canFetchSync(urlObject["path"]);

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

                    return next(true);
                }
                next();
            },
            function (next)
            {
                that.pluginAsyncCall("beforeGetPage", [urlObject], /* all plugins */ null, function (ret)
                {
                    var skipPage = false;

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

                        next(true);
                    }
                    else
                    {
                        next();
                    }
                });
            },
            function (next)
            {
                // prepare the pages map cache
                urlObject["__pagesMapCache"] = {};

                // the page is not already indexed (in update mode)
                urlObject["isIndexed"] = false;

                if (that.CONF.get("UPDATE_MODE") === true)
                {
                    // gets ETag and last-modified from the Db
                    that.dbManager.getIndexedPageInfo(urlObject.__hostID, urlObject.path, function (err, info)
                    {
                        if (!err && info && info.length > 0)
                        {
                            urlObject["isIndexed"] = true;
                            urlObject["contentType"] = info[0]["contentType"];

                            if (info[0]["cache"])
                            {
                                // we can use the header ETag and Last-Modified only if we have the cached version of the page
                                urlObject['cache'] = info[0]["cache"].toString();

                                if (info[0]["ETag"])
                                {
                                    urlObject['ETag'] = info[0]["ETag"];
                                }
                                if (info[0]["lastModified"])
                                {
                                    urlObject['lastModified'] = info[0]["lastModified"];
                                }
                            }
                            else
                            {
                                msg += "\n\t\t WARN: Update mode needs the cached version of the page!";
                            }
                        }
                        next();
                    });
                }
                else
                {
                    next();
                }

            },
            function (next)
            {
                var startDownloadTime = new Date();
                that.getPage(urlObject, interestedPlugins, function (data, responseObject, stillInterestedPlugins)
                {
                    if (!responseObject)
                    {
                        msg += "\n\t\t invalid or empty content!";
                        return next(true);
                    }

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

                    if (responseObject.headers["content-type"])
                    {
                        urlObject["contentType"] = responseObject.headers["content-type"];
                    }

                    if (responseObject)
                    {
                        msg += "\n\t\t HTTP Status code: " + responseObject.statusCode + " -- Content-Type: " + urlObject["contentType"];
                    }

                    if (stillInterestedPlugins === undefined)
                    {
                        stillInterestedPlugins = interestedPlugins;
                    }

                    next(false, data, responseObject, stillInterestedPlugins);
                });
            },
            function (data, responseObject, stillInterestedPlugins, next)
            {
                // calls the plugins' indexPage
                if (data)
                {
                    // if the page is in cache: the cache is outdated and the page needs to be updated!
                    if (urlObject["isIndexed"] === true)
                    {
                        // deletes the page from the index
                        that.dbManager.deletePage(urlObject.__hostID, urlObject.path, function ()
                        {
                            // resets the isIndexed flag
                            urlObject["isIndexed"] = false;

                            // calls the plugins
                            next(false, data, responseObject, stillInterestedPlugins);
                        });
                    }
                    else
                    {
                        next(false, data, responseObject, stillInterestedPlugins);
                    }
                }
                else
                {
                    // data is empty (the page could be invalid or cached)!
                    if (that.CONF.get("UPDATE_MODE") === true && responseObject.statusCode === 304)
                    {
                        that.dbManager.setOutdatedStatus(urlObject.__hostID, urlObject.path, 0, function ()
                        {
                            msg += "\n\t\t page in cache";

                            if (urlObject['cache'] !== undefined)
                            {
                                data = urlObject['cache'];
                            }

                            next(false, data, responseObject, stillInterestedPlugins);
                        });
                    }
                    else
                    {
                        msg += "\n\t\t invalid or empty content!";
                        next(true);
                    }
                }
            },
            function (data, responseObject, stillInterestedPlugins, next)
            {
                that.pluginAsyncCall("beforeIndexPage", [urlObject, data, responseObject], stillInterestedPlugins, function (ret)
                {
                    var skipPage = false;

                    interestedPlugins.length = 0;

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

                        return next(true);
                    }

                    msg += "\n\t\t plugin: " + stillInterestedPlugins.join(", ");

                    next(false, data, responseObject, stillInterestedPlugins);

                });
            },
            function (data, responseObject, stillInterestedPlugins, next)
            {
                var startIndexTime = new Date();

                that.pluginAsyncCall("indexPage", [urlObject, data, responseObject], stillInterestedPlugins, function ()
                {
                    // page indexed!!!
                    that.indexedUrls++;
                    that.totalIndexedUrls++;

                    msg += "\n\t\t indexed in " + (new Date() - startIndexTime) + " ms";

                    next();
                });
            }
        ], function (err, results)
        {
            // free resources
            // clean the pages map cache
            urlObject["__pagesMapCache"] = {};
            // clean the cache
            urlObject['cache'] = null;

            logger.log("index::url", msg);

            callback(err, msg);
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
        if (that.pages === null || that.stopSignal === true || !u || u === "" ||
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
                    that.setPageBaseInfo(parsedUrl, urlObject["__hostID"], urlObject["__depth"] + 1, 0, anchorText);
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


    this.setPageBaseInfo = function (urlObject, hostID, depth, status, anchorText)
    {
        urlObject["__hostID"] = hostID || 0;
        urlObject["__depth"] = depth || 0;
        urlObject["__status"] = status || 0;
        urlObject["__anchorText"] = anchorText || "";
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
