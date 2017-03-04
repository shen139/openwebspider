module.exports = function ()
{
    var that = this;

    var updateWorkersGridInterval = null;
    var gridData = {};
    var activeWorker = null;


    /** gridCleanup
     * Handler called when the app exits
     *
     */
    this.gridCleanup = function ()
    {
        activeWorker = null;
        clearInterval(updateWorkersGridInterval);
        updateWorkersGridInterval = null;
    };


    /** updateWorkersGrid
     * Updates the grid
     *
     */
    this.updateWorkersGrid = function ()
    {
        var activeProcesses = that.processManager.getProcessesIDs();

        for (var procCount = 0; procCount < activeProcesses.length; procCount++)
        {
            var curPid = activeProcesses[procCount];
            var curProcessInfo = that.processManager.getProcessInfo(curPid);

            if (!curProcessInfo)
            {
                continue;
            }

            var objInfo = {
                "Hosts": curProcessInfo["pages"]["totalHosts"],
                "Pages": curProcessInfo["pages"]["totalUrls"],
                "Host": curProcessInfo["startingHost"],
                "IndexedPages": curProcessInfo["pages"]["indexed"] + "\\" + (curProcessInfo["pages"]["indexed"] + curProcessInfo["pages"]["pending"])
            };

            if (gridData[curPid] !== true)
            {
                // new record
                objInfo["id"] = curPid;
                that.gridWorkers.dataview.addItem(objInfo);
                gridData[curPid] = true;
            }
            else
            {
                // update
                that.gridWorkers.dataview.updateItem(curPid, objInfo);
            }
        }

        for (var procGrid in gridData)
        {
            if (activeProcesses.indexOf(procGrid) < 0)
            {
                // delete
                that.gridWorkers.dataview.deleteItem(procGrid);

                delete gridData[procGrid];
                if (activeWorker === procGrid)
                {
                    that.setActiveWorker(null);
                }
            }
        }

        // if there are active processes: select the first
        if (activeWorker === null && activeProcesses.length > 0)
        {
            that.setActiveWorker(activeProcesses[0]);
        }

    };


    this.updateWorkersDetail = function ()
    {
        if (activeWorker === null)
        {
            return;
        }
        var curProcessInfo = that.processManager.getProcessInfo(activeWorker);

        that.gridWorkers.grid.setSelectedRowByID(activeWorker);
        that.app.getWidgetByName("workersLblHost").Caption = curProcessInfo["startingHost"];
        that.app.getWidgetByName("workersLblPid").Caption = activeWorker;
        that.app.getWidgetByName("workersLblConcurrency").Caption = curProcessInfo["subWorkers"];
        that.app.getWidgetByName("workersProgress").Max = curProcessInfo["pages"]["indexed"] + curProcessInfo["pages"]["pending"];
        that.app.getWidgetByName("workersProgress").Value = curProcessInfo["pages"]["indexed"];
        that.app.getWidgetByName("workersLblIndexed").Caption = curProcessInfo["pages"]["indexed"] + "\\" + (curProcessInfo["pages"]["indexed"] + curProcessInfo["pages"]["pending"]);
        that.app.getWidgetByName("lblStatus").Caption = that.processManager.getStageInfo(curProcessInfo["stage"]);

        if (curProcessInfo["pages"]["indexed"] > 0)
        {
            that.app.getWidgetByName("workersLblPps").Caption = (curProcessInfo["pages"]["indexed"] / ((new Date() - new Date(curProcessInfo["started"])) / 1000)).toFixed(2);
        }
        else
        {
            that.app.getWidgetByName("workersLblPps").Caption = "0";
        }

        if (curProcessInfo["pages"]["indexed"] > 0 && curProcessInfo["downloadedBytes"] > 0)
        {
            that.app.getWidgetByName("workersLblKbps").Caption = ((curProcessInfo["downloadedBytes"] / ((new Date() - new Date(curProcessInfo["started"])) / 1000) / 1000)).toFixed(2);
        }
        else
        {
            that.app.getWidgetByName("workersLblKbps").Caption = 0;
        }
    };


    var historyRev = null;
    this.updateHistory = function ()
    {
        var historyObj = that.processManager.getHistory();
        if (historyObj["rev"] !== historyRev)
        {
            historyRev = historyObj["rev"];
            // history changed
            that.gridHistory.dataview.clear();
            var history = historyObj["history"];
            for (var historyElem = history.length - 1; historyElem >= 0; historyElem--)
            {
                var curHistoryObj = history[historyElem];
                curHistoryObj["id"] = historyElem;
                that.gridHistory.dataview.addItem(curHistoryObj);
            }
        }
    };


    /** updateWorkersTab
     * Updates the grid and the detail of the active worker
     *
     */
    this.updateWorkersTab = function ()
    {
        that.updateWorkersGrid();
        that.updateWorkersDetail();
        that.updateHistory();
    };


    this.setActiveWorker = function (pid)
    {
        if (pid !== null && that.processManager.getProcessInfo(pid) !== null)
        {
            activeWorker = pid;
            that.workersDetailCnt.Visible = true;
            that.app.getWidgetByName("workersBtnNextHost").Disabled = false;
            that.app.getWidgetByName("workersBtnStop").Disabled = false;
            that.app.getWidgetByName("workersBtnKill").Disabled = false;
            that.updateWorkersDetail();
        }
        else
        {
            activeWorker = null;
            that.workersDetailCnt.Visible = false;
            that.app.getWidgetByName("workersBtnNextHost").Disabled = true;
            that.app.getWidgetByName("workersBtnStop").Disabled = true;
            that.app.getWidgetByName("workersBtnKill").Disabled = true;
        }
    };


    this.stopActiveWorker = function ()
    {
        if (activeWorker !== null)
        {
            that.loading(true);
            that.setInfoline("Stopping worker...", 2000);

            that.processManager.close(activeWorker);

            setTimeout(function ()
            {
                that.loading(false);
            }, 500);
        }
    };


    this.nextHostActiveWorker = function ()
    {
        if (activeWorker !== null)
        {
            that.loading(true);
            that.setInfoline("Next host...", 2000);

            that.processManager.nextHost(activeWorker);

            setTimeout(function ()
            {
                that.loading(false);
            }, 500);
        }
    };


    this.killActiveWorker = function ()
    {
        if (activeWorker !== null)
        {
            that.loading(true);
            that.setInfoline("Killing worker...", 2000);

            that.processManager.kill(activeWorker);

            setTimeout(function ()
            {
                that.loading(false);
            }, 500);
        }
    };

    // init timed updater
    updateWorkersGridInterval = setInterval(this.updateWorkersTab, 1000);

};
