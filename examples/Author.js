"use strict";
/* global thinky */

/**
 * Author.js
 *
 * @description :: Example of a blog post author model file.
 */


var type = thinky.type;

var model = thinky.createModel("Author",
{
    id: type.string(),
    sold: type.number(),
    userId: type.string()
});

module.exports = model;
