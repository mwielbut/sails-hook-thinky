"use strict";
/* global async, _ */


module.exports = function (sails)
{

    var Thinky = require('thinky');
    //var type = thinky.type;
    var path = require('path');
    var buildDictionary = require('sails-build-dictionary');




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

            // // Default model properties
            // models: {

            //   // This default connection (i.e. datasource) for the app
            //   // will be used for each model unless otherwise specified.
            //   connection: 'localDiskDb'
            // },


            // Connections to data sources, web services, and external APIs.
            // Can be attached to models and/or accessed directly.
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
                    _.each(results.thinkyModels, function (model)
                    {
                        // Add a reference to the Sails app that loaded the module
                        model.sails = sails;
                        // Bind all methods to the module context
                        _.bindAll(model);
                    });

                    return next();
                }],
                exposeToNamespace: ['thinkyModels', function (next, results)
                {
                    _.each(results.thinkyModels, function eachInstantiatedModel(model)
                    {
                        // Set `sails.models.*` reference to instantiated Collection
                        // Exposed as `sails.models[modelID]`
                        sails.thinkymodels = sails.thinkymodels ||
                        {};
                        sails.thinkymodels[model.globalId] = model;

                        // Create global variable for this model
                        // (if enabled in `sails.config.globals`)
                        // Exposed as `[globalId]`
                        if (sails.config.globals && sails.config.globals.thinkymodels)
                        {
                            global[model.globalId] = model;
                        }
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

            sails.thinky.r.getPool().drain()
                .catch(cb)
                .finally(cb);
        }
    };

    return hook;

};
