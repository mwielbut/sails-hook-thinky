# sails-hook-thinky
A hook to enable the Thinky ORM for RethinkDB in Sails.

*Using this in Production would be unwise. It has been lightly tested. Develop at your own risk.*

## Installation

`npm install sails-hook-thinky`

or add to `package.json`

## Usage

The hook configures the thinky orm and expsoses the thinky instance to the global `thinky`. All model files in the `/api/thinky` directory will be loaded automatically and exposed in the `sails.thinkymodels` propery and optionally to the global namespace. 

Make model calls from any service, controller, policy, etc. just as you would normally. No need to require thinky or any model files.

```javascript
Post.getJoin().then(function(posts) {
     console.log(posts);
 });
```

## Model file configuration

```javascript
var type = thinky.type;

module.exports = {

    tableName: "Car", // optional, will use name of file if not present
    schema: {
        id: type.string(),
        type: type.string(),
        year: type.string(),
        idOwner: type.string()
    },
    options: {},

    // set up any relationships, indexes or function definitions here
    init: function(model) {
        model.belongsTo(Person, "owner", "idOwner", "id");
        
        model.ensureIndex("type");
        
        model.define("isDomestic", function() {
            return this.type === 'Ford' || this.type === 'GM';
        });
    }

};
```
*Also see `examples` directory for sample model files.

## Configuration

Create a new directory `/api/thinky` (or customize below). This will be where your thinky models files will be auto-loaded by the hook.

Create a new configuration file `thinky.js` in the config directory.
```javascript
/**
 * Thinky config
 * (sails.config.thinky)
 *
 */

module.exports.thinky = {

  rethinkdb: {
      host: "localhost",
      port: 28015,
      authKey: "",
      db: "test"
  },
  path: "<path to thinky models directory - default is '/api/thinky'>"
    
};
```

**Optional:** edit the .sailsrc file to disable Waterline to prevent any conflicts. _(pubsub and blueprints will also need to be disabled due to dependencies on Waterline)_
```javascript
{
  "generators": {
    "modules": {}
  },
  "hooks": {
    "orm": false,
    "pubsub": false,
    "blueprints": false
  }
}
```
