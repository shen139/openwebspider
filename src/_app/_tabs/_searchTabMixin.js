var DbClass = require("../../_db/_dbClass");


module.exports = function (tab5)
{
    var that = this;


    function button1_click()
    {
        that.loading(true);
        that.setInfoline("Searching...", 1000);

        that.gridSearch.Visible = false;
        owsSearchInfo.Visible = false;

        that.gridSearch.dataview.clear();

        var dbManager = new DbClass(that.CONF);
        dbManager.connect(function (err)
        {
            if (!err)
            {
                var start = new Date();
                dbManager.fulltextSearch(txtQuery.Text, function (results)
                {
                    owsSearchInfo.Caption = results.length + " results in " + ((new Date() - start) / 1000) + " seconds";

                    for (var i = 0; i < results.length; i++)
                    {
                        that.gridSearch.dataview.addItem({
                            "id": i,
                            "page": results[i]["page"],
                            "title": results[i]["title"],
                            "relevancy": results[i]["relevancy"]
                        });
                    }

                    that.gridSearch.grid.autosizeColumns();

                    dbManager.close();

                    that.gridSearch.Visible = true;
                    owsSearchInfo.Visible = true;

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

    var container = this.app.create("container", tab5);
    container.Top = 10;
    container.Left = 10;
    container.Position = "absolute";
    container.Width = 556;
    container.Height = 35;
    container.Resizable = false;


    var label = this.app.create("label", container);
    label.Top = 10;
    label.Left = 10;
    label.Position = "absolute";
    label.Caption = "Query";
    label.Width = 60;
    label.Height = 22;


    var txtQuery = this.app.create("textfield", container);
    txtQuery.Name = "txtSearchQuery";
    txtQuery.Top = 5;
    txtQuery.Left = 65;
    txtQuery.Position = "absolute";
    txtQuery.Text = "openwebspider download";
    txtQuery.Width = 360;
    txtQuery.Height = 22;
    txtQuery.on("keypress", function (self, args)
    {
        if (args["which"] === 13)
        {
            txtQuery.getText(function (self, ret, val)
            {
                ret && button1_click();
            });
        }
    });

    txtQuery.on("change", function (self, args)
    {
        that.updateConf("HISTORY_SEARCH_QUERY", txtQuery.Text, /* show save: */ false);
    });


    var button1 = this.app.create("button", container);
    button1.Top = 5;
    button1.Left = 445;
    button1.Position = "absolute";
    button1.Caption = "Search";
    button1.Width = 100;
    button1.Height = 22;
    button1.on("click", button1_click);

    this.gridSearch = this.app.create("datagrid", tab5, {
        "Width": 560,
        "Height": 235,
        "dataset": {
            "columns": [
                {
                    "id": "page",
                    "name": "Page",
                    "field": "page",
                    "width": 150
                },
                {
                    "id": "title",
                    "name": "Title",
                    "field": "title",
                    "width": 150
                },
                {
                    "id": "relevancy",
                    "name": "Relevancy",
                    "field": "relevancy",
                    "width": 150
                }],
            "data": []
        }
    });
    this.gridSearch.Top = 76;
    this.gridSearch.Left = 10;
    this.gridSearch.Position = "absolute";
    this.gridSearch.Visible = false;

    var owsSearchInfo = this.app.create("label", tab5);
    owsSearchInfo.Top = 60;
    owsSearchInfo.Left = 10;
    owsSearchInfo.Position = "absolute";
    owsSearchInfo.Caption = "";
    owsSearchInfo.Width = 400;
    owsSearchInfo.Height = 14;
    owsSearchInfo.Visible = false;
    owsSearchInfo.addClass("label-no-wrap");


    var owsSearchLink = this.app.create("hyperlink", tab5);
    owsSearchLink.Top = 60;
    owsSearchLink.Left = 500;
    owsSearchLink.Position = "absolute";
    owsSearchLink.Caption = "Search page";
    owsSearchLink.Width = 70;
    owsSearchLink.Height = 14;
    owsSearchLink.Link = "/search";
    owsSearchLink.addClass("label-no-wrap");

};
