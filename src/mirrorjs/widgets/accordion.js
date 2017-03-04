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

    "name": "accordion",

    "author": "mirrorjs",
    "version": "0.0.1",


    "html": function(ui, handle, parent, args)
        {

            this.show = function()
            {
                this.node_cnt$.append(
                    '<div id="a_' + this.handle + '"></div>'
                );

                this.node$ = $("#a_" + this.handle, this.node_cnt$);

                this.accordion = this.node$.accordion({ collapsible: true, heightStyle: "fill" });

                this.node$.on( "accordionactivate", function()
                    {
                        ui.events.fire(handle, "accordionactivate");
                    } );

                this.node$.click( function(event)
                    {
                        ui.events.fire(handle, "click");
                        event.stopPropagation();
                    } );

                // inherited by keyboard mixin
                this.bindKeyboardEvents( this.node$ );
            };


            // triggered before the widget is destroyed
            this.beforeDestroy = function()
            {
                this.accordion.accordion( "destroy" );
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
            this.isGoodChild = function(ctl)
            {
                if ( ctl && ctl.type === "accordionPanel" )
                {
                    // accordion can only accept accordionPanel
                    return true;
                }
                return false;
            };
        }
});


mirrorJS.widgets.controller.install({

    "name": "accordionPanel",

    "author": "mirrorjs",
    "version": "0.0.1",


    "html": function(ui, handle, parent, args)
        {

            this.create = function()
            {
                parent.accordion.append( '<h3 id="ap_title_' + this.handle + '"> Panel </h3><div id="ap_' + this.handle + '"></div>' );
                this.node$ = this.node_cnt$ = $("#ap_" + this.handle);
                this.apTitle$ = $("#ap_title_" + this.handle);

                this.node$.css("position", "relative");

                parent.accordion.accordion( "refresh" );

                this.node_cnt$.click( function(event)
                    {
                        ui.events.fire(handle, "click");
                        event.stopPropagation();
                    } );
            };


            // triggered before the widget is destroyed
            this.beforeDestroy = function()
            {
                this.node_cnt$.remove();
                this.apTitle$.remove();
            };


            this.afterDestroy = function()
            {
                parent.accordion.accordion( "refresh" );
            };

            this.setPosition = function(v)
            {
                /* nothing */
            };


            this.setTop = function(v)
            {
                /* nothing */
            };


            this.setLeft = function(v)
            {
                /* nothing */
            };


            this.setWidth = function(v)
            {
                /* nothing */
            };


            this.setHeight = function(v)
            {
                /* nothing */
            };


            this.props = {
                "Caption":
                    {
                        "set": function(v)
                            {
                                this.apTitle$.text( v );
                                parent.accordion.accordion( "refresh" );
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
                            "description": "The text content of the control."
                        }
                };


            this.isGoodParent = function()
            {
                if ( parent && parent.type === "accordion" )
                {
                    // accordion can only accept accordionPanel
                    return true;
                }
                return false;
            };
        }
});
