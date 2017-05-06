/**
 * Created by root on 22/4/17.
 */
/*require('./index');

var mongoose = require('mongoose'),
    abstract = require('./../models/abstract'),
    autoIncrement = require('mongoose-auto-increment'),
    AutoIncrement = require('mongoose-sequence'),
    Schema = mongoose.Schema;

var CheckoutSchema = mongoose.Schema({
    checkoutUid:Number,
    user: {type:Number, required: false},
    vehicleId: {type:Number, required: true},
    fromPort: {type:Number, required: true},
    checkOutTime: {type: Date, required: false},
    status: {type: String, required: true,default:'Open'},
    errorStatus:{type: Number, required: false,default:0},
    errorMsg:{type: String, required: false},
    updateStatus:{type: Number, required: false,default:0},
    duration:{type: Number, required: false,default:0},
    checkOutInitiatedTime: {type: Date, required: false},
    checkOutCompletionTime: {type: Date, required: false},
    unsyncedIp:{type:[String],required:false,default:[]},
    syncedIp:{type:[String],required:false,default:[]},
    lastSyncedAt:{type:Date,required:false,default:'2017-01-01T00:00:00.000Z'}
}, { collection : 'checkout'});


var Checkout = mongoose.model('checkout', CheckoutSchema);
CheckoutSchema.plugin(abstract);
CheckoutSchema.plugin(autoIncrement.plugin,{model:Checkout,field:'checkoutUid',startAt: 1, incrementBy: 1});

/!*model.index({ user: 1, vehicleId: 1, fromPort:1,checkOutTime:1 }, { unique: true });

model.plugin(abstract);*!/

module.exports = Checkout;*/


var mongoose = require('mongoose'),
    abstract = require('./../models/abstract'),
    Messages = require('../core/messages'),
    Schema = mongoose.Schema;

var schema = {
    checkoutUid:{type:Number,required:true},
    user: {type:Number, required: false},
    vehicleId: {type:Number, required: true},
    fromPort: {type:Number, required: true},
    checkOutTime: {type: Date, required: false},
    status: {type: String, required: true,default:'Open'},
    errorStatus:{type: Number, required: false,default:0},
    errorMsg:{type: String, required: false},
    updateStatus:{type: Number, required: false,default:0},
    localupdateStatus:{type: Number, required: false,default:0},
    duration:{type: Number, required: false,default:0},
    checkOutInitiatedTime: {type: Date, required: false},
    checkOutCompletionTime: {type: Date, required: false},
    unsyncedIp:{type:[String],required:false,default:[]},
    syncedIp:{type:[String],required:false,default:[]},
    lastSyncedAt:{type:Date,required:false,default:'2017-01-01T00:00:00.000Z'}
};
var model = new Schema(schema);

model.index({ user: 1, vehicleId: 1, fromPort:1,checkOutTime:1,checkoutUid:1 }, { unique: true });

model.plugin(abstract);
var CheckOut = mongoose.model('CheckOut', model, 'checkout');

module.exports = CheckOut;
