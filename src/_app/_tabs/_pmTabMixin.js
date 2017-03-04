var url = require("url");

var DbClass = require("../../_db/_dbClass");


module.exports = function (tab3)
{
    var that = this;


    function button1_click()
    {
        that.loading(true);
        that.setInfoline("Loading Pages Map...", 1000);

        that.gridPagesMapLinks.Visible = false;
        that.gridPagesMapLinked.Visible = false;

        that.gridPagesMapLinks.dataview.clear();
        that.gridPagesMapLinked.dataview.clear();

        var dbManager = new DbClass(that.CONF);
        dbManager.connect(function (err)
        {
            if (!err)
            {
                var parsedUrl = url.parse(textfield1.Text);
                if (parsedUrl["path"] === "")
                {
                    parsedUrl["path"] = "/";
                }

                dbManager.getPagesMap(parsedUrl["hostname"], parsedUrl["path"], function (err, res1, res2)
                {
                    if (!err)
                    {
                        var i;
                        for (i = 0; i < res1.length; i++)
                        {
                            that.gridPagesMapLinks.dataview.addItem({
                                "id": i,
                                "text": res1[i]["textlink"],
                                "links": res1[i]["url"]
                            });
                        }

                        for (i = 0; i < res2.length; i++)
                        {
                            that.gridPagesMapLinked.dataview.addItem({
                                "id": i,
                                "text": res2[i]["textlink"],
                                "linked": res2[i]["url"]
                            });
                        }
                        that.gridPagesMapLinks.grid.autosizeColumns();
                        that.gridPagesMapLinked.grid.autosizeColumns();

                        dbManager.close();

                        that.gridPagesMapLinks.Visible = true;
                        that.gridPagesMapLinked.Visible = true;
                    }

                    that.loading(false);

                });
            }
            else
            {
                // db connection error
                that.setInfoline("Database connection ERROR!", 2000);
                that.loading(false);
            }
        });

    }


    var container = this.app.create("container", tab3);
    container.Top = 10;
    container.Left = 10;
    container.Position = "absolute";
    container.Width = 556;
    container.Height = 35;
    container.Resizable = false;


    var label3 = this.app.create("label", container);
    label3.Top = 10;
    label3.Left = 10;
    label3.Position = "absolute";
    label3.Caption = "URL";
    label3.Width = 60;
    label3.Height = 22;


    var textfield1 = this.app.create("textfield", container);
    textfield1.Name = "txtPagesMapURL";
    textfield1.Top = 5;
    textfield1.Left = 65;
    textfield1.Position = "absolute";
    textfield1.Text = "http://www.openwebspider.org/";
    textfield1.Width = 360;
    textfield1.Height = 22;
    textfield1.on("keypress", function (self, args)
    {
        if (args["which"] === 13)
        {
            textfield1.getText(function (self, ret, val)
            {
                ret && button1_click();
            });
        }
    });

    textfield1.on("change", function (self, args)
    {
        that.updateConf("HISTORY_PAGESMAP_URL", textfield1.Text, /* show save: */ false);
    });


    var button1 = this.app.create("button", container);
    button1.Top = 5;
    button1.Left = 445;
    button1.Position = "absolute";
    button1.Caption = "Get info!";
    button1.Width = 100;
    button1.Height = 22;
    button1.on("click", button1_click);

    this.gridPagesMapLinks = this.app.create("datagrid", tab3, {
        "Width": 560,
        "Height": 120,
        "dataset": {
            "columns": [
                {
                    "id": "text",
                    "name": "Anchor Text",
                    "field": "text",
                    "width": 100
                },
                {
                    "id": "links",
                    "name": "Links To",
                    "field": "links",
                    "width": 450
                }],
            "data": []
        }
    });
    this.gridPagesMapLinks.Top = 60;
    this.gridPagesMapLinks.Left = 10;
    this.gridPagesMapLinks.Position = "absolute";
    this.gridPagesMapLinks.on("cellClick", function (ctl, rowObj)
    {
        textfield1.Text = "http://" + rowObj["row"]["links"];
        button1_click();
    });


    this.gridPagesMapLinked = this.app.create("datagrid", tab3, {
        "Width": 560,
        "Height": 120,
        "dataset": {
            "columns": [
                {
                    "id": "text",
                    "name": "Anchor Text",
                    "field": "text",
                    "width": 100
                },
                {
                    "id": "linked",
                    "name": "Is Linked By",
                    "field": "linked",
                    "width": 450
                }],
            "data": []
        }
    });
    this.gridPagesMapLinked.Top = 185;
    this.gridPagesMapLinked.Left = 10;
    this.gridPagesMapLinked.Position = "absolute";
    this.gridPagesMapLinked.on("cellClick", function (ctl, rowObj)
    {
        textfield1.Text = "http://" + rowObj["row"]["linked"];
        button1_click();
    });

    this.gridPagesMapLinks.Visible = false;
    this.gridPagesMapLinked.Visible = false;


};
