module.exports = function (CONF)
{
    var that = this;


    /** lockHost
     *
     * @param host String Optional
     * @param port String Optional
     * @param cb
     *
     * cb(err, host_id, url);
     *
     */
    this.lockHost = function (host, port, cb)
    {
        function __lockHost(host_id, host, port)
        {
            var url = "http://" + host + (port !== 80 ? ":" + port : "") + "/";

            // lock the host
            that.updateHostStatus(host_id, /* Status: indexing */ 2, function (err)
            {
                if (!err)
                {
                    if (CONF.get("UPDATE_MODE") === false)
                    {
                        // delete all the pages (rels + images)
                        that.cleanHost(host_id, function (err)
                        {
                            if (err)
                            {
                                cb(true);
                            }
                            else
                            {
                                cb(false, host_id, url);
                            }
                        });
                    }
                    else
                    {
                        that.setOutdatedStatus(host_id, /* all pages */ null, /* status */ 1, function (err)
                        {
                            cb(err, host_id, url);
                        });
                    }
                }
                else
                {
                    cb(true);
                }
            });
        }

        // --

        if (host !== null)
        {
            if (port === null)
            {
                port = 80;
            }
            // the host exist?
            that.getHostID(host, port, function (err, host_id)
            {
                if (!err)
                {
                    // lock the host
                    __lockHost(host_id, host, port);
                }
                else
                {
                    // add the host
                    that.addHost(host, port, function (err, host_id)
                    {
                        if (!err)
                        {
                            // lock the host
                            __lockHost(host_id, host, port);
                        }
                        else
                        {
                            // can't add the host
                            cb(true);
                        }
                    })
                }
            })
        }
        else
        {
            that.getAvailableHost(function (err, host_id, hostname, port)
            {
                if (!err)
                {
                    __lockHost(host_id, hostname, port);
                }
                else
                {
                    cb(true);
                }
            });
        }
    };


    this.saveHosts = function (hostsArray, cb)
    {
        if (hostsArray.length === 0)
        {
            cb && cb();
            return;
        }
        for (var i = 0; i < hostsArray.length; i++)
        {
            (function (host, isLast)
            {
                that.addHost(host, null, function ()
                {
                    if (isLast)
                    {
                        cb && cb();
                    }
                });
            })(hostsArray[i], i === hostsArray.length - 1);
        }
    };


    this.savePagesMap = function (baseHostID, baseHostPage, pagesMap, cb)
    {
        if (pagesMap.length === 0 || CONF.get("PAGES_MAP") === 0)
        {
            cb && cb();
            return;
        }

        for (var i = 0; i < pagesMap.length; i++)
        {
            (function (page, linkedHost, linkedPage, anchor, isLast)
            {
                if (baseHostPage["host"] == linkedHost)
                {
                    // same host
                    that._savePagesMap(baseHostID, linkedHost, page, baseHostID, linkedHost, linkedPage, anchor, function ()
                    {
                        if (isLast)
                        {
                            cb && cb();
                        }
                    });
                }
                else
                {
                    if (CONF.get("ADD_EXTERNAL_HOSTS") === true)
                    {
                        that.addHost(linkedHost, null, function (err, host_id)
                        {
                            if (!err)
                            {
                                that._savePagesMap(baseHostID, linkedHost, page, host_id, linkedHost, linkedPage, anchor, function ()
                                {
                                    if (isLast)
                                    {
                                        cb && cb();
                                    }
                                });
                            }
                            else if (isLast)
                            {
                                cb && cb();
                            }
                        });
                    }
                    else
                    {
                        if (isLast)
                        {
                            cb && cb();
                        }
                    }
                }
            })(pagesMap[i]["page"],
                pagesMap[i]["linkedHost"],
                pagesMap[i]["linkedPage"],
                pagesMap[i]["anchor"],
                i === pagesMap.length - 1);
        }
    };


    /**
     * TESTs
     *
     */
    this.testHostsDB = function ()
    {
        // 1. addHost
        that.addHost("www.openwebspider.org", 80, function (err, hostID)
        {
            console.log("addHost err: ", err, " -- hostID: ", hostID);

            // 2. getHostId
            that.getHostID("www.openwebspider.org", 80, function (err, hostID)
            {
                console.log("getHostID hostID: ", hostID, " -- err: ", err);

                // 3. updateHostStatus
                that.updateHostStatus(hostID, 0, function (err)
                {
                    console.log("updateHostStatus err: ", err);

                    // 4. clean
                    that.cleanHost(hostID, function (err)
                    {
                        console.log("cleanHost err: ", err);

                        that.lockHost(null, null, function (err)
                        {
                            console.log("lockHost1 err: ", err);

                            that.lockHost("www.openwebspider.com", 80, function (err)
                            {
                                console.log("lockHost2 err: ", err);
                                that.close();
                            });
                        });
                    })
                })
            })
        })
    };

};
