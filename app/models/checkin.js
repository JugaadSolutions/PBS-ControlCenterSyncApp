/**
 * Created by root on 22/4/17.
 */
var mongoose = require('mongoose'),
    abstract = require('./../models/abstract'),
    Schema = mongoose.Schema;

var schema = {
    user: {type: Number, required: false},
    vehicleId: {type: Number, required: true},
    toPort: {type: Number, required: true},
    checkInTime: {type: Date, required: false},
    status: {type: String, required: true, default: 'Open'},
    errorStatus:{type: Number, required: false,default:0},
    errorMsg:{type: String, required: false},
    updateStatus:{type: Number, required: false,default:0},
    localupdateStatus:{type: Number, required: false,default:0},
    unsyncedIp:{type:[String],required:false,default:[]},
    syncedIp:{type:[String],required:false,default:[]},
    lastSyncedAt:{type:Date,required:false,default:'2017-01-01T00:00:00.000Z'}
};
var model = new Schema(schema);

model.index({vehicleId: 1, toPort:1,checkInTime:1 }, { unique: true });

model.plugin(abstract);
var CheckIn = mongoose.model('CheckIn', model, 'checkin');
module.exports = CheckIn;
