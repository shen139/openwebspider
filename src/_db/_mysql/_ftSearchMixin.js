module.exports = function (CONF)
{
    var that = this;


    this.fulltextSearch = function (query, callback, options)
    {
        options = options || {};

        var unparsedSqlQuery = "SELECT id, " +
            " CONCAT(hostname,page) as url, " +
            " `title`, " +

            " `text`, " +

            " match(`text`) against(?) + match(`title`) against(?) + " +
            " match(`anchor_text`) against(?) + match(`page`) against(?) + " +
            " match(`hostname`) against(?) as relevancy " +

            " FROM ??.pages having relevancy > 0 " +
            " ORDER BY relevancy DESC LIMIT 100;";


        var sql = that.format(unparsedSqlQuery, [
            query,
            query,
            query,
            query,
            query,
            CONF.get("DB_CONNECTION_INDEX_DB")
        ]);

        that.query(sql, function (err, rows)
        {
            var results = [];

            if (!err)
            {
                for (var i = 0; i < rows.length; i++)
                {
                    results.push({
                        "id": rows[i]["id"],
                        "page": rows[i]["url"],
                        "title": rows[i]["title"],
                        // by default trim the text to 300 chars
                        "text": options["trim-text"] === false ? rows[i]["text"] : rows[i]["text"].substring(0, options["trim-length"] !== undefined ? options["trim-length"] : 300),
                        "relevancy": rows[i]["relevancy"]
                    });
                }
            }

            callback(results);
        });
    };

};
