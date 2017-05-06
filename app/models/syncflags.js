/**
 * Created by root on 4/5/17.
 */
var mongoose = require('mongoose'),
    abstract = require('./../models/abstract'),
    Constants = require('../core/constants'),
    Schema = mongoose.Schema;

var schema = {
    users:{type:Boolean,required:false,default:false},
    vehicles:{type:Boolean,required:false,default:false},
    membership:{type:Boolean,required:false,default:false},
    fareplan:{type:Boolean,required:false,default:false}
};
var model = new Schema(schema);
model.plugin(abstract);
var Syncflag = mongoose.model('syncflag', model, 'syncflag');

Syncflag.count({}, function (err, count) {

    if (err) {
        throw new Error("Sync flags couldn't sanitized" + err);
    }

    if (count < 1) {
        var defaults = {users:false,vehicles:false,membership:false,fareplan:false};
        Syncflag.create(defaults, function (err) {

            if (err) {
                throw new Error("Couldn't initialize sync flag collection" + err);
            }
            console.log('Sync flags has been initialized');
        });

    }

});

module.exports = Syncflag;