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

    "name": "radiobutton",

    "author": "mirrorjs",
    "version": "0.0.1",

    "html": function(ui, handle, parent, args)
        {
            var that = this;

            this.show = function()
            {
                this.node_cnt$.append(
                    '<span id="rd_' + this.handle + '"><input id="rdi_' + this.handle + '" type="radio" /><label id="rdlbl_' + this.handle + '" for="rdi_' + this.handle + '"></label></span>'
                );

                this.node$ = $("#rd_" + this.handle, this.node_cnt$);
                this.node_input$ = $("#rdi_" + this.handle, this.node_cnt$);
                this.node_label$ = $("#rdlbl_" + this.handle, this.node_cnt$);

                this.node_input$.click( function(event)
                    {
                        ui.events.fire(handle, "click", {"Checked": that.node_input$.prop( "checked" ) }, /* force send */ true);
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
                                this.node_label$.text( v );
                            }
                    },
                "Checked":
                    {
                        "set": function(v)
                            {
                                this.node_input$.prop( "checked", v );
                            }
                    },
                "GroupName":
                    {
                        "set": function(v)
                            {
                                this.node_input$.prop( "name", v );
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
            var _checked = false;
            this.props =
                {
                    "Caption":
                        {
                            "default": "",
                            "description": "The text content of the control."
                        },
                    "GroupName":
                        {
                            "default": "",
                            "description": 'The name of the group that the radio button belongs to. The default is an empty string ("").'
                        },
                    "Checked":
                        {
                            "get": function()
                                {
                                    return _checked;
                                },
                            "set": function(nv)
                                {
                                    _checked = nv;
                                    return nv;
                                },
                            "description": "true to indicate a checked state; otherwise, false. The default is false."
                        }
                };


            this.events = {
                "click": function(ctl, obj)
                    {
                        // updates the (internal) status of Checked
                        _checked = obj["Checked"];
                    }
            };

        }
});
