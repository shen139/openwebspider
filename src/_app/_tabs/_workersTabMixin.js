module.exports = function (tab2)
{
    var that = this;


    // ******* TAB WORKERS ****
    var workers_tabber1 = this.app.create("tabber", tab2);
    workers_tabber1.Name = "workersTabber1";
    workers_tabber1.Top = 2;
    workers_tabber1.Left = 2;
    workers_tabber1.Position = "absolute";
    workers_tabber1.Width = 560;
    workers_tabber1.Height = 300;

    var workers_tab1 = this.app.create("tab", workers_tabber1);
    workers_tab1.Top = 10;
    workers_tab1.Left = 10;
    workers_tab1.Position = "absolute";
    workers_tab1.Width = 510;
    workers_tab1.Caption = "Workers";

    var workers_tab2 = this.app.create("tab", workers_tabber1);
    workers_tab2.Top = 10;
    workers_tab2.Left = 10;
    workers_tab2.Position = "absolute";
    workers_tab2.Width = 510;
    workers_tab2.Caption = "History";

    this.gridWorkers = this.app.create("datagrid", workers_tab1, {
        "Width": 550,
        "Height": 100,
        "dataset": {
            "columns": [{
                "id": "id",
                "name": "Pid",
                "field": "id",
                "width": 60
            },
                {
                    "id": "Hosts",
                    "name": "Hosts",
                    "field": "Hosts",
                    "width": 60
                },
                {
                    "id": "Pages",
                    "name": "Pages",
                    "field": "Pages",
                    "width": 60
                },
                {
                    "id": "Host",
                    "name": "Current Host",
                    "field": "Host",
                    "width": 200
                }, {
                    "id": "IndexedPages",
                    "name": "IndexedPages",
                    "field": "IndexedPages",
                    "width": 100
                }],
            "data": []
        }
    });
    this.gridWorkers.Top = 2;
    this.gridWorkers.Left = 2;
    this.gridWorkers.Position = "absolute";
    this.gridWorkers.Width = 550;
    this.gridWorkers.Height = 100;
    this.gridWorkers.on("cellClick", function (ctl, rowObj)
    {
        that.setActiveWorker(rowObj["row"]["id"]);
    });

    var button2 = this.app.create("button", workers_tab1);
    button2.Top = 235;
    button2.Left = 2;
    button2.Position = "absolute";
    button2.Caption = "Refresh";
    button2.Width = 100;
    button2.Height = 22;
    button2.on("click", this.updateWorkersTab);

    var btnNextHost = this.app.create("button", workers_tab1);
    btnNextHost.Top = 235;
    btnNextHost.Left = 117;
    btnNextHost.Position = "absolute";
    btnNextHost.Caption = "Next Host";
    btnNextHost.Width = 100;
    btnNextHost.Height = 22;
    btnNextHost.Disabled = true;
    btnNextHost.Name = "workersBtnNextHost";
    btnNextHost.on("click", this.nextHostActiveWorker);

    var button3 = this.app.create("button", workers_tab1);
    button3.Top = 235;
    button3.Left = 232;
    button3.Position = "absolute";
    button3.Caption = "Stop";
    button3.Width = 100;
    button3.Height = 22;
    button3.Disabled = true;
    button3.Name = "workersBtnStop";
    button3.on("click", this.stopActiveWorker);

    var button4 = this.app.create("button", workers_tab1);
    button4.Top = 235;
    button4.Left = 347;
    button4.Position = "absolute";
    button4.Caption = "Kill";
    button4.Width = 100;
    button4.Height = 22;
    button4.Disabled = true;
    button4.Name = "workersBtnKill";
    button4.on("click", this.killActiveWorker);


    // container worker info
    this.workersDetailCnt = this.app.create("container", workers_tab1);
    this.workersDetailCnt.Top = 100;
    this.workersDetailCnt.Left = 2;
    this.workersDetailCnt.Position = "absolute";
    this.workersDetailCnt.Width = 550;
    this.workersDetailCnt.Height = 120;
    this.workersDetailCnt.Resizable = false;
    this.workersDetailCnt.Visible = false;


    var label11 = this.app.create("label", this.workersDetailCnt);
    label11.Top = 10;
    label11.Left = 10;
    label11.Position = "absolute";
    label11.Caption = "Host:";
    label11.Width = 60;
    label11.Height = 22;
    label11.Border = "";

    var label12 = this.app.create("label", this.workersDetailCnt);
    label12.Top = 10;
    label12.Left = 95;
    label12.Position = "absolute";
    label12.Caption = "http://";
    label12.addClass("label-no-wrap");
    label12.Width = 240;
    label12.Height = 14;
    label12.Name = "workersLblHost";

    var label_pid = this.app.create("label", this.workersDetailCnt);
    label_pid.Top = 10;
    label_pid.Left = 350;
    label_pid.Position = "absolute";
    label_pid.Caption = "Pid:";
    label_pid.Width = 60;
    label_pid.Height = 22;
    label_pid.Border = "";

    var label_pidd = this.app.create("label", this.workersDetailCnt);
    label_pidd.Top = 10;
    label_pidd.Left = 430;
    label_pidd.Position = "absolute";
    label_pidd.Caption = "";
    label_pidd.Width = 110;
    label_pidd.Height = 14;
    label_pidd.addClass("label-no-wrap");
    label_pidd.Name = "workersLblPid";


    var label13 = this.app.create("label", this.workersDetailCnt);
    label13.Top = 30;
    label13.Left = 10;
    label13.Position = "absolute";
    label13.Caption = "Concurrency:";
    label13.Width = 60;
    label13.Height = 22;
    label13.Border = "";

    var label14 = this.app.create("label", this.workersDetailCnt);
    label14.Top = 30;
    label14.Left = 95;
    label14.Position = "absolute";
    label14.Width = 60;
    label14.Height = 22;
    label14.Name = "workersLblConcurrency";


    var label_pps = this.app.create("label", this.workersDetailCnt);
    label_pps.Top = 30;
    label_pps.Left = 350;
    label_pps.Position = "absolute";
    label_pps.Caption = "Pages/s:";
    label_pps.Width = 60;
    label_pps.Height = 22;
    label_pps.Border = "";

    var label_ppsd = this.app.create("label", this.workersDetailCnt);
    label_ppsd.Top = 30;
    label_ppsd.Left = 430;
    label_ppsd.Position = "absolute";
    label_ppsd.Width = 110;
    label_ppsd.Height = 14;
    label_ppsd.addClass("label-no-wrap");
    label_ppsd.Name = "workersLblPps";


    var label_kbps = this.app.create("label", this.workersDetailCnt);
    label_kbps.Top = 50;
    label_kbps.Left = 350;
    label_kbps.Position = "absolute";
    label_kbps.Caption = "Kb/s:";
    label_kbps.Width = 60;
    label_kbps.Height = 22;
    label_kbps.Border = "";

    var label_kbpsd = this.app.create("label", this.workersDetailCnt);
    label_kbpsd.Top = 50;
    label_kbpsd.Left = 430;
    label_kbpsd.Position = "absolute";
    label_kbpsd.Width = 110;
    label_kbpsd.Height = 14;
    label_kbpsd.addClass("label-no-wrap");
    label_kbpsd.Name = "workersLblKbps";


    var label15 = this.app.create("label", this.workersDetailCnt);
    label15.Top = 50;
    label15.Left = 10;
    label15.Caption = "Status:";
    label15.Position = "absolute";
    label15.Width = 60;
    label15.Height = 22;
    label15.Border = "";

    var label15d = this.app.create("label", this.workersDetailCnt);
    label15d.Name = "lblStatus";
    label15d.Top = 50;
    label15d.Left = 95;
    label15d.Position = "absolute";
    label15d.Width = 240;
    label15d.Height = 14;
    label15d.addClass("label-no-wrap");
    label15d.Border = "";

    var label_pb = this.app.create("label", this.workersDetailCnt);
    label_pb.Top = 70;
    label_pb.Left = 10;
    label_pb.Position = "absolute";
    label_pb.Caption = "Progress";
    label_pb.Width = 60;
    label_pb.Height = 22;
    label_pb.Border = "";

    var progressbar1 = this.app.create("progressbar", this.workersDetailCnt);
    progressbar1.Top = 90;
    progressbar1.Left = 10;
    progressbar1.Position = "absolute";
    progressbar1.Width = 390;
    progressbar1.Height = 20;
    progressbar1.Name = "workersProgress";

    var label16a = this.app.create("label", this.workersDetailCnt);
    label16a.Top = 85;
    label16a.Left = 415;
    label16a.Position = "absolute";
    label16a.Caption = "Indexed pages:";
    label16a.Width = 120;
    label16a.Height = 22;
    label16a.Border = "";

    var label16 = this.app.create("label", this.workersDetailCnt);
    label16.Top = 103;
    label16.Left = 415;
    label16.Position = "absolute";
    label16.Caption = "10 / 1450";
    label16.Width = 110;
    label16.Height = 14;
    label16.addClass("label-no-wrap");
    label16.Name = "workersLblIndexed";

    this.gridHistory = this.app.create("datagrid", workers_tab2, {
        "Width": 550,
        "Height": 210,
        "dataset": {
            "columns": [
                {
                    "id": "dt",
                    "name": "Time",
                    "field": "dt",
                    "width": 170
                },
                {
                    "id": "pid",
                    "name": "Pid",
                    "field": "pid",
                    "width": 60
                },
                {
                    "id": "msg",
                    "name": "Info",
                    "field": "msg",
                    "width": 300
                }],
            "data": []
        }
    });
    this.gridHistory.Top = 2;
    this.gridHistory.Left = 2;
    this.gridHistory.Position = "absolute";
    this.gridHistory.Width = 550;
    this.gridHistory.Height = 210;
    this.gridHistory.Border = "";

    var workers_btnHistoryClear = this.app.create("button", workers_tab2);
    workers_btnHistoryClear.Top = 235;
    workers_btnHistoryClear.Left = 2;
    workers_btnHistoryClear.Position = "absolute";
    workers_btnHistoryClear.Caption = "Clear";
    workers_btnHistoryClear.Width = 100;
    workers_btnHistoryClear.Height = 22;
    workers_btnHistoryClear.on("click", function()
    {
        that.processManager.historyClear();
        that.updateHistory();
    });



};
