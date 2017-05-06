/**
 * Created by root on 22/4/17.
 */
var async = require('async'),
    counter = require('../models/counter'),
    User = require('../models/users'),
    vehicle = require('../models/vehicle'),
    Port = require('../models/port'),
    CheckOut = require('../models/checkout'),
    CheckIn = require('../models/checkin'),
    CheckoutError = require('../models/checkoutError'),
    CheckInError = require('../models/checkinError'),
    RequestService = require('../handlers/request-handlers');

exports.BridgeCheckout=function (record,callback) {
    var vehicleDetails;
    var requestDetails;
    var userDetails;
    var portDetails;
    var checkoutDetails;
    var errorstatus=0;
    var errormsg='';
    var details = {user :'',
        vehicleId : '',
        fromPort:'',
        checkOutTime:'',
        status:'',
        errorStatus:0,
        errorMsg:''};

        var count;
    async.series([
        function (callback) {
            User.findOne({'UserID':record.cardId},function (err,result) {
                if(err)
                {
                    errorstatus=1;
                    errormsg=errormsg+':'+err;
                    details.user=record.cardId;
                    return callback(null,null);
                }
                if(!result)
                {
                    errorstatus=1;
                    errormsg=errormsg+': No user found by this id';
                    details.vehicleId = record.cardId;
                    return callback(null,null);
                }
                userDetails=result;
                details.user=result.UserID;
                return callback(null,result);
            });
        }
        ,
        function (callback) {
            vehicle.findOne({'vehicleUid':record.vehicleId},function (err,result) {
                if(err)
                {
                    errorstatus=1;
                    errormsg=errormsg+':'+err;
                    details.vehicleId = record.vehicleId;
                    return callback(null,null);
                }
                if(!result)
                {
                    errorstatus=1;
                    errormsg=errormsg+': No vehicle found by this id';
                    details.vehicleId = record.vehicleId;
                    return callback(null,null);
                }
                vehicleDetails=result;
                details.vehicleId = result.vehicleUid;
                return callback(null,result);
            });
        },
        function (callback) {
            Port.findOne({PortID:record.fromPort},function (err,result) {
                if(err)
                {
                    errorstatus=1;
                    errormsg=errormsg+':'+err;
                    details.fromPort = record.fromPort;
                    return callback(null,null);
                }
                if(!result)
                {
                    errorstatus=1;
                    errormsg=errormsg+': No port found by this id';
                    details.fromPort = record.fromPort;
                    return callback(null,null);
                }
                portDetails = result;
                details.fromPort = result.PortID;
                return callback(null,result);
            });
        },
        function (callback) {
            counter.find({},function (err,counterResult) {
                if(err)
                {
                    console.error('Error finding counter');
                }
                if(counterResult.length>0)
                {
                    count=counterResult[0].val;
                        counterResult[0].val = counterResult[0].val+1;
                        counter.findByIdAndUpdate(counterResult[0]._id,{$set:{val:counterResult[0].val}},{new:true},function (err,result) {
                            if(err)
                            {
                                console.error('Error updating counter');
                            }
                            return callback(null, result);
                        });
                }
                else
                {
                    return callback(null,null);
                }

            });
        }
        ,
        function (callback) {
            if (errorstatus == 0) {
                requestDetails = {
                    user: userDetails.UserID,
                    vehicleId: vehicleDetails.vehicleUid,
                    fromPort: portDetails.PortID,
                    checkOutTime: record.checkOutTime
                };

                        requestDetails.checkoutUid= count;
                        CheckOut.create(requestDetails, function (err, result) {
                            if (err) {
                                errorstatus=1;
                                errormsg=errormsg+':'+err;
                                details.checkOutTime = record.checkOutTime;
                                details.errorStatus = errorstatus;
                                details.errorMsg = errormsg;
                                return callback(null, null);
                            }
                            details.status = result.status;
                            details.checkOutTime = result.checkOutTime;
                            checkoutDetails = result;
                           return callback(null,result);
                        });


            }
            else
            {
                return callback(null,null);
            }
        },
        function(callback) {
            if(errorstatus == 1)
            {
                details.errorStatus=errorstatus;
                details.errorMsg = errormsg;
                CheckoutError.create(details,function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    details.status = result.status;
                    details.checkOutTime = result.checkOutTime;
                    checkoutDetails= result;
                    return callback(null,result);
                });
            }
            else
            {
                return callback(null,null);
            }

        }

    ],function (err,result) {
        if (err)
        {
            return callback(err,null);
        }
        return callback(null,details);
    });
};

exports.BridgeCheckin = function (record,callback) {
    var vehicleDetails;
    var requestDetails;
    var portDetails;
    var checkoutDetails;
    var errorstatus=0;
    var errormsg='';
    var details = {
        vehicleId : '',
        toPort:'',
        checkInTime:'',
        status:'',
        errorStatus:0,
        errorMsg:''};

    async.series([
        function (callback) {
            vehicle.findOne({'vehicleUid':record.vehicleId},function (err,result) {
                if(err)
                {
                    errorstatus=1;
                    errormsg=errormsg+':'+err;
                    details.vehicleId = record.vehicleId;
                    return callback(null,null);
                }
                if(!result)
                {
                    errorstatus=1;
                    errormsg=errormsg+': No vehicle found by this id';
                    details.vehicleId = record.vehicleId;
                    return callback(null,null);
                }
                vehicleDetails=result;
                details.vehicleId = result.vehicleUid;
                return callback(null,result);
            });
        },
        function (callback) {
            Port.findOne({PortID:record.toPort},function (err,result) {
                if(err)
                {
                    errorstatus=1;
                    errormsg=errormsg+':'+err;
                    details.toPort = record.toPort;
                    return callback(null,null);
                }
                if(!result)
                {
                    errorstatus=1;
                    errormsg=errormsg+': No port found by this id';
                    details.toPort = record.toPort;
                    return callback(null,null);
                }
                portDetails = result;
                details.toPort = result.PortID;
                return callback(null,result);
            });
        }
        ,
        function (callback) {
            if (errorstatus == 0) {
                requestDetails = {
                    vehicleId: vehicleDetails.vehicleUid,
                    toPort: portDetails.PortID,
                    checkInTime: record.checkInTime
                };

                CheckIn.create(requestDetails, function (err, result) {
                    if (err) {
                        errorstatus=1;
                        errormsg=errormsg+':'+err;
                        details.checkInTime = record.checkInTime;
                        details.errorStatus = errorstatus;
                        details.errorMsg = errormsg;
                        return callback(null, null);
                    }
                    details.status = result.status;
                    details.checkInTime = result.checkInTime;
                    checkoutDetails = result;
                    return callback(null, result);
                });
            }
            else
            {
                return callback(null,null);
            }
        },
        function(callback) {
            if(errorstatus == 1)
            {
                details.errorStatus=errorstatus;
                details.errorMsg = errormsg;
                CheckInError.create(details,function (err,result) {
                    if(err)
                    {
                        return callback(err,null);
                    }
                    details.status = result.status;
                    details.checkInTime = result.checkInTime;
                    checkoutDetails= result;
                    return callback(null,result);
                });
            }
            else
            {
                return callback(null,null);
            }
        }
    ],function (err,result) {
        if (err)
        {
            return callback(err,null);
        }
        return callback(null,details);
    });
};

exports.Checkoutuploader = function (callback) {

    var checkoutData;
    var checkinData=0;
    async.series([
        function (callback) {
            CheckOut.find({'status':'Open'}).sort({'checkOutTime': 'ascending'}).exec(function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                checkoutData = result;
                return callback(null,result);
            });
        },

        function (callback) {
            if(checkoutData)
            {   var cdata = [];
                cdata = checkoutData;
                for(var i=0;i<cdata.length;i++)
                {
                    /* http://43.251.80.79:13055/api/transactions/checkout/
                     cardId
                     vehicleId
                     fromPort
                     checkOutTime

                     http://43.251.80.79:13055/api/transactions/checkin
                     vehicleId
                     toPort
                     checkInTime */

                    var httpMethod = 'POST',
                        uri = 'transactions/checkout/bridge',
                        requestBody = {

                            "cardId": cdata[i].user,
                            "vehicleId": cdata[i].vehicleId,
                            "fromPort": cdata[i].fromPort,
                            "checkOutTime":cdata[i].checkOutTime
                        };

                    RequestService.PostRequestHandler(httpMethod, uri, requestBody,function (err,result) {
                        if(err)
                        {
                            console.log('Checkout Connection Error');
                            return callback(err,null);
                        }
                        if(!result)
                        {
                            return callback(new Error("Unable to Update Data"),null);
                        }
                        CheckOut.findOneAndUpdate({"user":result.user,"vehicleId":result.vehicleId,"fromPort":result.fromPort,"status":'Open'},{$set:{"status":"Close","errorStatus":result.errorStatus,"errorMsg":result.errorMsg}},function (err,result) {
                            if(err)
                            {
                                return callback(err,null);
                            }
                        });
                    });
                }
            }
            else
            {
                return callback(null,null);
            }
        }/*,
         function (callback) {
         CheckIn.find({'status':'Open'}).sort({'checkInTime': 'ascending'}).exec(function (err,result) {
         if(err)
         {
         return callback(err,null);
         }
         checkinData = result;
         return callback(null,result);
         });
         },
         function (callback) {

         if(checkinData!=0)
         {   var cidata = [];
         cidata = checkinData;
         for(var i=0;i<cidata.length;i++)
         {
         /!* http://43.251.80.79:13055/api/transactions/checkout/
         cardId
         vehicleId
         fromPort
         checkOutTime

         http://43.251.80.79:13055/api/transactions/checkin
         vehicleId
         toPort
         checkInTime *!/

         var httpMethod = 'POST',
         uri = 'transactions/checkin/bridge',
         requestBody = {
         "vehicleId": cidata[i].vehicleId,
         "toPort": cidata[i].toPort,
         "checkInTime":cidata[i].checkInTime
         };

         RequestService.requestHandler(httpMethod, uri, requestBody,function (err,result) {
         if(err)
         {
         return callback(err,null);
         }
         if(!result)
         {
         return callback(new Error("Data couldn't able to update"),null);
         }
         CheckIn.findOneAndUpdate({"user":result.user,"vehicleId":result.vehicleId,"toPort":result.toPort,"checkInTime":result.checkInTime},{$set:{"status":"Close"}},function (err,result) {
         if(err)
         {
         return callback(err,null);
         }
         });
         });
         }
         }
         else
         {
         return callback(null,null);
         }
         }*/
    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });

};

exports.Checkinuploader = function (callback) {
    var checkinData;
    async.series([

        function (callback) {
            CheckIn.find({'status':'Open'}).sort({'checkInTime': 'ascending'}).exec(function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                checkinData = result;
                return callback(null,result);
            });
        },
        function (callback) {

            if(checkinData)
            {   var cidata = [];
                cidata = checkinData;
                for(var i=0;i<cidata.length;i++)
                {
                    var httpMethod = 'POST',
                        uri = 'transactions/checkin/bridge',
                        requestBody = {
                            "vehicleId": cidata[i].vehicleId,
                            "toPort": cidata[i].toPort,
                            "checkInTime":cidata[i].checkInTime
                        };

                    RequestService.PostRequestHandler(httpMethod, uri, requestBody,function (err,result) {
                        if(err)
                        {
                            console.log('Checkin Connection Error');
                            return callback(err,null);
                        }
                        if(!result)
                        {
                            return callback(new Error("Data couldn't able to update"),null);
                        }
                        CheckIn.findOneAndUpdate({/*"user":result.user,*/"vehicleId":result.vehicleId,"toPort":result.toPort,"checkInTime":result.checkInTime},{$set:{"status":"Close","errorStatus":result.errorStatus,"errorMsg":result.errorMsg}},function (err,result) {
                            if(err)
                            {
                                return callback(err,null);
                            }
                        });
                    });
                }
            }
            else
            {
                return callback(null,null);
            }
        }
    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });

};