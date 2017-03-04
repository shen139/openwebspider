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

    "name": "container",

    "author": "mirrorjs",
    "version": "0.0.1",

    "html": function(ui, handle, parent, args)
        {
            var that = this;

            this.show = function()
            {
                this.node$ = this.node_cnt$;
                this.node_cnt$.click( function(event)
                    {
                        ui.events.fire(handle, "click");
                        event.stopPropagation();
                    } );
            };


            this.props = {
                "Parent":
                    {
                        "set": function(v)
                            {
                                var node = this.node_cnt$.detach();
                                $( v ).append( node );
                            }
                    },
                "Resizable":
                    {
                        "set": function(v)
                            {
                                if ( v === false )
                                {
                                    if ( this.node_cnt$.hasClass("ui-resizable") )
                                    {
                                        this.node_cnt$.resizable( "destroy" );
                                    }
                                    return;
                                }

                                // example {grid: 50}
                                // add the "stop" event handler
                                v["stop"] = function()
                                    {
                                        ui.events.fire(handle, "resize", {"Width": parseInt(that.node_cnt$.width()), "Height": parseInt(that.node_cnt$.height())}, /* force send */ true);
                                    };
                                this.node_cnt$.resizable(v);
                            }
                    }
                };

        },


    "backend": function(iApp, handle, parent, args)
        {
            // Properties
            this.props =
                {
                    "Resizable":
                        {
                            "default": false,
                            "type": "boolean"
                        }
                };

            this.events = {
                "resize": function(ctl, obj)
                    {
                        // updates the status
                        this.Width = obj["Width"];
                        this.Height = obj["Height"];
                    }
            };

            // why not a property?
            this.setParent = function(p)
            {
                iApp.setState(handle, "Parent", p);
            };

        }
});
