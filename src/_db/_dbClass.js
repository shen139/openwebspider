var _dbUtilsMixin = require("./_dbUtilsMixin");


module.exports = function (CONF)
{
    var that = this;

    this.connection = null;
    this.connectionType = CONF.get("DB_CONNECTION_TYPE", /* default: */ "mysql");

    this.sqlTemplates = {};


    // *** interface ***
    this.connect = function (params, cb)
    {
        if (that.connection !== null)
        {
            cb && cb(/* no errors */ false);
            return;
        }

        this._connect && this._connect(params, function (err)
        {
            if (!err)
            {
                that.checkDB(function ()
                {
                    cb(err);
                });
            }
            else
            {
                cb(err);
            }
        });
    };


    this.close = function (cb)
    {
        this._close && this._close(cb);
    };


    this.verify = function (cb)
    {
        that.connect(null, function (err)
        {
            cb(err);
            if (!err)
            {
                // if the connection is OK: close it!
                that.close();
            }
        });
    };


    this.createDB = function (cb)
    {
        that.connect({
            forceDB: that.getDefaultDB()
        }, function (err)
        {
            if (!err)
            {
                // connection is OK
                that._createDB(function (err)
                {
                    if (!err)
                    {
                        that.checkDB(function ()
                        {
                            that.close();
                            cb(err);
                        });
                    }
                    else
                    {
                        that.close();
                        cb(err);
                    }
                });
            }
            else
            {
                cb(err);
            }
        });
    };


    // inherits utils
    _dbUtilsMixin.call(this, CONF);

    // inherits connectionManager
    require(global.__base_path + "_db/_" + this.connectionType).call(this, CONF);

};
