var fs = require("fs");
var http = require("http");

var DbClass = require("../_db/_dbClass");
var conf = require("./_confClass");


module.exports = function ()
{
    var that = this;

    var loadingCounter = 0;
    this.loading = function (b)
    {
        b ? loadingCounter++ : loadingCounter--;
        if (loadingCounter > 0)
        {
            that.loadingIconCnt.addClass("loading");
        }
        else
        {
            // removes the class after few ms
            setTimeout(function ()
            {
                that.loadingIconCnt.removeClass("loading");
            }, 200);
        }
    };


    var infolineTimeout = null;
    this.setInfoline = function (msg, timeout)
    {
        clearTimeout(infolineTimeout);
        that.lblInfoline.Caption = msg;
        if (timeout)
        {
            infolineTimeout = setTimeout(function ()
            {
                that.lblInfoline.Caption = "";
            }, timeout);
        }
    };


    this.startNewProcess = function (workerURL)
    {
        that.loading(true);

        that.setInfoline("Starting new worker...", 2000);

        that.processManager.create({
            "URL": workerURL,
            "CONF": that.CONF.getAll()
        });
        // sets the Workers tab
        that.app.getWidgetByName("mainTabber").Active = 1;
        that.app.getWidgetByName("workersTabber1").Active = 0;

        setTimeout(function ()
        {
            that.loading(false);
        }, 500);
    };


    this.updateConf = function (k, v, showSave)
    {
        that.CONF.set(k, v);

        that.saveConf(showSave);

        CONF_SETTING_TO_UI[k] && CONF_SETTING_TO_UI[k](v);
    };


    this.loadConfFile = function (cb)
    {
        that.loading(true);

        that.CONF.loadFile(function ()
        {
            that.applyConfSettings();
            that.loading(false);

            cb && cb();
        });
    };


    function updateCheckAndText(checkName, textName, v)
    {
        if (v === null)
        {
            that.app.getWidgetByName(checkName).Checked = false;
            that.app.getWidgetByName(textName).Disabled = true;
        }
        else
        {
            that.app.getWidgetByName(checkName).Checked = true;
            that.app.getWidgetByName(textName).Disabled = false;
            that.app.getWidgetByName(textName).Text = v;
        }
    }

    var CONF_SETTING_TO_UI = {
        "MAX_PAGES": function (v)
        {
            updateCheckAndText("ckMaxPages", "txtMaxPages", v);
        },
        "MAX_SECONDS": function (v)
        {
            updateCheckAndText("ckboxMaxSecs", "txtMaxSecs", v);
        },
        "SINGLE_HOST_MODE": function (v)
        {
            that.app.getWidgetByName("ckSingleHost").Checked = (v === true);
        },
        "CRAWL_DELAY": function (v)
        {
            updateCheckAndText("ckCrawlDelay", "txtCrawlDelay", v);
        },
        "ADD_EXTERNAL_HOSTS": function (v)
        {
            that.app.getWidgetByName("ckAddHosts").Checked = (v === true);
        },
        "MAX_DEPTH": function (v)
        {
            updateCheckAndText("ckMaxDepth", "txtMaxDepth", v);
        },
        "CONCURRENCY": function (v)
        {
            that.app.getWidgetByName("txtConcurrency").Text = v;
        },
        "MAX_PAGE_SIZE": function (v)
        {
            that.app.getWidgetByName("txtMaxPkgSize").Text = v;
        },
        "CACHE_MODE": function (v)
        {
            that.app.getWidgetByName("ckCache").Checked = v > 0;
        },
        "PAGES_MAP": function (v)
        {
            if (v === 0)
            {
                that.app.getWidgetByName("ckPagesMap").Checked = false;
                that.app.getWidgetByName("ckPagesMapFull").Checked = false;
            }
            else
            {
                that.app.getWidgetByName("ckPagesMap").Checked = true;
                that.app.getWidgetByName("ckPagesMapFull").Checked = (v === 2);
            }
        },
        "DELETE_DUP_PAGES": function (v)
        {
            that.app.getWidgetByName("ckDupPages").Checked = (v === true);
        },
        "UPDATE_MODE": function (v)
        {
            that.app.getWidgetByName("ckUpdateMode").Checked = (v === true);
        },
        "DB_CONNECTION_TYPE": function (v)
        {
            that.app.getWidgetByName("comboConnType").Selected = v;
        },
        "DB_CONNECTION_HOST": function (v)
        {
            that.app.getWidgetByName("txtDbHost").Text = v;
        },
        "DB_CONNECTION_PORT": function (v)
        {
            that.app.getWidgetByName("txtDbPort").Text = v;
        },
        "DB_CONNECTION_USER": function (v)
        {
            that.app.getWidgetByName("txtDbUser").Text = v;
        },
        "DB_CONNECTION_PASS": function (v)
        {
            that.app.getWidgetByName("txtDbPass").Text = v;
        },
        "DB_CONNECTION_HOST_DB": function (v)
        {
            that.app.getWidgetByName("txtDbDb1").Text = v;
        },
        "DB_CONNECTION_INDEX_DB": function (v)
        {
            that.app.getWidgetByName("txtDbDb2").Text = v;
        },
        "HISTORY_WORKER_URL": function (v)
        {
            that.app.getWidgetByName("txtURL").Text = v || "http://";
        },
        "HISTORY_PAGESMAP_URL": function (v)
        {
            that.app.getWidgetByName("txtPagesMapURL").Text = v || "http://";
        },
        "HISTORY_SEARCH_QUERY": function (v)
        {
            that.app.getWidgetByName("txtSearchQuery").Text = v || "";
        }
    };


    this.applyConfSettings = function ()
    {
        for (var confKey in that.CONF.getAll())
        {
            CONF_SETTING_TO_UI[confKey] && CONF_SETTING_TO_UI[confKey](that.CONF.get(confKey));
        }
    };


    this.saveConf = function (showSave)
    {
        if (/* true || undefined */ showSave !== false)
        {
            that.loading(true);
            that.setInfoline("Saving configuration file...", 1000);
        }

        fs.writeFile(global.__base_path + "../conf/ows.conf",
            that.CONF.stringify(),
            'utf8',
            function (err)
            {
                if (err)
                {
                    if (showSave !== false)
                    {
                        that.setInfoline("Error saving configuration file.", 5000);
                    }
                    console.log(err);
                    return;
                }

                if (showSave !== false)
                {
                    that.loading(false);
                }
            });
    };


    this.saveDBInfo = function (connType, host, port, user, pass, db1, db2)
    {
        setDBInfo2Conf(that.CONF, connType, host, port, user, pass, db1, db2);

        that.saveConf();
    };


    this.verifyDBConnection = function (connType, host, port, user, pass, db1, db2, cb)
    {
        that.loading(true);

        var newConf = new conf();

        // stores DB info into a temp conf structure
        setDBInfo2Conf(newConf, connType, host, port, user, pass, db1, db2);

        // creates a new DBManager
        var DBManager = new DbClass(newConf);
        DBManager.verify(function (err)
        {
            cb(err);
            that.loading(false);
        });
    };


    function setDBInfo2Conf(iConf, connType, host, port, user, pass, db1, db2)
    {
        iConf.set("DB_CONNECTION_TYPE", connType);
        iConf.set("DB_CONNECTION_HOST", host);
        iConf.set("DB_CONNECTION_PORT", port);
        iConf.set("DB_CONNECTION_USER", user);
        iConf.set("DB_CONNECTION_PASS", pass);
        iConf.set("DB_CONNECTION_HOST_DB", db1);
        iConf.set("DB_CONNECTION_INDEX_DB", db2);
    }


    this.createDB = function (connType, host, port, user, pass, db1, db2, cb)
    {
        that.loading(true);

        var newConf = new conf();

        // stores DB info into a temp conf structure
        setDBInfo2Conf(newConf, connType, host, port, user, pass, db1, db2);

        // creates a new DBManager
        var DBManager = new DbClass(newConf);
        DBManager.createDB(function (err)
        {
            cb(err);
            that.loading(false);
        });
    };

};
