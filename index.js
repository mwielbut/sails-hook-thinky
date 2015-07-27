"use strict";
/* global async, _ */

/**
 * A hook to enable the Thinky ORM for RethinkDB in Sails. 
 * Can be configured alongside or as a replacement for Waterline.js
 *
 * `thinky` will be exposed as a global variable unless sails.config.globals.thinky is false.
 * All models loaded from the `thinkymodels` directory will be exposed as global variables unless sails.config.globals.thinkymodels is false.
 * 
 */

module.exports = function (sails)
{

    var Thinky = require('thinky');
    var path = require('path');
    var buildDictionary = require('sails-build-dictionary');
    var _ = require('lodash');

    /**
     * Hook definition
     */

    var hook = {


        defaults:
        {

            globals:
            {
                thinky: true,
                thinkymodels: true
            },

            // thinky specific configs
            thinky:
            {
                rethinkdb:
                {
                    host: "localhost",
                    port: 28015,
                    authKey: "",
                    db: "test"
                }
            }
        },

        configure: function ()
        {
            sails.once('lower', hook.teardown);
        },

        initialize: function (cb)
        {
            var thinky = new Thinky(sails.config.thinky.rethinkdb);

            // Expose modules on `sails`
            sails.thinky = thinky;

            // Expose globals (if enabled)
            if (sails.config.globals.thinky)
            {
                global.thinky = thinky;
            }

            var thinkyDir = path.resolve(sails.config.appPath, 'api/thinky');


            async.auto(
            {

                // Load model and adapter definitions defined in the project
                thinkyModels: function (next)
                {
                    buildDictionary.optional(
                    {
                        dirname: thinkyDir,
                        filter: /(.+)\.(js)$/,
                        depth: 1,
                        caseSensitive: true
                    }, next);
                },

                bindToSails: ['thinkyModels', function (next, results)
                {
                    _.each(results.thinkyModels, function (modelDefinition)
                    {
                        // Add a reference to the Sails app that loaded the module
                        modelDefinition.sails = sails;
                        // Bind all methods to the module context
                        _.bindAll(modelDefinition);
                    });

                    return next();
                }],
                build: ['bindToSails', function (next, results)
                {
                    _.each(results.thinkyModels, function eachInstantiatedModel(modelDefinition)
                    {
                        var modelId = modelDefinition.tableName || modelDefinition.globalId;
                        var model = thinky.createModel(modelId, modelDefinition.schema, modelDefinition.options);

                        // expose sails.thinkymodels[] in a similar fashion to sails.models[]
                        sails.thinkymodels = sails.thinkymodels ||
                        {};
                        sails.thinkymodels[modelId] = model;

                        // expose sails thinky models as globals in a similar fashion to waterline models
                        if (sails.config.globals && sails.config.globals.thinkymodels)
                        {
                            global[modelId] = model;
                        }
                    });

                    return next();
                }],
                initialize: ['build', function (next, results)
                {
                    // call the init funciton on each def to setup relationships
                    _.each(results.thinkyModels, function eachInstantiatedModel(modelDefinition)
                    {
                        var modelId = modelDefinition.tableName || modelDefinition.globalId;
                        var model = sails.thinkymodels[modelId]

                        modelDefinition.init(model);
                    });

                    return next();
                }],

            }, cb);

        },


        teardown: function (cb)
        {
            cb = cb || function (err)
            {
                if (err)
                {
                    sails.log.error('Failed to teardown ORM hook.');
                    sails.log.error(err);
                }
            };

            sails.thinky.r.getPoolMaster().drain()
                .catch(cb)
                .finally(cb);
        }
    };

    return hook;

};
