module.exports = {
    "getHostID":        "SELECT id FROM hostlist WHERE hostname = $1 AND port = $2",

    "addHost":          "INSERT INTO hostlist (hostname, port, status) VALUES($1, $2, 0)",

    "getHostByStatus":  "SELECT id, hostname, port FROM hostlist WHERE status=$1",

    "updateHostStatus": "UPDATE hostlist SET status = $1 WHERE id = $2",

    "deletePage":       "DELETE FROM pages where host_id = $1 AND page = $2;",

    "indexPage":        "INSERT INTO pages ",

    "cleanHost_01":     "DELETE FROM pages where host_id = $1",

    "cleanHost_02":     "DELETE FROM pages_map where host_id = $1",

    "savePageMap":      "INSERT INTO pages_map (host_id, page, linkedhost_id, linkedpage, textlink) " +
                        "VALUES($1,$2,$3,$4,$5)",

    "deleteDupPages":   "TODO DELETE FROM ??.pages " +
                        "WHERE host_id = ? AND id NOT IN " +
                        "( " +
                        "   SELECT id FROM ??.view_unique_pages WHERE host_id = ? " +
                        ")",

    "setOutdatedHost":  "UPDATE pages " +
                        "SET outdated = $1 " +
                        "WHERE host_id = $2",

    "setOutdatedPage":  "UPDATE pages " +
                        "SET outdated = $1 " +
                        "WHERE host_id = $2 and page = $3",


    "removeOutdated":   "DELETE FROM pages " +
                        "WHERE host_id = $1 AND outdated = true",


    "getPageInfo":      "SELECT cache, contentType, level, etag, lastModified " +
                        "FROM pages " +
                        "WHERE host_id = $1 AND page = $2",

    "getPageMapLinks":  "select CONCAT(hostname, linkedpage) as url, textlink from " +
                        " ( select linkedhost_id, linkedpage, textlink from hostlist inner join pages_map on hostlist.id = pages_map.host_id where hostname = $1 and page = $2 ) as subtb " +
                        " inner join hostlist on hostlist.id = subtb.linkedhost_id",

    "getPageMapLinked": "select CONCAT(hostname, page) as url, textlink from " +
                        " ( select host_id, page, textlink from hostlist inner join pages_map on hostlist.id = pages_map.linkedhost_id where hostname = $1 and linkedpage = $2 ) as subtb " +
                        " inner join hostlist on hostlist.id = subtb.host_id",


    /* DB UPDATES */
    "dbUpdCheck0001":   " SELECT * " +
                        " FROM information_schema.COLUMNS" +
                        "    WHERE " +
                        "    TABLE_SCHEMA = 'public' " +
                        "    AND TABLE_NAME = 'pages' " +
                        "    AND COLUMN_NAME = 'etag'",

    "dbUpdPatch0001":   " ALTER TABLE public.pages " +
                        " ADD COLUMN ETag character varying(255), " +
                        " ADD COLUMN lastModified character varying(255), " +
                        " ADD COLUMN outdated boolean NOT NULL, " +
                        " ADD COLUMN contentType character varying(255); "
};
