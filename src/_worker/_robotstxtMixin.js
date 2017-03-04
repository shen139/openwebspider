var robots = require('robots');

module.exports = function ()
{
    var that = this;

    var robotsTxtParser = null;

    // Crawl Delay in ms
    this.crawlDelay = null;

    this.robotsTxtParse = function (urlObject, cb)
    {
        // parses robots.txt
        robotsTxtParser = new robots.RobotsParser();
        robotsTxtParser.setUrl("http://" + urlObject["host"] + "/robots.txt", function (parser, success)
        {
            var robotsTxtDelay = parser.getCrawlDelay(that.CONF.get("CRAWLER_NAME"));

            that.crawlDelay = null;

            if (robotsTxtDelay !== undefined || that.CONF.get("CRAWL_DELAY") !== null)
            {
                if (robotsTxtDelay !== undefined)
                {
                    that.crawlDelay = robotsTxtDelay * 1000;
                }
                else
                {
                    that.crawlDelay = that.CONF.get("CRAWL_DELAY");
                }
            }

            cb();
        });
    };


    this.canFetchSync = function (u)
    {
        return robotsTxtParser !== null ? robotsTxtParser.canFetchSync(that.CONF.get("CRAWLER_NAME"), u) : false;
    };

};
