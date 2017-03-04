var os = require('os');
var fs = require('fs');
var spawn = require('child_process').spawn;


module.exports = function (openwebspider)
{

    this.name = "pdf";

    var pdfFolder = global.__base_path + "plugins/pdf/";


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
        callback(responseObject.headers["content-type"].substr(0, 15) === "application/pdf");
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
        // 1. save the pdf
        var filename = pdfFolder + fileuid() + ".pdf";

        fs.writeFile(filename, data, "binary", function (err)
        {
            if (err)
            {
                console.log(err);
                callback();
            }
            else
            {
                // 2. exec pdftotext
                extractPDFText(filename, function (err, text)
                {
                    if (!err)
                    {
                        // 3. index the pdf
                        text = openwebspider.utils.onlyOneWhitespace(text);
                        openwebspider.dbManager.indexPage(urlObject["__hostID"],
                            urlObject["host"],
                            urlObject["path"],
                            /* title */ "",
                            urlObject["__anchorText"],
                            urlObject["__depth"],
                            /* content */ "",
                            text,
                            {}
                        );
                    }

                    // delete the tmp file
                    fs.unlink(filename);

                    callback();
                });
            }
        });
    };


    function fileuid()
    {
        function s4()
        {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return process.pid + "__" + s4() + s4() + '_' + s4() + s4();
    }


    function extractPDFText(filename, callback)
    {
        var output = "";
        var command = (os.platform() === "win32" ? pdfFolder : "" ) + "pdftotext";
        var child = spawn(command, [
            "-enc", "UTF-8",
            "-q",
            filename,
            "-"
        ]);
        child.stdout.setEncoding('utf8');
        child.stdout.on('data', function (data)
        {
            output += data;
        });

        child.on('exit', function (code)
        {
            if (code !== 0)
            {
                return callback(true);
            }
            callback(false, output);
        });
    }


    // *** init ***
    // this code is executed when the plugin is initialized
    // useful to read conf file, ...
    // ...
    console.log("Initializing plugin: ", this.name);

};
