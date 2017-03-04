module.exports = function (tab1)
{
    var that = this;


    // **** WORKER TAB ****
    var container3 = this.app.create("container", tab1);
    container3.Top = 10;
    container3.Left = 10;
    container3.Position = "absolute";
    container3.Width = 556;
    container3.Height = 35;
    container3.Resizable = false;
    container3.Border = "";


    var label3 = this.app.create("label", container3);
    label3.Top = 10;
    label3.Left = 10;
    label3.Position = "absolute";
    label3.Caption = "URL";
    label3.Width = 60;
    label3.Height = 16;
    label3.Border = "";

    var textfield1 = this.app.create("textfield", container3);
    textfield1.Name = "txtURL";
    textfield1.Top = 5;
    textfield1.Left = 65;
    textfield1.Position = "absolute";
    textfield1.Text = "http://";
    textfield1.Width = 360;
    textfield1.Height = 22;
    textfield1.on("keypress", function (self, args)
    {
        if (args["which"] === 13)
        {
            textfield1.getText(function (self, ret, val)
            {
                ret && that.startNewProcess(val);
            });
        }
    });

    textfield1.on("change", function (self, args)
    {
        that.updateConf("HISTORY_WORKER_URL", textfield1.Text, /* show save: */ false);
    });

    var button1 = this.app.create("button", container3);
    button1.Top = 5;
    button1.Left = 445;
    button1.Position = "absolute";
    button1.Caption = "Go!";
    button1.Width = 100;
    button1.Height = 22;
    button1.on("click", function ()
    {
        that.startNewProcess(textfield1.Text);
    });


    var container4 = this.app.create("container", tab1);
    container4.Top = 60;
    container4.Left = 10;
    container4.Position = "absolute";
    container4.Width = 556;
    container4.Height = 230;
    container4.Resizable = false;


    var checkbox1 = this.app.create("checkbox", container4);
    checkbox1.Name = "ckSingleHost";
    checkbox1.Top = 10;
    checkbox1.Left = 10;
    checkbox1.Position = "absolute";
    checkbox1.Caption = "Single Host Mode";
    checkbox1.Width = 100;
    checkbox1.Height = 16;
    checkbox1.Checked = true;
    checkbox1.on("click", function ()
    {
        that.updateConf("SINGLE_HOST_MODE", checkbox1.Checked);
    });


    var checkbox2 = this.app.create("checkbox", container4);
    checkbox2.Name = "ckMaxPages";
    checkbox2.Top = 50;
    checkbox2.Left = 10;
    checkbox2.Position = "absolute";
    checkbox2.Caption = "Max Pages";
    checkbox2.Width = 100;
    checkbox2.Height = 16;
    checkbox2.Border = "";
    checkbox2.Checked = true;
    checkbox2.on("click", function ()
    {
        if (checkbox2.Checked === false)
        {
            that.updateConf("MAX_PAGES", null);
        }
        else
        {
            that.updateConf("MAX_PAGES", parseInt(textfield2.Text));
        }
    });

    // max pages
    var textfield2 = this.app.create("textfield", container4);
    textfield2.Name = "txtMaxPages";
    textfield2.Top = 50;
    textfield2.Left = 130;
    textfield2.Position = "absolute";
    textfield2.Text = "100";
    textfield2.Width = 100;
    textfield2.Height = 16;
    textfield2.Border = "";
    textfield2.on("change", function ()
    {
        that.updateConf("MAX_PAGES", parseInt(textfield2.Text));
    });


    var ckboxMaxSecs = this.app.create("checkbox", container4);
    ckboxMaxSecs.Name = "ckboxMaxSecs";
    ckboxMaxSecs.Top = 90;
    ckboxMaxSecs.Left = 10;
    ckboxMaxSecs.Position = "absolute";
    ckboxMaxSecs.Caption = "Max Seconds";
    ckboxMaxSecs.Width = 100;
    ckboxMaxSecs.Height = 16;
    ckboxMaxSecs.Border = "";
    ckboxMaxSecs.Checked = true;
    ckboxMaxSecs.on("click", function ()
    {
        if (ckboxMaxSecs.Checked === false)
        {
            that.updateConf("MAX_SECONDS", null);
        }
        else
        {
            that.updateConf("MAX_SECONDS", parseInt(txtMaxSecs.Text));
        }
    });

    // max seconds
    var txtMaxSecs = this.app.create("textfield", container4);
    txtMaxSecs.Name = "txtMaxSecs";
    txtMaxSecs.Top = 90;
    txtMaxSecs.Left = 130;
    txtMaxSecs.Position = "absolute";
    txtMaxSecs.Text = "120";
    txtMaxSecs.Width = 100;
    txtMaxSecs.Height = 16;
    txtMaxSecs.Border = "";
    txtMaxSecs.on("change", function ()
    {
        that.updateConf("MAX_SECONDS", parseInt(txtMaxSecs.Text));
    });


    var checkbox3 = this.app.create("checkbox", container4);
    checkbox3.Name = "ckCrawlDelay";
    checkbox3.Top = 130;
    checkbox3.Left = 10;
    checkbox3.Position = "absolute";
    checkbox3.Caption = "Crawl Delay (ms)";
    checkbox3.Width = 100;
    checkbox3.Height = 16;
    checkbox3.Border = "";
    checkbox3.Checked = true;
    checkbox3.on("click", function ()
    {
        if (checkbox3.Checked === false)
        {
            that.updateConf("CRAWL_DELAY", null);
        }
        else
        {
            that.updateConf("CRAWL_DELAY", parseInt(textfield3.Text));
        }
    });

    // crawl delay
    var textfield3 = this.app.create("textfield", container4);
    textfield3.Name = "txtCrawlDelay";
    textfield3.Top = 130;
    textfield3.Left = 130;
    textfield3.Position = "absolute";
    textfield3.Text = "1000";   // crawl delay in ms
    textfield3.Width = 100;
    textfield3.Height = 16;
    textfield3.Border = "";
    textfield3.on("change", function ()
    {
        that.updateConf("CRAWL_DELAY", parseInt(textfield3.Text));
    });


    var checkbox4 = this.app.create("checkbox", container4);
    checkbox4.Name = "ckAddHosts";
    checkbox4.Top = 10;
    checkbox4.Left = 310;
    checkbox4.Position = "absolute";
    checkbox4.Caption = "Add hosts";    // add external hosts??
    checkbox4.Width = 100;
    checkbox4.Height = 16;
    checkbox4.Checked = false;
    checkbox4.on("click", function ()
    {
        that.updateConf("ADD_EXTERNAL_HOSTS", checkbox4.Checked);
    });


    var checkbox5 = this.app.create("checkbox", container4);
    checkbox5.Name = "ckMaxDepth";
    checkbox5.Top = 50;
    checkbox5.Left = 310;
    checkbox5.Position = "absolute";
    checkbox5.Caption = "Depth";        // max depth
    checkbox5.Width = 100;
    checkbox5.Height = 16;
    checkbox5.Checked = true;
    checkbox5.on("click", function ()
    {
        if (checkbox5.Checked === false)
        {
            that.updateConf("MAX_DEPTH", null);
        }
        else
        {
            that.updateConf("MAX_DEPTH", parseInt(txtMaxDepth.Text));
        }
    });

    // max depth
    var txtMaxDepth = this.app.create("textfield", container4);
    txtMaxDepth.Name = "txtMaxDepth";
    txtMaxDepth.Top = 50;
    txtMaxDepth.Left = 430;
    txtMaxDepth.Position = "absolute";
    txtMaxDepth.Text = "3";
    txtMaxDepth.Width = 100;
    txtMaxDepth.Height = 16;
    txtMaxDepth.on("change", function ()
    {
        that.updateConf("MAX_DEPTH", parseInt(txtMaxDepth.Text));
    });


    var label4 = this.app.create("label", container4);
    label4.Top = 90;
    label4.Left = 310;
    label4.Position = "absolute";
    label4.Caption = "Concurrency";     // concurrent parallel workers
    label4.Width = 60;
    label4.Height = 16;
    label4.Border = "";

    // concurrent parallel workers
    var textfield5 = this.app.create("textfield", container4);
    textfield5.Name = "txtConcurrency";
    textfield5.Top = 90;
    textfield5.Left = 430;
    textfield5.Position = "absolute";
    textfield5.Text = "10";
    textfield5.Width = 100;
    textfield5.Height = 16;
    textfield5.Border = "";
    textfield5.on("change", function ()
    {
        that.updateConf("CONCURRENCY", parseInt(textfield5.Text));
    });


    // max page size
    var label5 = this.app.create("label", container4);
    label5.Top = 130;
    label5.Left = 310;
    label5.Position = "absolute";
    label5.Caption = "Max Page size (Kb)";
    label5.Width = 115;
    label5.Height = 16;
    label5.Border = "";

    var textfield4 = this.app.create("textfield", container4);
    textfield4.Name = "txtMaxPkgSize";
    textfield4.Top = 130;
    textfield4.Left = 430;
    textfield4.Position = "absolute";
    textfield4.Text = "100";
    textfield4.Width = 100;
    textfield4.Height = 16;
    textfield4.Border = "";
    textfield4.on("change", function ()
    {
        var mps = parseInt(textfield4.Text);
        if (!isNaN(mps))
        {
            that.updateConf("MAX_PAGE_SIZE", parseInt(mps));
        }
    });


    var ckUpdateMode = this.app.create("checkbox", container4);
    ckUpdateMode.Name = "ckUpdateMode";
    ckUpdateMode.Top = 170;
    ckUpdateMode.Left = 310;
    ckUpdateMode.Position = "absolute";
    ckUpdateMode.Caption = "Update Mode";
    ckUpdateMode.Width = 100;
    ckUpdateMode.Height = 16;
    ckUpdateMode.on("click", function ()
    {
        if (ckUpdateMode.Checked === true)
        {
            that.updateConf("UPDATE_MODE", true);
            // forces cache mode (if off)
            if (checkbox6.Checked === false)
            {
                checkbox6.Checked = true;
                that.updateConf("CACHE_MODE", 1);
            }
        }
        else
        {
            that.updateConf("UPDATE_MODE", false);
        }
    });

    var checkbox6 = this.app.create("checkbox", container4);
    checkbox6.Name = "ckCache";
    checkbox6.Top = 210;
    checkbox6.Left = 310;
    checkbox6.Position = "absolute";
    checkbox6.Caption = "Cache Page";
    checkbox6.Width = 100;
    checkbox6.Height = 16;
    checkbox6.on("click", function ()
    {
        if (checkbox6.Checked === false)
        {
            that.updateConf("CACHE_MODE", 0);   // no cache
        }
        else
        {
            if (checkbox7.Checked === false)
            {
                that.updateConf("CACHE_MODE", 1);   // simple cache
            }
            else
            {
                that.updateConf("CACHE_MODE", 2);   // compressed cache
            }
        }
    });

    var checkbox7 = this.app.create("checkbox", container4);
    checkbox7.Name = "ckCacheFull";
    checkbox7.Top = 210;
    checkbox7.Left = 430;
    checkbox7.Position = "absolute";
    checkbox7.Caption = "Compressed";
    checkbox7.Width = 100;
    checkbox7.Height = 16;
    checkbox7.Disabled = true;
    checkbox7.on("click", function ()
    {
        if (checkbox7.Checked === false)
        {
            that.updateConf("CACHE_MODE", 1);   // simple cache
        }
        else
        {
            that.updateConf("CACHE_MODE", 2);   // compressed cache
        }
    });


    // Pages Map
    var checkbox9 = this.app.create("checkbox", container4);
    checkbox9.Name = "ckPagesMap";
    checkbox9.Top = 170;
    checkbox9.Left = 10;
    checkbox9.Position = "absolute";
    checkbox9.Caption = "Pages map";
    checkbox9.Width = 100;
    checkbox9.Height = 16;
    checkbox9.Border = "";
    checkbox9.on("click", function ()
    {
        checkbox10.Disabled = !checkbox9.Checked;
        if (checkbox9.Checked === false)
        {
            that.updateConf("PAGES_MAP", 0);   // no pages map
        }
        else
        {
            if (checkbox10.Checked === false)
            {
                that.updateConf("PAGES_MAP", 1);   // simple pages map
            }
            else
            {
                that.updateConf("PAGES_MAP", 2);   // full pages map
            }
        }
    });


    var checkbox10 = this.app.create("checkbox", container4);
    checkbox10.Name = "ckPagesMapFull";
    checkbox10.Top = 170;
    checkbox10.Left = 130;
    checkbox10.Position = "absolute";
    checkbox10.Caption = "Full";
    checkbox10.Width = 100;
    checkbox10.Height = 16;
    checkbox10.Disabled = true;
    checkbox10.on("click", function ()
    {
        if (checkbox10.Checked === false)
        {
            that.updateConf("PAGES_MAP", 1);   // simple pages map
        }
        else
        {
            that.updateConf("PAGES_MAP", 2);   // full pages map
        }
    });


    var checkboxDDP = this.app.create("checkbox", container4);
    checkboxDDP.Name = "ckDupPages";
    checkboxDDP.Top = 210;
    checkboxDDP.Left = 10;
    checkboxDDP.Position = "absolute";
    checkboxDDP.Caption = "Delete Duplicate Pages";
    checkboxDDP.Width = 100;
    checkboxDDP.Height = 16;
    checkboxDDP.Checked = true;
    checkboxDDP.on("click", function ()
    {
        that.updateConf("DELETE_DUP_PAGES", checkboxDDP.Checked);
    });


};
