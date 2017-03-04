var fs = require('fs');

var logger = require("../_utils/logger");


module.exports = function ()
{
    var that = this;

    this.availablePlugins = {};

    this.pluginsAreLoaded = false;

    this.plugins_conts = {
        "PLUGIN_NOT_INTERESTED": false,
        "PLUGIN_OK": true,

        "PLUGIN_SKIP_HOST": 10,
        "PLUGIN_SKIP_PAGE": 11,

        "PLUGIN_NEXT_HOST": 20,

        "PLUGIN_SIGNALS_STOP_WORKER": 50
    };

    /**
     * Calls all the plugins that implements an async "method", waits the end of all the callbacks and calls a callback ("cb") of the caller
     *
     *
     * @param method
     * @param argsArray
     * @param plugins Plugins name array || null (all)
     * @param cb
     *
     */
    this.pluginAsyncCall = function (method, argsArray, plugins, cb)
    {
        var questions = 0, answers = 0, returnValues = {};

        if (argsArray === null)
        {
            argsArray = [];
        }

        if (plugins === null)
        {
            // all plugins
            plugins = Object.keys(that.availablePlugins);
        }

        function _answer(pluginName, originalArguments)
        {
            answers++;

            // stores the plugins return value
            returnValues[pluginName] = originalArguments;

            if (answers === questions)
            {
                // Done!
                cb(returnValues);
            }
        }

        plugins.map(function (pluginName)
        {
            (function (pluginInstance)
            {
                if (pluginInstance && pluginInstance[method] !== undefined)
                {
                    questions++;

                    // async plugin's method call
                    // used to give back the control to the plugins cycle
                    // and to have the correct value of "questions" before the _answer is called
                    setTimeout(function ()
                    {
                        // clone the argsArray
                        var tmpArgsArray = argsArray.slice(0);

                        // internal callback pushed in the arguments list as last argument
                        tmpArgsArray.push(function ()
                        {
                            _answer(pluginInstance["name"], arguments);
                        });


                        // console.log("pluginManager::calling: " + pluginInstance.name + "." + method);

                        pluginInstance[method].apply(pluginInstance, tmpArgsArray);
                    }, 0);
                }
                else
                {
                    returnValues[pluginName] = [true];
                }
            })(that.availablePlugins[pluginName]);

        });

        if (questions === 0)
        {
            // no plugins questioned
            // immediately call the callback
            cb({});
        }
    };


    this.loadPlugins = function (cb)
    {
        if (that.pluginsAreLoaded === true)
        {
            cb && cb();
            return;
        }
        that.pluginsAreLoaded = true;

        that.availablePlugins = {};
        var path = global.__base_path + "plugins";
        logger.log("Plugin", "Loading plugins in [" + path + "]...");
        var files = fs.readdirSync(path);

        if (files.length === 0)
        {
            logger.log("Plugin", "ERROR: Invalid widget's path.");
            return;
        }

        files.filter(function (file)
        {
            return file.substr(-3) == '.js';
        }).forEach(function (file, index, array)
        {
            var tmpReq, pluginInstance;
            tmpReq = require(path + "/" + file);
            pluginInstance = new tmpReq(/* openwebspider object */ {
                "conf": that.CONF,
                "const": that.plugins_conts,
                "addURL": that.addURL,
                "dbManager": that.dbManager,
                "utils": {
                    "onlyOneWhitespace": that.onlyOneWhitespace
                }
            });

            that.availablePlugins[pluginInstance.name] = pluginInstance;

            if (index === array.length - 1)
            {
                // last plugin
                cb && cb();
            }
        });
    };

};
