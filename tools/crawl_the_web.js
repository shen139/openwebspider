/**
 * Usage:
 *   $ node crawl_the_web.js http://www.example.com/
 *
 */
var http = require("http");
var foundPages = {};
var pendingURLs = [];


function indexList()
{
    var crawl_delay = 500 /* ms */;
    var currentURL = pendingURLs.shift();
    if (currentURL)
    {
        currentURL = currentURL.trim();

        if (currentURL.length < 10)
        {
            return indexList();
        }

        console.log("Indexing [" + currentURL + "]...");

        http.request({
            "host": "127.0.0.1",
            "port": 9999,
            "path": "/index?u=" + new Buffer(currentURL).toString('base64')
        }, function (response)
        {
            var strResponse = '';
            response.on('data', function (chunk)
            {
                strResponse += chunk;
            });
            response.on('end', function ()
            {
                var responseObj = JSON.parse(strResponse);

                if (responseObj && responseObj.links)
                {
                    responseObj.links.map(function (linkObj)
                    {
                        var link = "http://" + linkObj.host + linkObj.path;
                        if (foundPages[link] === undefined)
                        {
                            pendingURLs.push(link);
                            foundPages[link] = true;
                        }
                    });
                }

                setTimeout(function ()
                {
                    indexList();
                }, crawl_delay);
            });
        }).end();
    }
}


// --- main ---
var startingURL = process.argv[2];
if (startingURL)
{
    pendingURLs.push(startingURL);
    foundPages[startingURL] = true;

    indexList();
}
else
{
    console.log("Invalid starting URL");
    console.log("node crawl_the_web.js \"http://www.example.com/\"");
}
