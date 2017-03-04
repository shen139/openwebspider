/*
 * Copyright (c) 2014 mirrorJS
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

/**
 * Properties:
 *     Value [int || boolean] (default: false)
 *     Max [int] (default: 100)
 *
 *  Events:
 *     progressbarcreate
 *     progressbarcomplete
 *     click
 *
 * See more:
 *    http://api.jqueryui.com/progressbar/
 *
 */

var mirrorJS = mirrorJSRequire("mirrorJS");


mirrorJS.widgets.controller.install({

    "name": "progressbar",

    "author": "mirrorjs",
    "version": "0.0.1",


    "html": function (ui, handle, parent, args)
    {

        this.show = function ()
        {
            this.node_cnt$.append(
                '<div id="pb_' + this.handle + '"></div>'
            );

            this.node$ = $("#pb_" + this.handle, this.node_cnt$);

            this.node$.progressbar({value: false});

            this.node$.on("progressbarcreate", function ()
            {
                ui.events.fire(handle, "progressbarcreate");
            });

            this.node$.on("progressbarcomplete", function ()
            {
                ui.events.fire(handle, "progressbarcomplete");
            });

            this.node$.click(function (event)
            {
                ui.events.fire(handle, "click");
                event.stopPropagation();
            });

            // inherited by keyboard mixin
            this.bindKeyboardEvents(this.node$);
        };


        // triggered before the widget is destroyed
        this.beforeDestroy = function ()
        {
            this.node$.progressbar("destroy");
        };


        this.props = {
            "Value": {
                "set": function (v)
                {
                    this.node$.progressbar("option", "value", v);
                }
            },
            "Max": {
                "set": function (v)
                {
                    this.node$.progressbar("option", "max", v);
                }
            }
        };


        // inherit keyboard mixin
        this.loadMixin("keyboard", function (eventName, originalEvent, params)
        {
            ui.events.fire(handle, eventName, params);
            event.stopPropagation();
        });

    },


    "backend": function (iApp, handle, parent, args)
    {
        // Properties
        this.props =
        {
            "Value": {
                "default": false,
                "description": "The value of the progressbar."
            },
            "Max": {
                "default": 100,
                "type": "int",
                "description": "The maximum value of the progressbar."
            }
        };
    }
});
