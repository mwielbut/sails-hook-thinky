/**
 * Author.js
 *
 * @description :: Example of a blog post author model file.
 */


var type = thinky.type;

module.exports = {

    tableName: "Author", // optional
    schema: {
        id: type.string(),
        sold: type.number(),
        userId: type.string()
    },
    options: {},

    // set up any relationships, indexes or function definitions here
    init: function(model) {}

};
