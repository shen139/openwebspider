module.exports = function ()
{
    var that = this;

    // CONSTS
    this.STAGE_CONF_ZERO = 0;
    this.STAGE_CONF_DB_CONNECT = 10;
    this.STAGE_CONF_DB_ERROR = 20;
    this.STAGE_CONF_DB_OK = 30;
    this.STAGE_CONF_ROBOTSTXT = 40;
    this.STAGE_CONF_INDEXING = 100;
    this.STAGE_CONF_STOPPING = 110;

    var stage = this.STAGE_CONF_ZERO;


    this.getStage = function ()
    {
        return stage;
    };


    this.getStageInfo = function (v)
    {
        return {
            0: "Worker started",
            10: "Connecting to DB...",
            20: "Error connecting to DB.",
            30: "Connected to DB.",
            40: "Parsing robots.txt...",
            100: "Indexing...",
            110: "Stopping..."
        }[v];
    };


    this.updateStage = function (v)
    {
        if (stage !== v)
        {
            stage = v;
            that.notifyEventsCallback && that.notifyEventsCallback();
        }
    };

};
