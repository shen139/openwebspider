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

            " ts_rank_cd(to_tsvector('english', text), to_tsquery('english', $1), 7) + " +
            " ts_rank_cd(to_tsvector('english',  hostname || '' || page), to_tsquery('english', $1), 7) + " +
            " ts_rank_cd(to_tsvector('english', title), to_tsquery('english', $1), 7) + " +
            " ts_rank_cd(to_tsvector('english', anchor_text), to_tsquery('english', $1), 7) " +
            "                   AS relevancy " +
            " FROM pages " +
            " WHERE " +
            "           to_tsvector('english', text) @@ to_tsquery('english', $1) OR " +
            "           to_tsvector('english', hostname || '' || page) @@ to_tsquery('english', $1) OR " +
            "           to_tsvector('english', title) @@ to_tsquery('english', $1) OR " +
            "           to_tsvector('english', anchor_text) @@ to_tsquery('english', $1) " +
            " ORDER BY relevancy DESC LIMIT 100;";

        var ftQuery = query.split(/\W+/).filter(function(s){return s}).join(" & ");
        that.query(unparsedSqlQuery, [ftQuery], function (err, res)
        {
            var results = [],
                rows;

            if (!err)
            {
                rows = res.rows;
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
            else
            {
                console.log(err);
            }

            callback(results);
        });
    };

};
