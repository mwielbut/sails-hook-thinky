"use strict";
/* global thinky */

/**
 * Post.js
 *
 * @description :: Example of a blog post model file.
 */


var type = thinky.type;

var model = thinky.createModel("Post",
{
    'id': type.string(),
    'title': type.string(),
    'content': type.string(),
    'idAuthor': type.string()
});

// define joins and indexes normally
var Author = require('./Author');
model.belongsTo(Author, "author", "idAuthor", "id");

module.exports = model;
