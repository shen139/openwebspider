module.exports = {
    "getHostID":        "SELECT id FROM ??.hostlist WHERE hostname = ? AND port = ?",

    "addHost":          "INSERT IGNORE INTO ??.hostlist (hostname, port, status) VALUES(?, ?, 0)",

    "getHostByStatus":  "SELECT id, hostname, port FROM ??.hostlist WHERE status=?",

    "updateHostStatus": "UPDATE ??.hostlist SET status = ? WHERE id = ?",

    "indexPage":        "INSERT INTO ??.pages SET" +
                        "  host_id = ?" +
                        ", hostname = ?" +
                        ", page = ?" +
                        ", title = ?" +
                        ", anchor_text = ?" +
                        ", date=curdate(),time=curtime()" +
                        ", level = ?" +
                        ",`text` = ?",

    "cleanHost":        "DELETE FROM ??.pages where host_id = ?; " +
                        "DELETE FROM ??.pages_map where host_id = ?; ",

    "savePageMap":      "INSERT IGNORE INTO ??.pages_map (host_id, page, linkedhost_id, linkedpage, textlink) " +
                        "VALUES(?,?,?,?,?)",

    "deleteDupPages":   " DELETE FROM ??.pages " +
                        " WHERE host_id = ? AND id NOT IN " +
                        " ( " +
                        "   SELECT id FROM ??.view_unique_pages WHERE host_id = ? " +
                        " )"

};
