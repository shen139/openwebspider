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


var mirrorJS = mirrorJSRequire("mirrorJS");


mirrorJS.widgets.controller.install({

    "name": "button",

    "author": "mirrorjs",
    "version": "0.0.1",

    "html": function(ui, handle, parent, args)
        {

            this.show = function()
            {
                this.node_cnt$.append(
                    '<button id="btn_' + this.handle + '" type="button"></button>'
                );

                this.node$ = $("#btn_" + this.handle, this.node_cnt$);

                this.node$.click( function(event)
                    {
                        ui.events.fire(handle, "click");
                        event.stopPropagation();
                    } );

                // inherited by keyboard mixin
                this.bindKeyboardEvents( this.node$ );
            };


            this.props = {
                "Caption":
                    {
                        "set": function(v)
                            {
                                this.node$.text( v );
                            }
                    }
                };


            // inherit keyboard mixin
            this.loadMixin("keyboard", function(eventName, originalEvent, params)
                {
                    ui.events.fire(handle, eventName, params);
                    event.stopPropagation();
                });

        },


    "backend": function(iApp, handle, parent, args)
        {
            // Properties
            this.props =
                {
                    "Caption":
                        {
                            "default": "",
                            "description": "The text caption displayed in the Button control."
                        }
                };

        }
});
