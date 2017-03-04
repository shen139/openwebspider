module.exports = function (CONF)
{
    var that = this;


    this.fulltextSearch = function (query, callback, options)
    {
        options = options || {};

        var collection = that.connection.collection('pages');
        collection.aggregate([
            {"$match": {"$text": {"$search": query}}},
            {"$project": {"_id": 1, "host": 1, "page": 1, "title": 1, "text": 1, "relevancy": {"$meta": "textScore"}}},
            {"$match": {"relevancy": {"$gt": 1.0}}},
            {"$sort": {"relevancy": {"$meta": "textScore"}}},
            { $limit : 100 }
        ], function (err, rows)
        {
            var results = [];

            if (!err)
            {
                for (var i = 0; i < rows.length; i++)
                {
                    results.push({
                        "id": rows[i]["_id"],
                        "page": rows[i]["host"].replace(":80", "") + rows[i]["page"],
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
