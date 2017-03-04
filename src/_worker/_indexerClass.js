var conf = require("../_app/_confClass");
var DbClass = require("../_db/_dbClass");


var _pluginMixin = require("./_pluginMixin");
var _httpMixin = require("./_httpMixin");
var _indexerMixin = require("./_indexerMixin");
var _robotstxtMixin = require("./_robotstxtMixin");
var _statusMixin = require("../_process/_statusMixin");


module.exports = function (/* UNUSED (yet)*/ crawler_id)
{
    var that = this;

    // inherits
    _pluginMixin.call(this);
    _statusMixin.call(this);
    _httpMixin.call(this);
    _indexerMixin.call(this);
    _robotstxtMixin.call(this);

    this.CONF = new conf();

    this.dbManager = null;
    this.pages = null;
    this.addedPagesMap = null;


    this.init = function (cb)
    {
        if (that.dbManager === null)
        {
            that.dbManager = new DbClass(that.CONF);
        }

        // loading plugins...
        that.loadPlugins(function ()
        {
            // connecting to the DB
            that.dbManager.connect(function (err)
            {
                cb(err);
            });
        });
    };


    this.finalize = function ()
    {
        that.pluginAsyncCall("cleanup", /* arguments */ null, /* all plugins */ null, function ()
        {
            that.dbManager && that.dbManager.close();
            that.dbManager = null;

            // call the callback once (if defined)
            that.onEndCallback && that.onEndCallback(true);
            that.onEndCallback = null;
        });
    };

};
