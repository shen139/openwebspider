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

    "name": "hyperlink",

    "author": "mirrorjs",
    "version": "0.0.1",

    "html": function(ui, handle, parent, args)
        {
            this.show = function()
            {
                this.node_cnt$.append(
                    '<a id="hl_' + this.handle + '" target="_blank"></a>'
                );

                this.node$ = $("#hl_" + this.handle, this.node_cnt$);

                this.node$.click( function(event)
                    {
                        ui.events.fire(handle, "click");
                        event.stopPropagation();
                    } );
            };


            this.props = {
                "Caption":
                    {
                        "set": function(v)
                            {
                                this.node$.text( v );
                            }
                    },
                "Link":
                    {
                        "set": function(v)
                            {
                                this.node$.prop( "href", v );
                            }
                    },
                "Target":
                    {
                        "set": function(v)
                            {
                                this.node$.prop( "target", v );
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
                    "Link":
                        {
                            "default": "",
                            "description": "Specifies the URL of the page the link goes to."
                        },
                    "Target":
                        {
                            "default": "_blank",
                            "description": "Specifies where to open the linked document."
                        }
                };

        }
});
