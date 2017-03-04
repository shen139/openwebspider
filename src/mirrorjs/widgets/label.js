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

    "name": "label",

    "author": "mirrorjs",
    "version": "0.0.1",

    "html": function(ui, handle, parent, args)
        {
            this.show = function()
            {
                this.node_cnt$.append(
                    '<label id="lbl_' + this.handle + '"></label>'
                );

                this.node$ = $("#lbl_" + this.handle, this.node_cnt$);
                this.help_node$ = null;

                this.node$.click( function(event)
                    {
                        ui.events.fire(handle, "click");
                        event.stopPropagation();
                    } );
            };


            var helpText = "(?)";
            this.props = {
                "Caption":
                    {
                        "set": function(v)
                            {
                                this.node$.text( v );
                            }
                    },
                "HelpLink":
                    {
                        "set": function(v)
                        {
                            if(v)
                            {
                                if(this.help_node$ === null)
                                {
                                    this.node$.append(' <a id="lbl_help_' + this.handle + '" target="_blank"></a>');
                                    this.help_node$ = $("#lbl_help_" + this.handle, this.node_cnt$);
                                    this.help_node$.attr("href", v);
                                    this.help_node$.text( helpText );
                                }
                            }
                            else
                            {
                                if(this.help_node$ !== null)
                                {
                                    this.help_node$.remove();
                                    this.help_node$ = null;
                                }
                            }

                        }
                    },
                "HelpText":
                    {
                        "set": function(v)
                        {
                            if(v)
                            {
                                helpText = v;
                            }
                            else
                            {
                                helpText = "(?)";
                            }
                            if(this.help_node$ !== null)
                            {
                                this.help_node$.text( helpText );
                            }
                        }
                    }
                };

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
                        },
                    "HelpLink":
                        {
                            "default": null,
                            "description": "Specifies the URL of the help page."
                        },
                    "HelpText":
                        {
                            "default": null,
                            "description": "Specifies the text of the help link."
                        }
                };

        }
});
