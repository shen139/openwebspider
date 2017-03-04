module.exports = function (tab3)
{
    var that = this;


    // ******** DATABASE ****
    var container = this.app.create("container", tab3);
    container.Top = 5;
    container.Left = 10;
    container.Position = "absolute";
    container.Width = 321;
    container.Height = 285;
    container.Resizable = false;
    container.Border = "";

    var lblConnType = this.app.create("label", container);
    lblConnType.Top = 15;
    lblConnType.Left = 10;
    lblConnType.Position = "absolute";
    lblConnType.Caption = "Database Type";
    lblConnType.Width = 100;
    lblConnType.Height = 16;

    var comboConnType = this.app.create("combobox", container);
    comboConnType.Name = "comboConnType";
    comboConnType.Top = 15;
    comboConnType.Left = 145;
    comboConnType.Position = "absolute";
    comboConnType.Width = 102;
    comboConnType.Height = 22;
    comboConnType.Items = [{"key": "mysql", "value": "MySQL"}, {"key": "pg", "value": "PostgreSQL"}];
    // comboConnType.Selected = "mysql";

    comboConnType.on("change", function (myself, key)
    {
        if (key === "pg")
        {
            that.app.getWidgetByName("txtDbDb1").Disabled = true;

            if (parseInt(that.app.getWidgetByName("txtDbPort").Text) === 3306)
            {
                // restore PG default port
                that.app.getWidgetByName("txtDbPort").Text = "5432";
            }

            if (that.app.getWidgetByName("txtDbUser").Text === "root")
            {
                // restore PG default user
                that.app.getWidgetByName("txtDbUser").Text = "postgres";
            }
        }
        else
        {
            // default: mysql
            that.app.getWidgetByName("txtDbDb1").Disabled = false;

            if (parseInt(that.app.getWidgetByName("txtDbPort").Text) === 5432)
            {
                // restore mysql default port
                that.app.getWidgetByName("txtDbPort").Text = "3306";
            }

            if (that.app.getWidgetByName("txtDbUser").Text === "postgres")
            {
                // restore mysql default user
                that.app.getWidgetByName("txtDbUser").Text = "root";
            }
        }
    });


    var label6 = this.app.create("label", container);
    label6.Top = 55;
    label6.Left = 10;
    label6.Position = "absolute";
    label6.Caption = "Host";
    label6.Width = 60;
    label6.Height = 16;
    label6.Border = "";

    var label7 = this.app.create("label", container);
    label7.Top = 95;
    label7.Left = 10;
    label7.Position = "absolute";
    label7.Caption = "Port";
    label7.Width = 60;
    label7.Height = 16;
    label7.Border = "";

    var label8 = this.app.create("label", container);
    label8.Top = 135;
    label8.Left = 10;
    label8.Position = "absolute";
    label8.Caption = "Username";
    label8.Width = 60;
    label8.Height = 16;
    label8.Border = "";

    var label9 = this.app.create("label", container);
    label9.Top = 175;
    label9.Left = 10;
    label9.Position = "absolute";
    label9.Caption = "Password";
    label9.Width = 60;
    label9.Height = 16;
    label9.Border = "";

    var label10 = this.app.create("label", container);
    label10.Top = 215;
    label10.Left = 10;
    label10.Position = "absolute";
    label10.Caption = "Hosts DB";
    label10.Width = 60;
    label10.Height = 16;

    var label_idb = this.app.create("label", container);
    label_idb.Top = 255;
    label_idb.Left = 10;
    label_idb.Position = "absolute";
    label_idb.Caption = "Index DB";
    label_idb.Width = 60;
    label_idb.Height = 16;

    var textfield6 = this.app.create("textfield", container);
    textfield6.Name = "txtDbHost";
    textfield6.Top = 50;
    textfield6.Left = 145;
    textfield6.Position = "absolute";
    textfield6.Text = "127.0.0.1";
    textfield6.Width = 100;
    textfield6.Height = 16;
    textfield6.Border = "";

    var textfield7 = this.app.create("textfield", container);
    textfield7.Name = "txtDbPort";
    textfield7.Top = 90;
    textfield7.Left = 145;
    textfield7.Position = "absolute";
    textfield7.Text = "3306";
    textfield7.Width = 100;
    textfield7.Height = 16;
    textfield7.Border = "";

    var textfield8 = this.app.create("textfield", container);
    textfield8.Name = "txtDbUser";
    textfield8.Top = 130;
    textfield8.Left = 145;
    textfield8.Position = "absolute";
    textfield8.Text = "root";
    textfield8.Width = 100;
    textfield8.Height = 16;
    textfield8.Border = "";

    var textfield9 = this.app.create("textfield", container);
    textfield9.Name = "txtDbPass";
    textfield9.Top = 170;
    textfield9.Left = 145;
    textfield9.Position = "absolute";
    textfield9.Text = "root";
    textfield9.Width = 100;
    textfield9.Height = 16;
    textfield9.Border = "";

    var textfield10 = this.app.create("textfield", container);
    textfield10.Name = "txtDbDb1";
    textfield10.Top = 210;
    textfield10.Left = 145;
    textfield10.Position = "absolute";
    textfield10.Text = "ows_hosts";
    textfield10.Width = 100;
    textfield10.Height = 16;
    textfield10.Border = "";

    var textfield_db2 = this.app.create("textfield", container);
    textfield_db2.Name = "txtDbDb2";
    textfield_db2.Top = 250;
    textfield_db2.Left = 145;
    textfield_db2.Position = "absolute";
    textfield_db2.Text = "ows_index";
    textfield_db2.Width = 100;
    textfield_db2.Height = 16;
    textfield_db2.Border = "";


    var button6 = this.app.create("button", tab3);
    button6.Top = 40;
    button6.Left = 400;
    button6.Position = "absolute";
    button6.Caption = "Verify";
    button6.Width = 100;
    button6.Height = 22;

    button6.on("click", function ()
    {
        button6.Disabled = true;
        that.setInfoline("Connecting...");

        that.verifyDBConnection(comboConnType.Selected, textfield6.Text, textfield7.Text, textfield8.Text, textfield9.Text, textfield10.Text, textfield_db2.Text, function (err)
        {
            that.setInfoline(err ? "Database connection ERROR!" : "Connection OK!", 2000);
            button6.Disabled = false;
        });
    });

    var button7 = this.app.create("button", tab3);
    button7.Top = 10;
    button7.Left = 400;
    button7.Position = "absolute";
    button7.Caption = "Save";
    button7.Width = 100;
    button7.Height = 22;
    button7.on("click", function ()
    {
        that.saveDBInfo(comboConnType.Selected, textfield6.Text, textfield7.Text, textfield8.Text, textfield9.Text, textfield10.Text, textfield_db2.Text);
    });

    var btnCreateDb = this.app.create("button", tab3);
    btnCreateDb.Top = 70;
    btnCreateDb.Left = 400;
    btnCreateDb.Position = "absolute";
    btnCreateDb.Caption = "Create DB";
    btnCreateDb.Width = 100;
    btnCreateDb.Height = 22;

    btnCreateDb.on("click", function ()
    {
        btnCreateDb.Disabled = true;
        that.setInfoline("Creating DBs...");

        that.createDB(comboConnType.Selected, textfield6.Text, textfield7.Text, textfield8.Text, textfield9.Text, textfield10.Text, textfield_db2.Text, function (err)
        {
            that.setInfoline(err ? "Database creation failed!" : "Database created/truncated/repaired!", 2000);
            btnCreateDb.Disabled = false;
        });
    });

};
