var async = require('async');
var MongoClient = require('mongodb').MongoClient;

var _utils = require('./_mongodb/_utilsMixin');
var _fulltextSearchMixin = require('./_mongodb/_ftSearchMixin');


module.exports = function (CONF)
{
    var that = this;

    // inherits mongodb functions
    _utils.call(this, CONF);

    // inherits fulltext search
    _fulltextSearchMixin.call(this, CONF);


    this._connect = function (cb)
    {
        // Connection URL
        var url = 'mongodb://' + CONF.get("DB_CONNECTION_HOST") + ':' + CONF.get("DB_CONNECTION_PORT") + '/' + CONF.get("DB_CONNECTION_INDEX_DB");

        MongoClient.connect(url, function (err, db)
        {
            if (err)
            {
                that.connection = null;
                console.error('MongoDB::connect error: ' + err.stack);
            }
            else
            {
                that.connection = db;
            }
            cb && cb(err);
        });
    };


    this._close = function ()
    {
        if (that.connection)
        {
            that.connection.close();
            that.connection = null;
        }
    };


    this._createDB = function (cb)
    {
        if (that.connection)
        {
            async.series([
                    function (callback)
                    {
                        that.connection.dropDatabase(callback);
                    },
                    function (callback)
                    {
                        that.connection.createCollection('hosts', callback);
                    },
                    function (callback)
                    {
                        // UNIQUE
                        that.connection.createIndex('hosts',
                            {
                                host: 1
                            },
                            {
                                unique: true,
                                background: true,
                                dropDups: true,
                                name: "hostsUniqueIndex"
                            }, callback);
                    },
                    function (callback)
                    {
                        that.connection.createCollection('pages', callback);
                    },
                    function (callback)
                    {
                        that.connection.createIndex('pages',
                            {
                                host: "text",
                                page: "text",
                                title: "text",
                                anchor_text: "text",
                                text: "text"
                            },
                            {
                                weights: {
                                    hostname: 6,
                                    page: 8,
                                    title: 10,
                                    anchor_text: 9,
                                    text: 8
                                },
                                name: "pagesIndex"
                            }, callback);
                    },
                    function (callback)
                    {
                        that.connection.createCollection('pagesMap', callback);
                    }
                ],
                function (err)
                {
                    cb(err);
                });
        }
        else
        {
            cb(true);
        }
    };

};
