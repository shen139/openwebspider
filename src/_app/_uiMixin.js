var mirrorJS = require("../mirrorjs/mirror");

var _mainTabMixin = require("./_tabs/_mainTabMixin");
var _workersTabMixin = require("./_tabs/_workersTabMixin");
var _dbTabMixin = require("./_tabs/_dbTabMixin");
var _pagesMapTabMixin = require("./_tabs/_pmTabMixin");
var _searchTabMixin = require("./_tabs/_searchTabMixin");
var _aboutTabMixin = require("./_tabs/_aboutTabMixin");


module.exports = function ()
{
    var that = this;

    this.workarea = this.app.create("dialog");
    that.workarea.Visible = false;      // the main window will start invisible to prevent flickering
    that.workarea.Resizable = false;
    that.workarea.Title = "OpenWebSpider(js) v" + that.CONF.VERSION;
    that.workarea.Width = 600;
    that.workarea.Height = 440;
    that.workarea.DialogPosition = {at: "center top"};
    that.workarea.on("beforeclose", function ()
    {
        that.gridCleanup();
        that.workarea.Visible = false;
        that.app.exit();
    });


    // **** INFOLINE ****
    var container1 = this.app.create("container", that.workarea);
    container1.Top = 365;
    container1.Left = 5;
    container1.Position = "absolute";
    container1.Width = 580;
    container1.Height = 16;
    container1.Resizable = false;

    // TODO: new widget tableContainer
    var owsLink = this.app.create("hyperlink", container1);
    owsLink.Top = 3;
    owsLink.Left = 5;
    owsLink.Position = "absolute";
    owsLink.Caption = "OpenWebSpider v" + that.CONF.VERSION;
    owsLink.Width = 200;
    owsLink.Height = 22;
    owsLink.Link = "http://www.openwebspider.org/";

    var labelpb = this.app.create("label", container1);
    labelpb.Top = 1;
    labelpb.Left = 140;
    labelpb.Position = "absolute";
    labelpb.Caption = "Powered by";
    labelpb.Width = 200;
    labelpb.Height = 22;

    var mirrorjsLink = this.app.create("hyperlink", container1);
    mirrorjsLink.Top = 3;
    mirrorjsLink.Left = 210;
    mirrorjsLink.Position = "absolute";
    mirrorjsLink.Caption = "mirrorjs v" + mirrorJS.VERSION;
    mirrorjsLink.Width = 200;
    mirrorjsLink.Height = 22;
    mirrorjsLink.Link = "http://www.mirrorjs.com/";

    // loading icon
    this.loadingIconCnt = this.app.create("container", container1);
    this.loadingIconCnt.Top = -5;
    this.loadingIconCnt.Position = "absolute";
    this.loadingIconCnt.Width = 16;
    this.loadingIconCnt.Height = 16;
    this.loadingIconCnt.Left = container1.Width - this.loadingIconCnt.Width;
    this.loadingIconCnt.Resizable = false;

    var cntInfoline = this.app.create("container", container1);
    cntInfoline.Top = -5;
    cntInfoline.Left = container1.Width - this.loadingIconCnt.Width - 250 - /* paddings, margins, ... */ 6;
    cntInfoline.Position = "absolute";
    cntInfoline.Width = 250;
    cntInfoline.Height = 16;
    cntInfoline.Resizable = false;

    this.lblInfoline = this.app.create("label", cntInfoline);
    this.lblInfoline.Name = "lblInfoline";
    this.lblInfoline.Top = 1;
    this.lblInfoline.Left = 0;
    this.lblInfoline.Position = "absolute";
    this.lblInfoline.Caption = "";
    this.lblInfoline.Width = 250;
    this.lblInfoline.Height = 14;
    this.lblInfoline.addClass("label-no-wrap");
    // **** /INFOLINE ****


    var tabber1 = this.app.create("tabber", that.workarea);
    tabber1.Name = "mainTabber";
    tabber1.Top = 5;
    tabber1.Left = 5;
    tabber1.Position = "absolute";
    tabber1.Width = 580;
    tabber1.Height = 350;
    tabber1.Border = "";

    var tab1 = this.app.create("tab", tabber1);
    tab1.Top = 10;
    tab1.Left = 10;
    tab1.Position = "absolute";
    tab1.Width = 556;
    tab1.Caption = "Worker";
    tab1.Border = "";

    var tab2 = this.app.create("tab", tabber1);
    tab2.Top = 10;
    tab2.Left = 10;
    tab2.Position = "absolute";
    tab2.Width = 556;
    tab2.Caption = "Workers";
    tab2.Border = "";

    var tab3 = this.app.create("tab", tabber1);
    tab3.Top = 10;
    tab3.Left = 10;
    tab3.Position = "absolute";
    tab3.Width = 556;
    tab3.Caption = "Database";
    tab3.Border = "";

    var tab4 = this.app.create("tab", tabber1);
    tab4.Top = 10;
    tab4.Left = 10;
    tab4.Position = "absolute";
    tab4.Width = 556;
    tab4.Caption = "Pages Map";
    tab4.Border = "";

    var tab5 = this.app.create("tab", tabber1);
    tab5.Top = 10;
    tab5.Left = 10;
    tab5.Position = "absolute";
    tab5.Width = 556;
    tab5.Caption = "Search";
    tab5.Border = "";

    var tab6 = this.app.create("tab", tabber1);
    tab6.Top = 10;
    tab6.Left = 10;
    tab6.Position = "absolute";
    tab6.Width = 556;
    tab6.Caption = "About";
    tab6.Border = "";

    // tabs
    _mainTabMixin.call(this, tab1);
    _workersTabMixin.call(this, tab2);
    _dbTabMixin.call(this, tab3);
    _pagesMapTabMixin.call(this, tab4);
    _searchTabMixin.call(this, tab5);
    _aboutTabMixin.call(this, tab6);

};
