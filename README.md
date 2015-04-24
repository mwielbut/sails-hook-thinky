# sails-hook-thinky
A hook to enable the Thinky ORM for RethinkDB in Sails.

## Usage


## Configuration

Create a new directory `/api/thinky`. This will be where your thinky models files will be auto-loaded by the hook.

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
