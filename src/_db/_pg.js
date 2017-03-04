var fs = require('fs');
var Client = require('pg').Client;

var sqlTemplates = require('./_pg/template.sql');

var _utils = require('./_pg/_utilsMixin');
var _fulltextSearchMixin = require('./_pg/_ftSearchMixin');


module.exports = function (CONF)
{
    var that = this;

    this.sqlTemplates = sqlTemplates;

    // inherits mysql functions
    _utils.call(this, CONF);

    // inherits fulltext search
    _fulltextSearchMixin.call(this, CONF);


    this._connect = function (cb)
    {
        that.connection = new Client({
            user: CONF.get("DB_CONNECTION_USER", "postgres"),
            password: CONF.get("DB_CONNECTION_PASS", "root"),
            host: CONF.get("DB_CONNECTION_HOST", "127.0.0.1"),
            port: CONF.get("DB_CONNECTION_PORT", 5432),
            database: CONF.get("DB_CONNECTION_INDEX_DB", "openwebspider"),
            max: 10, // max number of clients in the pool
            idleTimeoutMillis: 30000 // how long a client is allowed to remain idle before being closed
        });

        that.connection.connect(function (err, client, done)
        {
            console.log("PG::connect");
            if (err)
            {
                that.connection = null;
                console.error('PG::connect error: ' + err.stack);
            }
            cb && cb(err);
        });

        that.connection.on('error', function(error) {
            console.log("PG error:");
            console.log(error);
        });
    };


    this.query = function (sql, inserts, cb, params)
    {
        if (this.connection !== null)
        {
            this._query && this._query(sql, inserts, cb, params);
        }
        else
        {
            cb(/* error */ true);
        }
    };


    /** _query
     *
     * @param sql
     * @param cb
     * @private
     *
     */
    this._query = function (sql, inserts, cb, params)
    {
        // console.log("PG: query [" + sql + "]");
        that.connection.query(sql, inserts, function (err, result)
        {
            if(err && !(params && params.suppressErrors === true))
            {
                console.log("PG Query ERROR");
                console.log("--[[" + sql + "]]--");
                console.log(err.message);
            }
            cb(err, result)
        });
    };


    this._close = function ()
    {
        if (that.connection)
        {
            that.connection.end(function (err)
            {
                that.connection = null;
            });
        }
    };


    this._createDB = function (cb)
    {
        fs.readFile(global.__base_path + "_db/_mysql/script.sql",
            'utf8',
            function (err, data)
            {
                if (err)
                {
                    // file not found!
                    console.log("createDB::file not found: _db/mysql/script.sql");
                    cb(true);
                }
                else
                {
                    if(data.length > 5)
                    {
                        that.query(that.format(data, [
                            CONF.get("DB_CONNECTION_HOST_DB"),
                            CONF.get("DB_CONNECTION_HOST_DB"),
                            CONF.get("DB_CONNECTION_INDEX_DB"),
                            CONF.get("DB_CONNECTION_INDEX_DB")
                        ]), function (err)
                        {
                            cb(err);
                        });
                    }
                }
            });
    };
};
