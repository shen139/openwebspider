var child_process = require('child_process');

var logger = require("../_utils/logger");
var _statusMixin = require("./_statusMixin");


var MAX_HISTORY_SIZE = 100;


module.exports = function ()
{
    var that = this;

    var processes = {};
    var historyRev = 0;
    var history = [];


    _statusMixin.call(this);


    this.create = function (confObj)
    {
        return (function ()
        {
            var subProcess = child_process.fork(global.__base_path + "/_process/workerProcess.js");

            processes[subProcess.pid] = {
                "process": subProcess,
                "info": null
            };


            // *** handlers ***
            subProcess.on("message", function (m)
            {
                switch (m["action"])
                {
                    case "bye":
                        subProcess.disconnect();
                        delete processes[subProcess.pid];

                        addEvent(subProcess.pid, "Worker", "sent: bye!");
                        break;


                    case "info":
                        if (processes[subProcess.pid])
                        {
                            // checks if the worker changed stage
                            var stageChanged = false;
                            if(processes[subProcess.pid]["info"] === null || (processes[subProcess.pid]["info"] !== null && processes[subProcess.pid]["info"]["stage"] !== m["what"]["stage"]))
                            {
                                stageChanged = true;
                            }

                            // updates the internal structure
                            processes[subProcess.pid]["info"] = m["what"];

                            if(stageChanged)
                            {
                                // adds the event
                                addEvent(subProcess.pid, "Worker", that.getStageInfo(processes[subProcess.pid]["info"]["stage"]))
                            }
                        }
                        break;
                }
            });

            subProcess.on('exit', function (code, signal)
            {
                delete processes[subProcess.pid];
                addEvent(subProcess.pid, "Process", "exited");
            });


            // *** starts the worker ***
            if (subProcess.connected === true)
            {
                subProcess.send({
                    "action": "index",
                    "what": confObj["URL"],
                    "conf": confObj["CONF"]
                });
            }

            addEvent(subProcess.pid, "Process", "started");

            return subProcess.pid;
        })();
    };


    this.close = function (_pid)
    {
        var subProcess = processes[_pid];
        if (subProcess && subProcess["process"].connected === true)
        {
            subProcess["process"].send({
                "action": "stop"
            });
        }
    };


    this.nextHost = function (_pid)
    {
        var subProcess = processes[_pid];
        if (subProcess && subProcess["process"].connected === true)
        {
            subProcess["process"].send({
                "action": "next"
            });
        }
    };


    this.kill = function (_pid)
    {
        var subProcess = processes[_pid];
        if (subProcess && subProcess["process"].kill)
        {
            subProcess["process"].kill();
        }
    };


    /** getProcessesIDs
     * Return the list of the PIDs all active processes
     *
     */
    this.getProcessesIDs = function ()
    {
        return Object.keys(processes);
    };


    /** getProcessInfo
     * Ask for the process's informations
     *
     * @return {Object} Return the structure with the subprocess info or null
     *
     */
    this.getProcessInfo = function (_pid)
    {
        var subProcess = processes[_pid];
        if (subProcess && subProcess["info"])
        {
            return subProcess["info"];
        }
        return null;
    };


    function addEvent(_pid, subject, msg)
    {
        var dt = new Date();
        history.push({
            "dt": dt.toISOString(),
            "pid": _pid,
            "msg": subject + "::" + msg
        });
        if (history.length > MAX_HISTORY_SIZE)
        {
            history.shift();
        }

        // increment the history revision
        historyRev++;
    }

    this.getHistory = function ()
    {
        return {
            "rev": historyRev,
            "history": history
        };
    };


    this.historyClear = function()
    {
        historyRev = 0;
        history.length = 0;
    };

};
