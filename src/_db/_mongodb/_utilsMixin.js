var async = require('async');
var crypto = require('crypto');


module.exports = function (CONF)
{
    var that = this;

    // http://mongodb.github.io/node-mongodb-native/contents.html


    /** getHostID
     *
     * @param host
     * @param port
     * @param cb
     */
    this.getHostID = function (host, port, cb)
    {
        var hostParts = host.split(":");
        if (hostParts.length == 2)
        {
            host = hostParts[0];
            port = hostParts[1];
        }

        if (port === null)
        {
            port = 80;
        }

        var collection = that.connection.collection('hosts');
        collection.find({"host": host + ":" + port}).toArray(function (err, hosts)
        {
            if (!err && hosts.length === 1)
            {
                cb(false, host + ":" + port);
            }
            else
            {
                cb(true);
            }
        });
    };


    /** addHost
     *
     * @param host String "www.example.com:90" ||
     * @param port
     * @param cb
     */
    this.addHost = function (host, port, cb)
    {
        var hostParts = host.split(":");
        if (hostParts.length == 2)
        {
            host = hostParts[0];
            port = hostParts[1];
        }

        if (port === null)
        {
            port = 80;
        }

        // check if the host exist
        that.getHostID(host, port, function (err, host_id)
        {
            if (!err)
            {
                cb(false, host_id);
            }
            else
            {
                var collection = that.connection.collection('hosts');
                collection.insert({"host": host + ":" + port, "port": port, "status": 0}
                    , function (err, result)
                    {
                        if (!err)
                        {
                            cb(false, host + ":" + port);
                        }
                        else
                        {
                            cb(true);
                        }
                    });
            }
        });
    };


    this.updateHostStatus = function (hostID, status, cb)
    {
        var collection = that.connection.collection('hosts');
        collection.update({"host": hostID}
            , {$set: {"status": status}}, function (err, result)
            {
                cb && cb(err);
            });
    };


    this.cleanHost = function (hostID, cb)
    {
        var collection = that.connection.collection('pages');
        collection.remove({"host": hostID}, function (err)
        {
            var collection = that.connection.collection('pagesMap');
            collection.remove({"host": hostID}, function (err)
            {
                cb(err);
            });
        });
    };


    this.getAvailableHost = function (cb)
    {
        var collection = that.connection.collection('hosts');
        collection.findOne({"status": 0}, function (err, host)
        {
            if (err)
            {
                cb(true);
            }
            else
            {
                if (host && host["host"])
                {
                    cb(false, host["host"], host["host"].split(":")[0], host["port"]);
                }
                else
                {
                    cb(true);
                }
            }
        });
    };


    this.indexPage = function (host_id, unused_hostname, page, title, anchor_text, level, html, text, extraArgs, cb)
    {
        if (!anchor_text)
        {
            anchor_text = "";
            if (title)
            {
                anchor_text = title;
            }
        }

        var obj = {
            "host": host_id,
            "page": page,
            "title": title,
            "text": text,
            "cache": "",
            "anchor_text": anchor_text,
            "level": level,
            "date": new Date()
        };

        if (CONF.get("CACHE_MODE") === 1)
        {
            obj["cache"] = html;
        }
        else if (CONF.get("CACHE_MODE") === 2)
        {
            // TODO
            obj["cache"] = html;
        }

        var md5sum = crypto.createHash('md5');
        md5sum.update(html);

        obj["md5"] = md5sum.digest('hex');

        var collection = that.connection.collection('pages');
        collection.insert(obj, function (err, result)
        {
            cb && cb(err);
        });
    };


    this._savePagesMap = function (baseHostID, baseHost, basePage, linkedHostID, linkedHost, linkedPage, anchor, cb)
    {
        var collection = that.connection.collection('pagesMap');
        collection.insert({
            "host": baseHostID,
            "page": basePage,
            "linkedHost": linkedHostID,
            "linkedPage": linkedPage,
            "anchor": anchor
        }, function (err)
        {
            cb && cb();
        });
    };


    this.getPagesMap = function (host, page, cb)
    {
        if (host.indexOf(":") < 0)
        {
            host += ":80";
        }
        var collection = that.connection.collection('pagesMap');
        collection.find({"host": host, "page": page}).toArray(function (err, res1)
        {
            if (!err)
            {
                var collection = that.connection.collection('pagesMap');
                collection.find({"linkedHost": host, "linkedPage": page}).toArray(function (err, res2)
                {
                    if (!err)
                    {
                        res1 = res1.map(function (e)
                        {
                            return {
                                "url": e["linkedHost"].replace(":80", "") + e["linkedPage"],
                                "textlink": e["anchor"]
                            };
                        });
                        res2 = res2.map(function (e)
                        {
                            return {
                                "url": e["host"].replace(":80", "") + e["page"],
                                "textlink": e["anchor"]
                            };
                        });
                        cb(null, res1, res2);
                    }
                    else
                    {
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


    this.deleteDuplicatePages = function (hostID, cb)
    {
        // 1. get the first page with the md5 used by more than 1 page
        var collection = that.connection.collection('pages');
        collection.aggregate([
            {
                "$match": {"host": hostID}
            },
            {
                "$group": {"_id": "$md5", "sum": {"$sum": 1}, "page": {"$first": "$_id"}}
            },
            {
                "$match": {"sum": {"$gt": 1}}
            }
        ], function (err, rows)
        {
            if (!err)
            {
                var asyncOps = [];

                // 2. delete all the pages using the same md5 (except the first)
                for (var i = 0; i < rows.length; i++)
                {
                    (function (md5, pageID)
                    {
                        asyncOps.push(function (callback)
                        {
                            collection.remove({
                                "host": hostID,
                                "md5": md5,
                                "_id": {$ne: pageID}
                            }, function (err)
                            {
                                callback(err);
                            });
                        });
                    })(rows[i]["_id"], rows[i]["page"]);
                }

                // when all the pages are removed call the cb
                async.series(asyncOps, cb);
            }
            else
            {
                cb(err);
            }
        });
    };

};
