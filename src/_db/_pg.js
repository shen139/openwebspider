var fs = require('fs');
var async = require('async');
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


    this.getDefaultDB = function ()
    {
        return "postgres";
    };


    this._connect = function (params, cb)
    {
        var useDB = CONF.get("DB_CONNECTION_INDEX_DB", "openwebspider");
        if (params)
        {
            if (params.forceDB)
            {
                useDB = params.forceDB;
            }
            // ...
        }

        that.connection = new Client({
            user: CONF.get("DB_CONNECTION_USER", "postgres"),
            password: CONF.get("DB_CONNECTION_PASS", "root"),
            host: CONF.get("DB_CONNECTION_HOST", "127.0.0.1"),
            port: CONF.get("DB_CONNECTION_PORT", 5432),
            database: useDB,
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

        that.connection.on('error', function (error)
        {
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
            if (err && !(params && params.suppressErrors === true))
            {
                console.log("PG Query ERROR");
                console.log("--[[" + sql + "]]--");
                console.log(err.message);
            }
            cb(err, result)
        });
    };


    this._close = function (cb)
    {
        if (that.connection)
        {
            that.connection.end(function (err)
            {
                that.connection = null;
                cb && cb(err);
            });
        }
        else
        {
            cb && cb(false);
        }
    };


    /**
     * Executes a sql script.
     *
     * @param {String} sql
     * @param {Function} cb The callback `function(err)`
     */
    this.script = function (sql, cb)
    {
        var statements = sql.split(/;\s*$/m);

        (function next()
        {
            var statement = statements.shift();
            if (statement)
            {
                that.connection.query(statement, function (err, response)
                {
                    if (err)
                    {
                        return cb(err);
                    }
                    next();
                });
            }
            else
            {
                cb(null);
            }
        })();
    };


    this.createDB = function (cb)
    {
        var scriptSQL = null;
        async.series([
            function (callback)
            {
                fs.readFile(global.__base_path + "_db/_pg/script.sql",
                    'utf8', function (err, data)
                    {
                        if (err)
                        {
                            // file not found!
                            console.log("createDB::file not found: _db/_pg/script.sql");
                            callback(true);
                        }
                        else
                        {
                            scriptSQL = data;
                            callback(false);
                        }
                    });
            },
            function (callback)
            {
                that.close(callback);
            },
            function (callback)
            {
                // Connects to default DB
                that.connect({
                    forceDB: that.getDefaultDB()
                }, callback);
            },
            function (callback)
            {
                that.query("DROP DATABASE " + CONF.get("DB_CONNECTION_INDEX_DB"), null, callback);
            },
            function (callback)
            {
                that.query("CREATE DATABASE " + CONF.get("DB_CONNECTION_INDEX_DB"), null, callback);
            },
            function (callback)
            {
                that.close(callback);
            },
            function (callback)
            {
                // Connects to created DB
                that.connect(null, callback);
            },
            function (callback)
            {
                that._createDB(scriptSQL, callback);
            },
            function (callback)
            {
                that.checkDB(callback);
            }
        ], function (err)
        {
            if (err)
            {
                console.log("createDB::error:");
                console.log(err);
            }

            that.close(function ()
            {
                cb(err);
            });
        });
    };


    this._createDB = function (scriptSQL, cb)
    {
        async.series([
            function (callback)
            {
                that.query("BEGIN", null, callback);
            },
            function (callback)
            {
                that.script(scriptSQL, callback);
            }
        ], function (err)
        {
            if (err)
            {
                console.log("createDB::error:");
                console.log(err);
            }

            that.query("COMMIT", null, function ()
            {
                cb(err);
            });
        });
    };
};
