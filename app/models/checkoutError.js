/**
 * Created by root on 22/4/17.
 */

var mongoose = require('mongoose');
var abstract = require('./abstract');
var Schema = mongoose.Schema;

var schema = {
    user: {type: String, required: false},
    vehicleId: {type: String, required: false},
    fromPort: {type: String, required: false},
    checkOutTime: {type: String, required: false},
    status: {type: String, required: false,default:'Open'},
    errorStatus:{type: String, required: false},
    errorMsg:{type: String, required: false}
};

var model = new Schema(schema);
model.plugin(abstract);
var CheckOutError = mongoose.model('CheckOutError', model, 'checkoutError');
module.exports = CheckOutError;
