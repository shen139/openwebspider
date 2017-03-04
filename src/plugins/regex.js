var fs = require('fs');


module.exports = function (openwebspider)
{

    this.name = "regex";

    var regexConfFile = global.__base_path + "plugins/regex/regex.conf";
    var regExps = {
        "host": null,
        "page": null,
        "content": null,
        "contentType": null
    };


    /**
     * Called when the worker quits
     *
     *
     * @param callback
     *
     */
    this.cleanup = function (callback)
    {
        // console.log("cleaning up: " + this.name);
        callback();
    };


    /**
     * Called after a new host is locked
     * the host will be skipped:
     *  - if all plugins will return false
     *  - if one or more plugins will return (false, {"action": openwebspider.const.PLUGIN_SKIP_HOST})
     *
     *
     * @param urlObject
     * @param callback
     *
     */
    this.afterLockHost = function (urlObject, callback)
    {
        if (regExps["host"])
        {
            // index only if it matches
            if (regExps["host"].test(urlObject.host) === false)
            {
                callback(false, {
                    "action": openwebspider.const.PLUGIN_SKIP_HOST
                });
                return;
            }
        }
        callback(true);
    };


    /**
     * Called before a URL is downloaded
     *
     * returning false the following callbacks won't be called for this plugin:
     *  - aroundGetPage
     *  - beforeIndexPage
     *  - indexPage
     *
     * the page will not be downloaded:
     *  - if all plugins will return false
     *  - if one or more plugins will return (false, {"action": openwebspider.const.PLUGIN_SKIP_PAGE})
     *
     *
     * @param urlObject
     * @param callback
     *
     */
    this.beforeGetPage = function (urlObject, callback)
    {
        if (regExps["page"])
        {
            // index only if it matches
            if (regExps["page"].test(urlObject.path) === false)
            {
                callback(false, {
                    "action": openwebspider.const.PLUGIN_SKIP_PAGE
                });
                return;
            }
        }
        callback(true);
    };


    /**
     * Called when the headers of the HTTP response are available
     * useful to get info like: content-type, content-length, ...
     *
     * returning false the following callbacks won't be called for this plugin:
     *  - beforeIndexPage
     *  - indexPage
     *
     * the page will not be indexed:
     *  - if all plugins will return false
     *  - if one or more plugins will return (false, {"action": openwebspider.const.PLUGIN_SKIP_PAGE})
     *
     *
     * @param urlObject
     * @param responseObject
     * @param callback
     *
     */
    this.aroundGetPage = function (urlObject, responseObject, callback)
    {
        if (regExps["contentType"])
        {
            // index only if it matches
            if (regExps["contentType"].test(responseObject.headers["content-type"]) === false)
            {
                callback(false, {
                    "action": openwebspider.const.PLUGIN_SKIP_PAGE
                });
                return;
            }
        }
        callback(true);
    };



    /**
     * Called after the page is downloaded but before it is indexed
     *
     * returning false the following callbacks won't be called for this plugin:
     *  - indexPage
     *
     * the page will not be indexed:
     *  - if all plugins will return false
     *  - if one or more plugins will return (false, {"action": openwebspider.const.PLUGIN_SKIP_PAGE})
     *
     *
     * @param urlObject
     * @param data
     * @param responseObject
     * @param callback
     *
     */
    this.beforeIndexPage = function (urlObject, data, responseObject, callback)
    {
        if (regExps["content"] && responseObject.headers["content-type"].substr(0, 5) === "text/")
        {
            // index only if it matches
            if (regExps["content"].test(data) === false)
            {
                callback(false, {
                    "action": openwebspider.const.PLUGIN_SKIP_PAGE
                });
                return;
            }
        }
        callback(true);
    };


    // *** init ***
    // this code is executed when the plugin is initialized
    // useful to read conf file, ...
    // ...
    console.log("Initializing plugin: ", this.name);

    // load conf file
    var data = fs.readFileSync(regexConfFile, {encoding: 'utf8'});
    if (data)
    {
        var obj = JSON.parse(data);
        for (var k in obj)
        {
            if (obj[k] === null)
            {
                regExps[k] = null;
            }
            else
            {
                regExps[k] = new RegExp(obj[k], "i");
            }
        }
    }

};
