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

    "name": "dialog",

    "author": "mirrorjs",
    "version": "0.0.1",

    "html": function(ui, handle, parent, args)
        {
            var that = this;

            this.show = function()
            {
                this.node_cnt$.dialog(
                    {
                        modal: args["Modal"] !== undefined ? args["Modal"] : false,
                        resizable: args["Resizable"] !== undefined ? args["Resizable"] : true
                    });

                this.node_cnt$.bind( "dialogbeforeclose", function(event, _ui)
                    {
                        ui.events.fire(handle, "beforeclose", /*obj */ undefined, /* force send */ true);
                        return false;
                    });

                this.node_cnt$.click( function(event)
                    {
                        ui.events.fire(handle, "click");
                        event.stopPropagation();
                    } );

                this.node_cnt$.dialog({
                    resizeStop: function( /* unised */ )
                        {
                            ui.events.fire(handle, "resize", {"Width": parseInt(that.node_cnt$.dialog( "option", "width" )), "Height": parseInt(that.node_cnt$.dialog( "option", "height" ))}, /* force send */ true);
                        }
                    });

                // inherited by keyboard mixin
                this.bindKeyboardEvents( this.node_cnt$ );

            };


            // triggered before the widget is destroyed
            this.beforeDestroy = function()
            {
                this.node_cnt$.dialog( "destroy" );
            };


            this.props = {
                "Title":
                    {
                        "set": function(v)
                            {
                                this.node_cnt$.dialog( "option", "title", v );
                            }
                    },
                "DialogPosition":
                    {
                        "set": function(v)
                            {
                                this.node_cnt$.dialog( "option", "position", v );
                            }
                    },
                "Resizable":
                    {
                        "set": function(v)
                        {
                            this.node_cnt$.dialog( "option", "resizable", v );
                        }
                    }
                };


            this.setVisible = function(v)
            {
                this.node_cnt$.parent().css( "visibility", v ? "" : "hidden" );
            };


            this.setBorder = function(v)
            {
                this.node_cnt$.css( "border", v );
            };


            this.setWidth = function(v)
            {
                this.node_cnt$.dialog({ width: v });
            };


            this.setHeight = function(v)
            {
                this.node_cnt$.dialog({ height: v });
            };


            this.setPosition = function(v)
            {
                /* ... */
            };


            this.events = {
                "resize": function(ctl, obj)
                    {
                        // TODO
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
                    "Title":
                        {
                            "default": "",
                            "description": "Specifies the title of the dialog. If the value is null, the title attribute on the dialog source element will be used."
                        },
                    "DialogPosition":
                        {
                            "default": { my: "center", at: "center", of: null },
                            "description": "Specifies where the dialog should be displayed when opened. The dialog will handle collisions such that as much of the dialog is visible as possible."
                        },
                    "Resizable":
                    {
                        "default": true,
                        "description": "If set to true, the dialog will be resizable."
                    }
                };


            this.events = {
                "beforeclose": function(ctl, obj)
                    {
                        if ( this.getCustomEventHandler("beforeclose") === undefined )
                        {
                            // the custom "beforeclose" has not been implemented!
                            // defaulting to: destroy dialog
                            this.destroy();
                        }
                    },
                "resize": function(ctl, obj)
                    {
                        // updates the status
                        this.Width = obj["Width"];
                        this.Height = obj["Height"];
                    }
            };

        }

});
