var async = require('async');
var crypto = require('crypto');


module.exports = function (CONF)
{
    var that = this;


    /** checkDB
     *
     * @param cb
     */
    this.checkDB = function (cb)
    {
        async.series([
            function (callback)
            {
                // Update 0001: ETAG and lastModified
                that.query(that.sqlTemplates["dbUpdCheck0001"], null, function (err, result)
                {
                    if (result.rowCount === 0)
                    {
                        // field not found: add it!
                        that.query(that.sqlTemplates["dbUpdPatch0001"], null, function ()
                        {
                            callback(false);
                        });
                    }
                    else
                    {
                        callback(false);
                    }
                });
            }
            /*, ... */
        ], function (err)
        {
            cb(err);
        });
    };


    /** getHostID
     *
     * @param host
     * @param port
     * @param cb
     */
    this.getHostID = function (host, port, cb)
    {
        that.query(that.sqlTemplates["getHostID"], [host, port], function (err, result)
        {
            if (err || result.rowCount === 0)
            {
                cb(true);
            }
            else
            {
                cb(false, result.rows[0]["id"]);
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

        // check if the host exists
        that.getHostID(host, port, function (err, host_id)
        {
            if (!err)
            {
                cb(false, host_id);
            }
            else
            {
                that.query(that.sqlTemplates["addHost"], [host, port], function (err, result)
                {
                    if (!err && result.rowCount === 1)
                    {
                        that.getHostID(host, port, function (err, host_id)
                        {
                            if (!err)
                            {
                                cb(false, host_id);
                            }
                            else
                            {
                                cb(true);
                            }
                        });
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
        that.query(that.sqlTemplates["updateHostStatus"], [status, hostID], function (err, result)
        {
            cb && cb(err);
        });
    };


    this.cleanHost = function (hostID, cb)
    {
        that.query(that.sqlTemplates["cleanHost_01"], [hostID], function (err, result)
        {
            that.query(that.sqlTemplates["cleanHost_02"], [hostID], function (err, result)
            {
                cb(err);
            });
        });
    };


    this.getAvailableHost = function (cb)
    {
        // get the first available host from the db
        that.query(that.sqlTemplates["getHostByStatus"] + " ORDER by priority DESC LIMIT 1", [/* Status: un-indexed */ 0], function (err, result)
        {
            if (err || result.rowCount === 0)
            {
                cb(true);
                return;
            }
            cb(false, result.rows[0]["id"], result.rows[0]["hostname"], result.rows[0]["port"]);
        });
    };


    this.setOutdatedStatus = function (hostID, page, status, cb)
    {
        var sql, inserts = null;
        if (page !== null)
        {
            // all pages
            sql = that.sqlTemplates["setOutdatedPage"];
            inserts = [status, hostID, page];
        }
        else
        {
            sql = that.sqlTemplates["setOutdatedHost"];
            inserts = [status, hostID];
        }

        that.query(sql, inserts, function (err)
        {
            cb && cb(err);
        });
    };


    this.removeOutdatedPages = function (hostID, cb)
    {
        that.query(that.sqlTemplates["removeOutdated"], [hostID], function (err)
        {
            cb && cb(err);
        });
    };


    this.getIndexedPageInfo = function (hostID, page, cb)
    {
        that.query(that.sqlTemplates["getPageInfo"], [hostID, page], function (err, result)
        {
            cb && cb(err, result);
        });
    };


    this.indexPage = function (host_id, hostname, page, title, anchor_text, level, html, text, extraArgs, cb)
    {
        if (!anchor_text)
        {
            anchor_text = "";
            if (title)
            {
                anchor_text = title;
            }
        }

        if(!extraArgs['contentType'] && extraArgs['response'] && extraArgs['response']['headers'] && extraArgs['response']['headers']['content-type'])
        {
            extraArgs['contentType'] = extraArgs['response']['headers']['content-type'];
        }

        var unescapedSql = that.sqlTemplates["indexPage"];
        unescapedSql += " ( ";

        var fields = {
            host_id: host_id,
            hostname: hostname,
            page: page,
            title: title,
            anchor_text: anchor_text,
            level: level,
            contenttype: extraArgs['contentType'],
            text: text,
            outdated: 0,
            date: new Date()
        };

        if (CONF.get("CACHE_MODE") > 0)
        {
            fields["cache"] = html;
        }

        var md5sum = crypto.createHash('md5');
        md5sum.update(html);
        fields["html_md5"] = md5sum.digest('hex');

        if (extraArgs && extraArgs.response && extraArgs.response.headers)
        {
            if (extraArgs.response.headers['last-modified'])
            {
                fields["lastModified"] = extraArgs.response.headers['last-modified'];
            }

            if (extraArgs.response.headers['etag'])
            {
                fields["etag"] = extraArgs.response.headers['etag'];
            }
        }

        var strValues = "",
            inserts = [],
            fieldCount = 1;
        Object.keys(fields).map(function (field)
        {
            if( fieldCount > 1 )
            {
                unescapedSql += ", ";
                strValues += ", ";
            }
            unescapedSql += field;
            strValues += " $" + fieldCount;
            inserts.push(fields[field]);
            fieldCount++;
        });

        unescapedSql += ", tstext";
        strValues += ", to_tsvector( $" + fieldCount + ") ";
        inserts.push(text);

        unescapedSql += " ) VALUES (" + strValues + ")";

        that.query(unescapedSql, inserts, function (err)
        {
            cb && cb(err);
        });

    };


    this._savePagesMap = function (baseHostID, baseHost, basePage, linkedHostID, linkedHost, linkedPage, anchor, cb)
    {
        that.query(that.sqlTemplates["savePageMap"], [
            baseHostID,
            basePage,
            linkedHostID,
            linkedPage,
            anchor
        ], function (err, result)
        {
            cb && cb();
        }, {suppressErrors: true});
    };


    this.getPagesMap = function (host, page, cb)
    {
        that.query(that.sqlTemplates["getPageMapLinks"], [host, page], function (err, resultLinks)
        {
            if (!err)
            {
                that.query(that.sqlTemplates["getPageMapLinked"], [host, page], function (err, resultLinked)
                {
                    if (!err)
                    {
                        cb(null, resultLinks.rows, resultLinked.rows);
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
        that.query(that.sqlTemplates["deleteDupPages"], [hostID], function (err, result)
        {
            cb && cb(err);
        });
    };


    this.deletePage = function (hostID, page, cb)
    {
        that.query(that.sqlTemplates["deletePage"], [hostID, page], function (err, result)
        {
            cb && cb(err);
        });
    };


};
