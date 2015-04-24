/**
 * ExampleController
 *
 * @description :: Example controller to demonstrate calling thinky model.
 */

module.exports = {


    'test': function(req, res) {
        Post.getJoin().then(function(result) {
            res.json(result);
        });

    },

};
