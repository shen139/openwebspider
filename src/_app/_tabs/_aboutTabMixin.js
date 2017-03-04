var http = require("http");


module.exports = function (tab)
{
    var that = this;

    var container = that.app.create("container", tab);
    container.Top = 10;
    container.Left = 10;
    container.Position = "absolute";
    container.Width = 556;
    container.Height = 100;
    container.Resizable = false;


    var label1 = that.app.create("label", container);
    label1.Top = 10;
    label1.Left = 10;
    label1.Position = "absolute";
    label1.Caption = "OpenWebSpider(js) v" + that.CONF.VERSION;
    label1.Width = 350;
    label1.Height = 14;
    label1.Border = "";

    var label2 = that.app.create("label", container);
    label2.Top = 30;
    label2.Left = 10;
    label2.Position = "absolute";
    label2.Caption = "info@openwebspider.org";
    label2.Width = 300;
    label2.Height = 14;
    label2.Border = "";

    var owsLink = this.app.create("hyperlink", container);
    owsLink.Top = 50;
    owsLink.Left = 400;
    owsLink.Position = "absolute";
    owsLink.Caption = "Update available!!!";
    owsLink.Width = 200;
    owsLink.Height = 22;
    owsLink.Link = "http://www.openwebspider.org/download/";
    owsLink.Visible = false;


    var button1 = this.app.create("button", container);
    button1.Top = 10;
    button1.Left = 400;
    button1.Position = "absolute";
    button1.Caption = "Check updates...";
    button1.Width = 150;
    button1.Height = 22;
    button1.on("click", function()
    {
        that.loading(true);
        button1.Disabled = true;
        button1.Caption = "Checking...";
        that.setInfoline("Checking for updates...");

        var req = http.request("http://www.openwebspider.org/app/openwebspider.ver?noCache=" + Math.round(Math.random() * 10000 + 10000), function(res)
        {
            res.on('data', function (data)
            {
                if(res.statusCode === 200)
                {
                    var ver = parseInt(data);
                    if(!isNaN(ver))
                    {
                        if(ver > that.CONF.VERSION_NUMBER)
                        {
                            // new version
                            button1.Visible = false;
                            owsLink.Visible = true;
                            that.setInfoline("New version available!", 2000);
                        }
                        else
                        {
                            that.setInfoline("No update available.", 2000);
                            button1.Caption = "No update available.";
                            setTimeout(function ()
                            {
                                button1.Caption = "Check updates...";
                                button1.Disabled = false;
                            }, 5000);
                        }
                    }
                }
                else
                {
                    req.abort();
                }

                that.loading(false);
            });
        });
        req.end();
    });


    // license
    var lblLicense = that.app.create("label", container);
    lblLicense.Top = 55;
    lblLicense.Left = 10;
    lblLicense.Position = "absolute";
    lblLicense.Caption = "License:";
    lblLicense.Width = 100;
    lblLicense.Height = 14;

    var hlLicense = this.app.create("hyperlink", container);
    hlLicense.Top = 55;
    hlLicense.Left = 100;
    hlLicense.Position = "absolute";
    hlLicense.Caption = "The MIT License";
    hlLicense.Width = 200;
    hlLicense.Height = 22;
    hlLicense.Link = "http://www.openwebspider.org/license/";


    // powered by
    var lblPowered = that.app.create("label", container);
    lblPowered.Top = 75;
    lblPowered.Left = 10;
    lblPowered.Position = "absolute";
    lblPowered.Caption = "Powered by mirrorjs, nodejs, mongodb and mysql";
    lblPowered.Width = 300;
    lblPowered.Height = 14;
    lblPowered.Color = "#666";

};
