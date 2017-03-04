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

    "name": "combobox",

    "author": "mirrorjs",
    "version": "0.0.1",

    "html": function(ui, handle, parent, args)
        {

            var that = this;

            this.show = function()
            {
                this.node_cnt$.append(
                    '<select id="select_' + this.handle + '"></select>'
                );

                this.node$ = $("#select_" + this.handle, this.node_cnt$);

                this.node$.click( function(event)
                    {
                        ui.events.fire(handle, "click");
                        event.stopPropagation();
                    } );

                this.node$.change( function(event)
                    {
                        var index = that.node$.get(0).selectedIndex;
                        var key = undefined;
                        if ( index >= 0 )
                        {
                            key = that.node$.get(0).options[index].value;
                        }
                        ui.events.fire(handle, "change", key, /* force send */ true);
                    } );

                // inherited by keyboard mixin
                this.bindKeyboardEvents( this.node$ );
            };


            this.__clear = function(obj)
            {
                this.node$.empty();
            };


            this.__addItem = function(key, value)
            {
                $('<option value="' + key + '"></option>').text(value).appendTo(this.node$);
            };


            this.__syncSelected = function(oldVal)
            {
                if ( oldVal !== this.node$.get(0).value )
                {
                    ui.events.fire(handle, "change", this.node$.get(0).value, /* force send */ true);
                }
            };


            this.events = {
                "__clear": function()
                    {
                        var oldVal = this.node$.get(0).value;

                        this.__clear();

                        this.__syncSelected( oldVal );
                    },

                "__addItem": function(ctl, obj)
                    {
                        var oldVal = this.node$.get(0).value;

                        this.__addItem(obj["key"], obj["value"]);

                        this.__syncSelected( oldVal );
                    },

                "__removeItem": function(ctl, obj)
                {
                    var oldVal = this.node$.get(0).value;

                    this.node$.find("option[value='" + /* key */ obj + "']").remove();

                    this.__syncSelected( oldVal );
                }

            };


            this.props = {
                "Listbox":
                    {
                        "set": function(v)
                            {
                                if ( v === true )
                                {
                                    this.node$.attr("size", 4);
                                }
                                else
                                {
                                    this.node$.attr("size", 1);
                                }
                            }
                    },
                "Items":
                    {
                        "set": function(v)
                            {
                                var oldVal = this.node$.get(0).value;

                                this.__clear();
                                for(var i=0; i< v.length; i++)
                                {
                                    this.__addItem(v[i]["key"], v[i]["value"]);
                                }

                                this.__syncSelected( oldVal );
                            }
                    },

                "Item":
                    {
                        "get": function(index)
                            {
                                var opt = this.node$.find("option:eq(" + index + ")");
                                if ( opt.val() === undefined )
                                {
                                    return {"key": undefined, "value": undefined};
                                }
                                return {"key": opt.val(), "value": opt.text()};
                            }
                    },

                "Selected":
                    {
                        "get": function()
                            {
                                return this.node$.get(0).value;
                            },
                        "set": function(v)
                            {
                                var oldVal = this.node$.get(0).value;

                                this.node$.get(0).value = v;

                                this.__syncSelected( oldVal );
                            }
                    },

                "ItemsCount":
                    {
                        "get": function()
                            {
                                return this.node$.get(0).length;
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
            var _selected = "";
            this.props =
            {
                "Listbox":
                {
                    "default": false,
                    "type": "boolean",
                    "description": "Whether the widget represents a combobox or a listbox."
                },
                "Items":
                {
                    "default": [],
                    "description": 'An array that represents the items within the combobox in the form: [{key: "key", value: "value"}, ...]. The default is an empty array.'
                },
                "Selected":
                {
                    "get": function()
                    {
                        return _selected;
                    },
                    "set": function(nv)
                    {
                        _selected = nv;
                        return nv;
                    },
                    "description": 'The key of the selected item in the control. The default is an empty string ("").'
                }
            };


            this.events = {
                "change": function(ctl, obj)
                {
                    _selected = obj;
                }
            };


            this.clear = function()
            {
                iApp.events.fire(handle, "__clear");
                _selected = "";
            };


            this.addItem = function(key, value)
            {
                iApp.events.fire(handle, "__addItem", {"key": key, "value": value});
            };


            this.removeItem = function(key)
            {
                iApp.events.fire(handle, "__removeItem", key);
            };


            /*
             * Ask the frontend for the number of elements
             *
             */
            this.getItemsCount = function(callback)
            {
                iApp.frontend.getProp(handle, "ItemsCount", callback);
            };


            /*
             * Ask the frontend for the element at index 'index'
             *
             */
            this.getItem = function(index, callback)
            {
                iApp.frontend.getProp(handle, "Item", callback, parseInt(index));
            };

        }
});
