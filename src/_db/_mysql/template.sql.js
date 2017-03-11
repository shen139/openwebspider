module.exports = {
    "getHostID":        "SELECT id FROM ??.hostlist WHERE hostname = ? AND port = ?",

    "addHost":          "INSERT IGNORE INTO ??.hostlist (hostname, port, status) VALUES(?, ?, 0)",

    "getHostByStatus":  "SELECT id, hostname, port FROM ??.hostlist WHERE status=?",

    "updateHostStatus": "UPDATE ??.hostlist SET status = ? WHERE id = ?",

    "deletePage":       "DELETE FROM ??.pages where host_id = ? AND page = ?;",

    "indexPage":        "INSERT INTO ??.pages SET" +
                        "  host_id = ?" +
                        ", hostname = ?" +
                        ", page = ?" +
                        ", title = ?" +
                        ", anchor_text = ?" +
                        ", date=curdate(),time=curtime()" +
                        ", level = ?" +
                        ", contentType = ?" +
                        ",`text` = ?",

    "cleanHost":        "DELETE FROM ??.pages where host_id = ?; " +
                        "DELETE FROM ??.pages_map where host_id = ?; ",

    "savePageMap":      "INSERT IGNORE INTO ??.pages_map (host_id, page, linkedhost_id, linkedpage, textlink) " +
                        "VALUES(?,?,?,?,?)",

    "deleteDupPages":   "DELETE FROM ??.pages " +
                        "WHERE host_id = ? AND id NOT IN " +
                        "( " +
                        "   SELECT id FROM ??.view_unique_pages WHERE host_id = ? " +
                        " )",

    "setOutdatedHost":  "UPDATE ??.pages " +
                        "SET `outdated` = ? " +
                        "WHERE host_id = ?",

    "setOutdatedPage":  "UPDATE ??.pages " +
                        "SET `outdated` = ? " +
                        "WHERE host_id = ? and `page` = ?",


    "removeOutdated":   "DELETE FROM ??.pages " +
                        "WHERE host_id = ? AND `outdated` = 1",


    "getPageInfo":      "SELECT `cache`, `contentType` AS lc_contenttype, `level`, `ETag` AS lc_etag, `lastModified` AS lc_lastmodified " +
                        "FROM ??.pages " +
                        "WHERE host_id = ? AND page = ?",


    /* DB UPDATES */
    "dbUpdCheck0001":   " SELECT * " +
                        " FROM information_schema.COLUMNS" +
                        "    WHERE " +
                        "    TABLE_SCHEMA = ? " +
                        "    AND TABLE_NAME = 'pages' " +
                        "    AND COLUMN_NAME = 'ETag'",

    "dbUpdPatch0001":   " ALTER TABLE ??.`pages` ADD COLUMN `ETag` VARCHAR(255) NULL AFTER `time`," +
                        " ADD COLUMN `lastModified` VARCHAR(255) NULL AFTER `ETag`," +
                        " ADD COLUMN `outdated` BOOL DEFAULT FALSE NOT NULL AFTER `lastModified`," +
                        " ADD COLUMN `contentType` VARCHAR(255) NOT NULL AFTER `html_md5`"

};
