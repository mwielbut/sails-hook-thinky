/**
 * Post.js
 *
 * @description :: Example of a blog post model file.
 */


var type = thinky.type;

module.exports = {

    tableName: "Post", // optional
    schema: {
        id: type.string(),
        title: type.string(),
        content: type.string(),
        idAuthor: type.string()
    },
    options: {},

    // set up any relationships, indexes or function definitions here
    init: function(model) {
        model.belongsTo(Author, "author", "idAuthor", "id");
    }

};
