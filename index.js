"use strict";

/**
 * A hook to enable the Thinky ORM for RethinkDB in Sails. 
 * Can be configured alongside or as a replacement for Waterline.js
 *
 * `thinky` will be exposed as a global variable unless sails.config.globals.thinky is false.
 * All models loaded from the `thinkymodels` directory will be exposed as global variables unless sails.config.globals.thinkymodels is false.
 * 
 */

module.exports = function(sails)
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
                        },
                        path: 'api/thinky' // default path
                  }
            },

            configure: function()
            {
                  sails.once('lower', hook.teardown);
            },

            initialize: function(cb)
            {

                  var thinky = new Thinky(sails.config.thinky.rethinkdb);

                  thinky.dbReady()
                        .then(function()
                        {
                                    // Expose modules on `sails`
                              sails.thinky = thinky;

                              // Expose globals (if enabled)
                              if (sails.config.globals.thinky)
                              {
                                    global.thinky = thinky;
                              }

                              var thinkyDir = path.resolve(sails.config.appPath, sails.config.thinky.path);

                              buildDictionary.optional(
                              {
                                    dirname: thinkyDir,
                                    filter: /(.+)\.(js)$/,
                                    depth: 1,
                                    caseSensitive: true
                              }, processModels);

                        })
                        .catch(function(error)
                        {
                              return cb(error);
                        });



                  var processModels = function(error, thinkyModels)
                  {
                        if (error)
                              return cb(error);


                        _.each(thinkyModels, function(modelDefinition)
                        {
                              // Add a reference to the Sails app that loaded the module
                              modelDefinition.sails = sails;
                              // Bind all methods to the module context
                              _.bindAll(modelDefinition);
                        });

                        _.each(thinkyModels, function eachInstantiatedModel(modelDefinition)
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

                        // call the init funciton on each def to setup relationships
                        _.each(thinkyModels, function eachInstantiatedModel(modelDefinition)
                        {
                              var modelId = modelDefinition.tableName || modelDefinition.globalId;
                              var model = sails.thinkymodels[modelId];

                              modelDefinition.init(model);
                        });

                        cb();


                  };


            },


            teardown: function(cb)
            {
                  cb = cb || function(err)
                  {
                        if (err)
                        {
                              sails.log.error('Failed to teardown Thinky hook');
                              sails.log.error(err);
                        }
                  };

                  if (sails.thinky)
                  {
                        sails.thinky.r.getPoolMaster().drain()
                              .catch(cb)
                              .finally(cb);
                  }
                  else
                  {
                        return cb(new Error("Thinky uninitialized."));
                  }
            }
      };

      return hook;

};
