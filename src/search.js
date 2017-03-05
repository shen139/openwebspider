var fs = require("fs");
var entities = new (require("html-entities").XmlEntities)();

var conf = new (require("./_app/_confClass"))();

/* reads the conf file only one time at startup;
 * so if you modify it: you have to reload the application server
 * (this is not a bug, this is an optimization!) :)
 */
conf.loadFile(function ()
{
    dbManager = new (require("./_db/_dbClass"))(conf);
});
var searchHTMLPageTemplate = "";
fs.readFile(global.__base_path + "ui/search.html", function (err, buf)
{
    if (!err)
    {
        searchHTMLPageTemplate = buf.toString();
    }
});


var resultTemplate = "";
fs.readFile(global.__base_path + "ui/result.html", function (err, buf)
{
    if (!err)
    {
        resultTemplate = buf.toString();
    }
});


module.exports = function (req, res, queryStringObj, done)
{
    var query = queryStringObj["q"] || "";
    if (queryStringObj["t"] === "json")
    {
        res.setHeader("Content-Type", "application/json");

        getJSONResult(query, function (buf)
        {
            res.end(buf);
        });
    }
    else
    {
        res.setHeader("Content-Type", "text/html");

        searchPage(query, function (buf)
        {
            res.end(buf);
        });
    }


    function searchPage(query, callback)
    {
        var buf = searchHTMLPageTemplate.replace(/<!-- query -->/g, entities.encode(query));

        if (query !== "")
        {
            var start = new Date();
            getResults(query, function (results)
            {
                // console.log("results: ", results);

                buf = buf.replace("<!-- results -->", resultsToHTML(results, new Date() - start));

                callback(buf);
            });
        }
        else
        {
            callback(buf);
        }
    }


    function getResults(query, callback)
    {
        var ret = [];
        dbManager.connect(null, function (err)
        {
            if (err)
            {
                callback(ret);
            }
            else
            {
                dbManager.fulltextSearch(query, function (results)
                {
                    callback(results);

                    // Another optimization is to comment the line below and avoid disconnection from Db
                    dbManager.close();

                }, {
                    "trim-text": true,
                    "trim-length": 300
                });
            }
        });
    }


    function getJSONResult(query, callback)
    {
        getResults(query, function (results)
        {
            callback(JSON.stringify({
                "query": query,
                "results": results
            }));
        });
    }


    function resultsToHTML(results, ms)
    {
        var buf = '<p class="results-head"> ';
        if (results.length === 0)
        {
            buf += "No result found! </p>";
        }
        else
        {
            buf += results.length + ' results in ' + (ms / 1000) + ' seconds | <a href="' + req.url + '&t=json" target="_blank">JSON</a></p>';
            for (var i = 0; i < results.length; i++)
            {
                buf += resultTemplate.replace(/<!-- page-url -->/g, results[i]["page"])
                    .replace(/<!-- page-title -->/g, results[i]["title"])
                    .replace(/<!-- page-text -->/g, results[i]["text"])
                    .replace(/<!-- page-relevancy -->/g, results[i]["relevancy"]);
            }
        }
        return buf;
    }

};
