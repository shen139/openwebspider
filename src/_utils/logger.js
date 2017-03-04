var debugLevel = 0;

exports.level = {
    LOG_INFO    : 0x01,
    LOG_DEBUG   : 0x02
};


exports.log = function (subject, msg, logLevel)
{
    if (true || (logLevel & debugLevel) !== 0)
    {

        var x = new Date();
        var y = x.getHours() + ':' + x.getMinutes() + ':' + x.getSeconds() + ':' + x.getMilliseconds() + ' >> ';

        console.log(y + subject + ": " + msg);
    }
};


exports.setDebugLevel = function (level)
{
    debugLevel = level;
};
