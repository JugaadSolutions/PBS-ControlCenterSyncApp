/**
 * Created by root on 25/4/17.
 */

var mongoose = require('mongoose'),
    Messages = require('../core/messages'),
    abstract = require('./../models/abstract'),
    Schema = mongoose.Schema;

var schema = {
    val:{type:Number,default:1}
};
var model = new Schema(schema);

model.plugin(abstract);
var Counter = mongoose.model('counter', model, 'counter');

Counter.count({}, function (err, count) {

    if (err) {
        throw new Error("Counter couldn't sanitized" + err);
    }

    if (count < 1) {
        var defaults = {val:1};
        Counter.create(defaults, function (err) {

            if (err) {
                throw new Error("Couldn't initialize counter collection" + err);
            }
            console.log('counter has been initialized');
        });

    }

});

module.exports = Counter;