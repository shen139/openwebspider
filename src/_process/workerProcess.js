var path = require("path");

var w = require("../_worker/_workerClass");
var logger = require("../_utils/logger");


var UPDATE_TIMER_INTERVAL = 1000;

global.__base_path = path.normalize(__dirname + "/../");

var worker = new w(/* crawler ID */ process.pid);

var updateInfoTimer = null;


/** sendInfo
 *  Updates the processManager and also checks if it is still connected!
 *
 */
function sendInfo()
{
    if (process.connected == true)
    {
        process.send({
            "action": "info",
            "what": worker.getInfo()
        });
    }
    else
    {
        clearInterval(updateInfoTimer);
        updateInfoTimer = null;
    }
}


// attach the notifyEvents to the sendInfo
// every stage change will be notified to the processManager
worker.notifyEventsCallback = sendInfo;


process.on('message', function (m)
{
    switch (m["action"])
    {
        // *** index ***
        case "index":
            if (m["conf"] !== undefined)
            {
                worker.CONF.setAll(m["conf"]);
            }

            worker.start(m["what"], function ()
            {
                if (process.connected == true)
                {
                    process.send({
                        "action": "bye"
                    });
                    process.disconnect();
                }
            });

            // updates the processManager every UPDATE_TIMER_INTERVAL ms
            clearInterval(updateInfoTimer);
            updateInfoTimer = setInterval(sendInfo, UPDATE_TIMER_INTERVAL);

            // inits the processManager info structure
            sendInfo();
            break;

        // *** next host ***
        case "next":
            worker.nextHost();
            break;


        // *** stop ***
        case "stop":
            clearInterval(updateInfoTimer);
            worker.stop();
            sendInfo();
            break;


        // *** info ***
        case "info":
            sendInfo();
            break;
    }

});
