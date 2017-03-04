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

    "name": "textfield",

    "author": "mirrorjs",
    "version": "0.0.1",

    "html": function(ui, handle, parent, args)
        {
            this.show = function()
            {
                this.multiline = args["MultiLine"] !== undefined ? args["MultiLine"] : false;

                var txtHTML = "";
                if ( this.multiline === true )
                {
                    txtHTML = '<textarea id="txt_' + this.handle + '"></textarea>';
                }
                else
                {
                    txtHTML = '<input type="text" id="txt_' + this.handle + '" />';
                }
                this.node_cnt$.append( txtHTML );

                this.node$ = $("#txt_" + this.handle, this.node_cnt$);

                this.node$.change( function()
                    {
                        ui.events.fire(handle, "change", {"Text": $(this).val()}, /* force send */ true);
                    } );

                this.node$.click( function(event)
                    {
                        ui.events.fire(handle, "click");
                        event.stopPropagation();
                    } );

                // inherited by keyboard mixin
                this.bindKeyboardEvents( this.node$ );

            };


            this.props = {
                "Text":
                    {
                        "get": function()
                            {
                                return this.node$.val();
                            },
                        "set": function(v)
                            {
                                this.node$.val( v );
                            }
                    },
                "ReadOnly":
                    {
                        "set": function(v)
                            {
                                this.node$.attr( "readonly", v );
                            }
                    },
                "SelectionStart":
                    {
                        "set": function(v)
                            {
                                this.node$.get(0).selectionStart=v;
                            }
                    },
                "SelectionEnd":
                    {
                        "set": function(v)
                            {
                                this.node$.get(0).selectionEnd=v;
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
            var _text = "";
            this.props =
                {
                    "ReadOnly":
                        {
                            "default": false,
                            "type": "boolean",
                            "description": "true if the contents of the textfield control cannot be changed; otherwise, false. The default value is false."
                        },
                    "Text":
                        {
                            "get": function()
                                {
                                    return _text;
                                },
                            "set": function(nv)
                                {
                                    _text = nv;
                                    return nv;
                                },
                            "description": 'The text displayed in the textfield control. The default is an empty string ("").'

                        },
                    "SelectionStart":
                        {
                            "default": 0,
                            "type": "int",
                            "description": "The value specifies the index of the first selected character."
                        },
                    "SelectionEnd":
                        {
                            "default": 0,
                            "type": "int",
                            "description": "The value specifies the index of the character after the selection. If this value is equal to the value of the selectionStart property, no text is selected, but the value indicates the position of the caret (cursor) within the textbox."
                        }
                };


            this.events = {
                "change": function(ctl, obj)
                    {
                        // updates the (internal) status of Text
                        _text = obj["Text"];
                    }
            };


            /*
             * Ask the frontend for the text (sometimes, for example in keyboard events, you can't use widget.Text)
             * The Text property is updated _only_ when the "change" event is triggered.
             *
             */
            this.getText = function(callback)
            {
                iApp.frontend.getProp(handle, "Text", callback);
            };

        }

});
