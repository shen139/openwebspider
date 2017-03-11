/**
 * Usage:
 *   $ node crawl_a_list.js urllist.txt
 *
 */
var fs = require('fs');
var http = require("http");


function indexList(urlList)
{
    var crawl_delay = 500 /* ms */;
    var currentURL = urlList.shift();
    if (currentURL)
    {
        currentURL = currentURL.trim();

        if (currentURL.length < 10)
        {
            return indexList(urlList);
        }

        console.log("Indexing [" + currentURL + "]...");

        http.request({
            "host": "127.0.0.1",
            "port": 9999,
            "path": "/index?u=" + new Buffer(currentURL).toString('base64')
        }, function (response)
        {
            response.on('data', function (){});
            response.on('end', function ()
            {
                setTimeout(function ()
                {
                    indexList(urlList);
                }, crawl_delay);
            });
        }).end();
    }
}


// --- main ---
var urlListFile = process.argv[2];

if (urlListFile)
{
    console.log("Parsing [" + urlListFile + "]...");

    fs.readFile(urlListFile,
        'utf8', function (err, data)
        {
            if (err)
            {
                console.log(err);
            }
            else
            {
                indexList(data.split("\n"));
            }
        });
}
else
{
    console.log("Invalid file");
    console.log("node crawl_a_list.js urllist.txt");
}
