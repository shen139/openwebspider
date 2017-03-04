var fs = require('fs');
var mysql = require('mysql');

var sqlTemplates = require('./_mysql/template.sql');

var _utils = require('./_mysql/_utilsMixin');
var _fulltextSearchMixin = require('./_mysql/_ftSearchMixin');


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
        that.connection = mysql.createConnection({
            multipleStatements: true,
            host: CONF.get("DB_CONNECTION_HOST", "127.0.0.1"),
            port: CONF.get("DB_CONNECTION_PORT", 3306),
            user: CONF.get("DB_CONNECTION_USER", "root"),
            password: CONF.get("DB_CONNECTION_PASS", "root")
        });

        that.connection.connect(function (err)
        {
            if (err)
            {
                that.connection = null;
                console.error('MySQL::connect error: ' + err.stack);
            }
            cb && cb(err);
        });
    };


    this.format = function (sql, inserts)
    {
        /*
         * sql = "SELECT * FROM ?? WHERE ?? = ?";
         * inserts = ['users', 'id', userId];
         *
         * you can use ?? characters as placeholders for identifiers you would like to have escaped like this:
         *   var userId = 1;
         *   var columns = ['username', 'email'];
         *   var query = connection.query('SELECT ?? FROM ?? WHERE id = ?', [columns, 'users', userId], function(err, results) { ...
         *
         */

        return mysql.format(sql, inserts);
    };


    this.query = function (sql, cb)
    {
        if (this.connection !== null)
        {
            this._query && this._query(sql, cb);
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
     * Getting the id of an inserted row
     *  console.log(result.insertId);
     *
     * Getting the number of affected rows
     *  console.log('deleted ' + result.affectedRows + ' rows');
     *
     * Getting the number of changed rows
     *  console.log('changed ' + result.changedRows + ' rows');
     *
     */
    this._query = function (sql, cb)
    {
        // console.log("MySQL: query [" + sql + "]");
        that.connection.query(sql, function (err, result)
        {
            if(err)
            {
                console.log("MySQL Query ERROR");
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
