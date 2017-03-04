var cheerio = require("cheerio");


module.exports = function (openwebspider)
{

    this.name = "html";


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
        callback(responseObject.headers["content-type"].substr(0, 5) === "text/");
    };


    var regExps = {
        "noindex": /noindex/i,
        "nofollow": /nofollow/i
    };


    /**
     * Called when the URL is downloaded and the content is available
     * When done the "callback" has to be called!
     *
     *
     * @param urlObject
     * @param data
     * @param responseObject
     * @param callback
     *
     */
    this.indexPage = function (urlObject, data, responseObject, callback)
    {
        try
        {
            var pageTitle = "",
                pageText = data,
                noindex = false,
                nofollow = false;

            if (urlObject["contentType"].substr(0, 9) === "text/html")
            {
                // HTML page
                // extract text and title

                /**
                 * cheerio.load(data.replace(/>/g, "> ")
                 * this workaround solves a problem with HTML like this:
                 * <table><tr><th><img src="/icons/blank.gif" alt="[ICO]"></th><th><a href="?C=N;O=D">Name</a></th><th><a href="?C=M;O=A">Last modified</a></th><th><a href="?C=S;O=A">Size</a></th><th><a href="?C=D;O=A">Description</a></th></tr><tr><th colspan="5"><hr></th></tr></table>
                 * where the extracted text is something like: "NameLast modifiedSizeDescription"
                 *
                 */
                var $ = cheerio.load(data.replace(/>/g, "> "), {
                    normalizeWhitespace: true,      // used to get much less "stuff"
                    lowerCaseTags: true,            // lower case tags
                    lowerCaseAttributeNames: true,  // lower case attrs
                    xmlMode: true,
                    decodeEntities: true
                });

                if (urlObject["isIndexed"] === false)
                {
                    $("script,noscript,style").remove();

                    pageTitle = openwebspider.utils.onlyOneWhitespace($("title").text());
                    pageText = openwebspider.utils.onlyOneWhitespace($("body").text());
                }

                var metaRobots = $('meta').filter(function ()
                {
                    return this.attribs.name && this.attribs.name.toLowerCase() == 'robots';
                }).attr("content");

                if (metaRobots !== undefined)
                {
                    if (regExps["noindex"].test(metaRobots) === true)
                    {
                        noindex = true;
                    }
                    if (regExps["nofollow"].test(metaRobots) === true)
                    {
                        nofollow = true;
                    }
                }

                if (!nofollow)
                {
                    // follow
                    var baseURL = $("base").attr("href");
                    getLinks($, urlObject, baseURL);
                }
            }

            if (!noindex && urlObject["isIndexed"] === false)
            {
                // index
                openwebspider.dbManager.indexPage(urlObject["__hostID"],
                    urlObject["host"],
                    urlObject["path"],
                    pageTitle,
                    urlObject["__anchorText"],
                    urlObject["__depth"],
                    data,
                    pageText,
                    {
                        /* contentType: urlObject["contentType"], */
                        response: {
                            headers: responseObject.headers
                        }
                    }
                );
            }
        }
        catch (e)
        {
            console.log("index::Exception:", e);
        }

        callback();
    };


    /** getLinks
     *
     * @param cheerioDOM DOM Element
     * @param urlObject parent URL
     * @param baseURL
     * @return {Array}
     *
     */
    function getLinks(cheerioDOM, urlObject, baseURL)
    {
        cheerioDOM("a").each(function (i, element)
        {
            openwebspider.addURL(cheerioDOM(element).attr("href"),
                urlObject,
                openwebspider.utils.onlyOneWhitespace(cheerioDOM(element).text()),
                baseURL
            );
        });

        // i/frames
        cheerioDOM("frame,iframe").each(function (i, element)
        {
            openwebspider.addURL(cheerioDOM(element).attr("src"),
                urlObject,
                undefined,
                baseURL);
        });
    }


    // *** init ***
    // this code is executed when the plugin is initialized
    // useful to read conf file, ...
    // ...
    console.log("Initializing plugin: ", this.name);

};
