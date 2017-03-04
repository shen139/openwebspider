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
 *     Value [int] (default: 0)
 *     Values (default: null)
 *     Range [boolean] (default: false)
 *     Orientation [string] (default: "horizontal")
 *     Step [int] (default: 0)
 *     Min [int] (default: 0)
 *     Max [int] (default: 100)
 *
 *  Events:
 *     progressbarcreate
 *     progressbarcomplete
 *     click
 *
 * See more:
 *    http://api.jqueryui.com/slider/
 *
 */

var mirrorJS = mirrorJSRequire("mirrorJS");


mirrorJS.widgets.controller.install({

    "name": "slider",

    "author": "mirrorjs",
    "version": "0.0.1",


    "html": function (ui, handle, parent, args)
    {

        this.show = function ()
        {
            this.node_cnt$.append(
                '<div id="s_' + this.handle + '"></div>'
            );

            this.node$ = $("#s_" + this.handle, this.node_cnt$);

            this.node$.slider();

            this.node$.on("slidecreate", function ()
            {
                ui.events.fire(handle, "slidecreate");
            });

            this.node$.on("slide", function ()
            {
                ui.events.fire(handle, "slide");
            });

            this.node$.on("slidestart", function ()
            {
                ui.events.fire(handle, "slidestart");
            });

            this.node$.on("slidestop", function ()
            {
                ui.events.fire(handle, "slidestop");
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
            this.node$.slider("destroy");
        };


        this.props = {
            "Value": {
                "set": function (v)
                {
                    this.node$.progressbar("option", "value", v);
                }
            },
            "Values": {
                "set": function (v)
                {
                    this.node$.progressbar("option", "values", v);
                }
            },
            "Range": {
                "set": function (v)
                {
                    this.node$.progressbar("option", "range", v);
                }
            },
            "Orientation": {
                "set": function (v)
                {
                    this.node$.progressbar("option", "orientation", v);
                }
            },
            "Step": {
                "set": function (v)
                {
                    this.node$.progressbar("option", "step", v);
                }
            },
            "Min": {
                "set": function (v)
                {
                    this.node$.progressbar("option", "min", v);
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
                "default": 0,
                "type": "int",
                "description": "Determines the value of the slider, if there's only one handle. If there is more than one handle, determines the value of the first handle."
            },
            "Values": {
                "default": null,
                "description": "This option can be used to specify multiple handles. If the range option is set to true, the length of values should be 2."
            },
            "Range": {
                "default": false,
                "type": "boolean",
                "description": "Whether the slider represents a range."
            },
            "Orientation": {
                "default": "horizontal",
                "description": 'Determines whether the slider handles move horizontally (min on left, max on right) or vertically (min on bottom, max on top). Possible values: "horizontal", "vertical".'
            },
            "Step": {
                "default": 0,
                "type": "int",
                "description": "Determines the size or amount of each interval or step the slider takes between the min and max. The full specified value range of the slider (max - min) should be evenly divisible by the step."
            },
            "Min": {
                "default": 0,
                "type": "int",
                "description": "The minimum value of the slider."
            },
            "Max": {
                "default": 100,
                "type": "int",
                "description": "The maximum value of the slider."
            }
        };
    }
});
