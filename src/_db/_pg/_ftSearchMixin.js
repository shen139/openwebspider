module.exports = function (CONF)
{
    var that = this;


    this.fulltextSearch = function (query, callback, options)
    {
        options = options || {};

        var unparsedSqlQuery = "SELECT id, " +
            " CONCAT(hostname,page) as url, " +
            " title, " +
            " text, " +

            " ts_rank_cd(tstext, plainto_tsquery($1)) as relevancy " +

            " FROM pages " +
            " WHERE tstext @@ plainto_tsquery($1) " +
            " ORDER BY relevancy DESC LIMIT 100;";

        that.query(unparsedSqlQuery, [query], function (err, res)
        {
            var results = [],
                rows = res.rows;

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
