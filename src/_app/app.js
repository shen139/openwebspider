var mirrorJS = require("../mirrorjs/mirror");

var conf = require("./_confClass");

var _utilsMixin = require("./_utilsMixin");
var _uiMixin = require("./_uiMixin");
var _workersMixin = require("./_workersMixin");


function OwsAppClass(app, args)
{
    var that = this;

    this.processManager = args["processManager"];

    this.app = app;

    // global conf (used to store db info and more)
    this.CONF = new conf();

    _utilsMixin.call(this);
    _workersMixin.call(this);
    _uiMixin.call(this);

    // don't do this at home! set just to enable all shiny effects and prevent caching!
    this.app.disableBuffering(true);

    // *** load conf file ***
    this.loadConfFile();

    that.workarea.Visible = true;


    // *** mirrorjs handler ***
    this.onClose = function ()
    {
        // cleanup
        that.gridCleanup();
    };

}


module.exports = function (connection, params)
{
    return new mirrorJS.app.server(
        new mirrorJS.ui.connectors.remote(connection),
        OwsAppClass,
        {
            /* CONF */
            "args": {
                "processManager": params["processManager"]
            }
        });
};
