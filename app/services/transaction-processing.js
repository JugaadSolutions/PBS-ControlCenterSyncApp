/**
 * Created by root on 22/4/17.
 */

var async = require('async'),
    moment = require('moment'),
    Constants = require('../core/constants'),
    CheckOut = require('../models/checkout'),
    CheckIn = require('../models/checkin'),
    User = require('../models/users'),
    Station = require('../models/station'),
    Port = require('../models/port'),
    vehicle = require('../models/vehicle');

exports.timelyCheckout = function (callback) {

    var vehiclesDetails;
    var checkoutDetails;

    async.series([
        function (callback) {
            CheckOut.find({'localupdateStatus':0,'errorStatus':0,'updateStatus':0}).sort({'checkOutTime': 'ascending'}).exec(function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(result)
                {
                    checkoutDetails = result;
                }
                return callback(null,result);
            });
        }
        ,
        function (callback) {
            if(checkoutDetails.length>0)
            {
                async.forEach(checkoutDetails,function (checkoutDetail) {
                    vehicle.findOne({vehicleUid:checkoutDetail.vehicleId},function (err,result) {
                        if(err)
                        {
                            return console.error('Error : '+err);
                        }
                        if(result)
                        {
                            vehiclesDetails = result;
                            User.findOne({UserID:checkoutDetail.user},function (err,userInfo) {
                                if(err)
                                {
                                    console.error('User not found at timely checkout in vehicle updating');
                                }
                                result.currentAssociationId = userInfo._id;
                                result.vehicleCurrentStatus = Constants.VehicleLocationStatus.WITH_MEMBER;
                                Port.findOne({PortID:checkoutDetail.fromPort},function (err,port) {
                                    if(err)
                                    {
                                        return console.error('Error : '+err);
                                    }
                                    if(port)
                                    {
                                        Station.findById(port.StationId,function (err,stat) {
                                            if(err)
                                            {
                                                return console.error('Error : '+err);
                                            }
                                            if(stat)
                                            {

                                                Station.find({'stationType':'dock-station'},'ipAddress',function (err,ds) {
                                                    if(err)
                                                    {
                                                        return console.error('Error : '+err);
                                                    }
                                                    if(ds.length<=0)
                                                    {
                                                        return callback(new Error("No docking station found to update for sync"));
                                                    }
                                                    result.unsyncedIp=[];
                                                    for(var i=0;i<ds.length;i++)
                                                    {
                                                        if(stat.ipAddress!=ds[i].ipAddress)
                                                        {
                                                            result.unsyncedIp.push(ds[i].ipAddress);
                                                        }
                                                    }
                                                    //result.unsyncedIp = ds;
                                                    result.syncedIp=[];
                                                    //result.lastModifiedAt=new Date();
                                                    vehicle.findByIdAndUpdate(result._id,result,function (err,res) {
                                                        if(err)
                                                        {
                                                            return console.error('Error : '+err);
                                                        }
                                                        vehicle.findByIdAndUpdate(result._id,{$set:{lastModifiedAt:new Date()}},function (err) {
                                                            if(err)
                                                            {
                                                                return console.error('Error : '+err);
                                                            }
                                                        });
                                                    });
                                                });
                                            }
                                        });
                                    }

                                });

                            });

                        }
                        else
                        {
                            return console.error("No vehicle found");
                        }
                    });
                    Port.findOne({PortID:checkoutDetail.fromPort},function (err,result) {
                        if(err)
                        {
                            return console.error('Error : '+err);
                        }
                        if(result)
                        {
                            if(result._type=='Docking-port')
                            {
                                //if(result.vehicleId.length>0) {
                                result.vehicleId = [];
                                result.portStatus = Constants.AvailabilityStatus.EMPTY;
                                // }
                            }
                            else if(result._type=='Fleet')
                            {

                            }
                            else
                            {
                                if(result.vehicleId.length>0)
                                {
                                    result.portStatus = Constants.AvailabilityStatus.NORMAL;
                                    for(var i=0;i<result.vehicleId.length;i++)
                                    {
                                        if(result.vehicleId[i].vehicleUid==checkoutDetail.vehicleId)
                                        {
                                            result.vehicleId.splice(i,1);
                                            if(result.vehicleId.length==0)
                                            {
                                                result.portStatus = Constants.AvailabilityStatus.EMPTY;
                                            }
                                        }
                                    }
                                }
                            }
                            Port.findByIdAndUpdate(result._id,result,function (err) {
                                if(err)
                                {
                                    return console.error('Error : '+err);
                                }
                            });
                        }
                    });
                    User.findOne({UserID:checkoutDetail.user},function (err,result) {
                        if(err)
                        {
                            return console.error('Error : '+err);
                        }
                        if(result)
                        {
                            Port.findOne({PortID:checkoutDetail.fromPort},function (err,port) {
                                if(err)
                                {
                                    return console.error('Error : '+err);
                                }
                                if(port)
                                {
                                    Station.findById(port.StationId,function (err,stat) {
                                        if(err)
                                        {
                                            return console.error('Error : '+err);
                                        }
                                        if(stat)
                                        {
                                            var vehicleDetails = {
                                                vehicleUid: checkoutDetail.vehicleId
                                            };
                                            result.vehicleId.push(vehicleDetails);

                                            Station.find({'stationType':'dock-station'},'ipAddress',function (err,ds) {
                                                if(err)
                                                {
                                                    return console.error('Error : '+err);
                                                }
                                                if(ds.length<=0)
                                                {
                                                    return callback(new Error("No docking station found to update for sync"));
                                                }
                                                result.unsyncedIp=[];
                                                for(var i=0;i<ds.length;i++)
                                                {
                                                    if(stat.ipAddress!=ds[i].ipAddress)
                                                    {
                                                        result.unsyncedIp.push(ds[i].ipAddress);
                                                    }
                                                }
                                                //result.unsyncedIp = ds;
                                                result.syncedIp=[];
                                                //result.lastModifiedAt=new Date();
                                                User.findByIdAndUpdate(result._id,result,function (err,res) {
                                                    if (err)
                                                    {
                                                        return console.error('Error updating IPs to sync : '+err);
                                                    }
                                                    User.findByIdAndUpdate(result._id,{$set:{lastModifiedAt:new Date()}},function (err) {
                                                        if (err)
                                                        {
                                                            return console.error('Error : '+err);
                                                        }
                                                    });
                                                });
                                            });
                                        }
                                    });
                                }

                            });

                        }
                    });


                    Port.findOne({PortID:checkoutDetail.fromPort}).deepPopulate('StationId').lean().exec(function (err,portData) {
                        if(err)
                        {
                            console.error('Error in fetching port at the time of updating checkout');
                        }
                        if(portData)
                        {
                            Station.find({'stationType':'dock-station'},'ipAddress',function (err,ds) {
                                if(err)
                                {
                                    return console.error('Error : '+err);
                                }
                                if(ds.length<=0)
                                {
                                    return callback(new Error("No docking station found to update for sync"));
                                }
                                //checkoutDetail.lastModifiedAt=new Date();
                                var dsl = ["13.13.13.45","13.13.13.46","13.13.13.49","13.13.13.28","13.13.13.47","13.13.13.41","13.13.13.20"];
                                checkoutDetail.unsyncedIp=[];
                                for(var i=0;i<ds.length;i++)
                                {
                                    /*if(portData.StationId.ipAddress!=ds[i].ipAddress)
                                    {
                                        checkoutDetail.unsyncedIp.push(ds[i].ipAddress);
                                    }*/
                                    if(portData.StationId.ipAddress!=dsl[i])
                                    {
                                        checkoutDetail.unsyncedIp.push(dsl[i]);
                                    }
                                }
                                //result.unsyncedIp = ds;
                                checkoutDetail.syncedIp=[];
                                checkoutDetail.updateStatus = 1;
                                CheckOut.findByIdAndUpdate(checkoutDetail._id,checkoutDetail,{new:true},function (err,result) {
                                    //CheckOut.findByIdAndUpdate(checkoutDetail._id,{$set:{'updateStatus':1}},function (err,result) {
                                    if(err)
                                    {
                                        console.error('Error : '+err);
                                    }
                                    CheckOut.findByIdAndUpdate(checkoutDetail._id,{$set:{lastModifiedAt:new Date()}},{new:true},function (err,result) {
                                        if(err)
                                        {
                                            console.error('Error : '+err);
                                        }
                                        console.log('Checkout Success : '+result);
                                    });
                                });
                            });
                        }
                    });

                },function (err) {
                    console.error('Error : '+err);
                    //callback();
                });
                return callback(null,null);
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
        return callback(null,null);
    });

};


exports.timelyCheckin = function (callback) {
    var checkinDetails;
    var userDetails;
    var vehiclesDetails;

    async.series([
        function (callback) {
            CheckIn.find({'localupdateStatus':0,'errorStatus':0,'updateStatus':0}).sort({'checkInTime': 'ascending'}).exec(function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(result)
                {
                    checkinDetails = result;
                }
                return callback(null,result);
            });
        },
        function (callback) {
            if(checkinDetails.length>0)
            {
                async.forEach(checkinDetails,function (checkinDetail) {

                    vehicle.findOne({vehicleUid:checkinDetail.vehicleId},function (err,result) {
                        if(err)
                        {
                            return console.error('Error : '+err);
                        }
                        if(result)
                        {
                            vehiclesDetails = result;
                            if(result.vehicleCurrentStatus == Constants.VehicleLocationStatus.WITH_MEMBER)
                            {
                                User.findById(result.currentAssociationId, function (err, userDet) {
                                    if (err) {
                                        return console.error('Checkin Time User Error : ' + err);
                                    }
                                    if (userDet) {
                                        userDetails = userDet;
                                        if (userDet._type == 'member') {
                                            //if(result.vehicleId.length>0) {
                                            userDet.vehicleId = [];
                                            // }
                                        }
                                        else {
                                            if (userDet.vehicleId.length > 0) {
                                                for (var i = 0; i < userDet.vehicleId.length; i++) {
                                                    if (userDet.vehicleId[i].vehicleUid==checkinDetail.vehicleId) {
                                                        userDet.vehicleId.splice(i, 1);
                                                    }
                                                }
                                            }

                                        }
                                        Port.findOne({PortID:checkinDetail.toPort},function (err,port) {
                                            if (err) {
                                                return console.error('Error : ' + err);
                                            }
                                            if(port)
                                            {
                                                Station.findById(port.StationId,function (err,stat) {
                                                    if (err) {
                                                        return console.error('Error : ' + err);
                                                    }
                                                    if(stat)
                                                    {
                                                        Station.find({'stationType':'dock-station'},'ipAddress',function (err,ds) {
                                                            if(err)
                                                            {
                                                                return console.error('Error : '+err);
                                                            }
                                                            if(ds.length<=0)
                                                            {
                                                                return callback(new Error("No docking station found to update for sync"));
                                                            }

                                                            userDet.unsyncedIp=[];
                                                            for(var i=0;i<ds.length;i++)
                                                            {
                                                                if(stat.ipAddress!=ds[i].ipAddress)
                                                                {
                                                                    userDet.unsyncedIp.push(ds[i].ipAddress);
                                                                }
                                                            }
                                                            //result.unsyncedIp = ds;
                                                            userDet.syncedIp=[];
                                                            //result.lastModifiedAt=new Date();
                                                            User.findByIdAndUpdate(userDet._id,userDet,function (err,res) {
                                                                if (err)
                                                                {
                                                                    return console.error('Error : '+err);
                                                                }
                                                                User.findByIdAndUpdate(userDet._id,{$set:{lastModifiedAt:new Date()}},function (err) {
                                                                    if (err)
                                                                    {
                                                                        return console.error('Error : '+err);
                                                                    }
                                                                });
                                                            });
                                                        });
                                                    }
                                                    else
                                                    {
                                                        return console.error('Error : station not found inside checkin');
                                                    }
                                                });
                                            }
                                        });

                                    }
                                    else
                                    {
                                        return console.error('Checkin Time User Error');
                                    }
                                });
                            }
                            Port.findOne({PortID:checkinDetail.toPort},function (err,portDet) {
                                if(err)
                                {
                                    console.error('Port not found while updating vehicle timely checkin');
                                }
                                Station.findById(portDet.StationId,function (err,stat) {
                                    if (err) {
                                        return console.error('Error : ' + err);
                                    }
                                    if(stat)
                                    {
                                        Station.find({'stationType':'dock-station'},'ipAddress',function (err,ds) {
                                            if(err)
                                            {
                                                return console.error('Error : '+err);
                                            }
                                            if(ds.length<=0)
                                            {
                                                return callback(new Error("No docking station found to update for sync"));
                                            }

                                            result.unsyncedIp=[];
                                            for(var i=0;i<ds.length;i++)
                                            {
                                                if(stat.ipAddress!=ds[i].ipAddress)
                                                {
                                                    result.unsyncedIp.push(ds[i].ipAddress);
                                                }
                                            }
                                            //result.unsyncedIp = ds;
                                            result.syncedIp=[];
                                            //result.lastModifiedAt=new Date();
                                            result.currentAssociationId = portDet._id;
                                            result.vehicleCurrentStatus = Constants.VehicleLocationStatus.WITH_PORT;
                                            vehicle.findByIdAndUpdate(result._id,result,function (err,veh) {
                                                if(err)
                                                {
                                                    return console.error('Error : '+err);
                                                }
                                                vehicle.findByIdAndUpdate(result._id,{$set:{lastModifiedAt:new Date()}},function (err) {
                                                    if(err)
                                                    {
                                                        return console.error('Error : '+err);
                                                    }
                                                });
                                            });
                                        });
                                    }
                                    else
                                    {
                                        return console.error('Error : station not found inside checkin');
                                    }
                                });

                            });

                        }
                    });
                    Port.findOne({PortID:checkinDetail.toPort},function (err,result) {
                        if(err)
                        {
                            return console.error('Error : '+err);
                        }
                        if(result)
                        {
                            var vehicleDetails = {
                                vehicleUid: checkinDetail.vehicleId
                            };

                            if(result._type=='Docking-port')
                            {
                                //if(result.vehicleId.length>0) {
                                result.vehicleId=[];
                                result.portStatus = Constants.AvailabilityStatus.FULL;
                                result.vehicleId.push(vehicleDetails);
                                // }
                            }
                            else
                            {
                                result.vehicleId.push(vehicleDetails);
                                if(result.vehicleId.length>=result.portCapacity)
                                {
                                    result.portStatus = Constants.AvailabilityStatus.FULL;
                                }
                                else
                                {
                                    result.portStatus = Constants.AvailabilityStatus.NORMAL;
                                }
                            }
                            //result.portStatus = Constants.AvailabilityStatus.FULL;


                            Port.findByIdAndUpdate(result._id,result,{new:true},function (err,portUpdated) {
                                if(err)
                                {
                                    return console.error('Error : '+err);
                                }
                                Port.find({'portStatus':Constants.AvailabilityStatus.FULL},function (err,result) {
                                    if(err)
                                    {
                                        return console.error('Error : '+err);
                                    }
                                    if(!result)
                                    {
                                        return console.log('No port found');
                                    }
                                    for(var i=0;i<result.length;i++)
                                    {
                                        if(!result[i]._id.equals(portUpdated._id))
                                        {
                                            if(result[i].vehicleId[0].vehicleUid)
                                            {
                                                if(checkinDetail.vehicleId==result[i].vehicleId[0].vehicleUid)
                                                {
                                                    /*result[i].vehicleId=[];
                                                     result[i].portStatus=Constants.AvailabilityStatus.EMPTY;*/
                                                    Port.findByIdAndUpdate(result[i]._id,{$set:{'vehicleId':[],'portStatus':Constants.AvailabilityStatus.EMPTY}},function (err) {
                                                        if(err)
                                                        {
                                                            return console.error('Error : '+err);
                                                        }
                                                    });
                                                }
                                            }

                                        }
                                    }
                                });
                            });
                        }
                    });

                    CheckIn.findByIdAndUpdate(checkinDetail._id,{$set:{'updateStatus':1}},function (err,result) {
                        if(err)
                        {
                            console.error('Error : '+err);
                        }
                        console.log('Checkin Success : '+result);
                    });
                    /* if(vehiclesDetails) {

                     if (vehiclesDetails.vehicleCurrentStatus == Constants.VehicleLocationStatus.WITH_MEMBER) {*/

                    /*                        }
                     }*/
                    if(userDetails)
                    {
                        CheckIn.findByIdAndUpdate(checkinDetail._id,{$set:{'user':userDetails._id}},function (err,result) {
                            if(err)
                            {
                                console.error('Error : '+err);
                            }
                            console.log('Checkin Success : '+result);
                        });
                    }

                },function (err) {
                    console.error('Error : '+err);
                });
                return callback(null,null);
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
    })
};


exports.ReconcileTransaction=function () {
    var checkinDetails;
    var balance;
    var comments = '-';
    async.series([
        function (callback) {
            CheckIn.find({'localupdateStatus':0,'errorStatus':0,'updateStatus':1}).sort({'checkInTime': 'ascending'}).exec(function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(result)
                {
                    checkinDetails = result;
                    //console.log(result.vehicleId.currentAssociationId);
                }

                return callback(null,result);
            });
        },
        function (callback) {
            if(checkinDetails.length>0)
            {
                async.forEach(checkinDetails,function (checkinDetail) {
                    CheckOut.findOne({
                        vehicleId: checkinDetail.vehicleId,
                        localupdateStatus:0,
                        updateStatus:1,
                        checkOutTime: {$lt:moment(checkinDetail.checkInTime)}
                    }).sort({checkOutTime: -1}).exec(function (err, result) {
                        if (err) {
                            return console.error('Error : '+err);
                        }
                        if(result) {
                            User.findOne({UserID:result.user}).lean().exec(function (err,userdetails) {
                                if(err)
                                {
                                    return console.error('Reconciliation User Error : '+err);
                                }
                                if(!userdetails)
                                {
                                    return console.log('User id not found : '+result.user);
                                }
                                if(userdetails._type=='member'&& (userdetails.status==Constants.MemberStatus.REGISTERED))
                                {
                                    if(userdetails.vehicleId.length>0)
                                    {
                                        Port.findOne({PortID:checkinDetail.toPort},function (err,port) {
                                            if(err)
                                            {
                                                return console.error('Error : '+err);
                                            }
                                            if(port)
                                            {
                                                Station.findById(port.StationId,function (err,stat) {
                                                    if(err)
                                                    {
                                                        return console.error('Error : '+err);
                                                    }
                                                    if(stat)
                                                    {
                                                       Station.find({'stationType':'dock-station'},'ipAddress',function (err,ds) {
                                                            if(err)
                                                            {
                                                                return console.error('Error : '+err);
                                                            }
                                                            if(ds.length<=0)
                                                            {
                                                                return callback(new Error("No docking station found to update for sync"));
                                                            }
                                                           userdetails.unsyncedIp=[];
                                                            for(var i=0;i<ds.length;i++)
                                                            {
                                                                if(stat.ipAddress!=ds[i].ipAddress)
                                                                {
                                                                    userdetails.unsyncedIp.push(ds[i].ipAddress);
                                                                }
                                                            }
                                                            //result.unsyncedIp = ds;
                                                           userdetails.syncedIp=[];
                                                           userdetails.vehicleId=[];
                                                            //result.lastModifiedAt=new Date();
                                                            User.findByIdAndUpdate(userdetails._id,userdetails,function (err,res) {
                                                                if (err)
                                                                {
                                                                    return console.error('Error updating IPs to sync : '+err);
                                                                }
                                                                User.findByIdAndUpdate(userdetails._id,{$set:{lastModifiedAt:new Date()}},function (err,us) {
                                                                    if (err)
                                                                    {
                                                                        return console.error('Error : '+err);
                                                                    }
                                                                    CheckIn.findByIdAndUpdate(checkinDetail._id, {$set: {'status': 'Close','updateStatus':2}}, function (err) {
                                                                        if (err) {
                                                                            return console.error('Error updating checkin entry to Close status '+err);
                                                                        }
                                                                    });
                                                                    CheckOut.findByIdAndUpdate(result._id, {$set: {'status': 'Close','updateStatus':2}}, function (err) {
                                                                        if (err) {
                                                                            return console.error('Error updating checkout entry to Close status'+err);
                                                                        }
                                                                    });
                                                                });
                                                            });
                                                        });
                                                    }
                                                });
                                            }

                                        });
                                    }
                                    else
                                    {
                                        CheckIn.findByIdAndUpdate(checkinDetail._id, {$set: {'localupdateStatus':0,'updateStatus':2}}, function (err) {
                                            if (err) {
                                                return console.error('Error updating checkin entry to Close status '+err);
                                            }
                                        });
                                        CheckOut.findByIdAndUpdate(result._id, {$set: {'localupdateStatus':0,'updateStatus':2}}, function (err) {
                                            if (err) {
                                                return console.error('Error updating checkout entry to Close status'+err);
                                            }
                                        });
                                    }

                                }
                                else
                                {
                                    if (userdetails.vehicleId.length > 0) {
                                        for (var i = 0; i < userdetails.vehicleId.length; i++)
                                        {
                                            if (userdetails.vehicleId[i].vehicleUid==checkinDetail.vehicleId) {
                                                userdetails.vehicleId.splice(i, 1);
                                            }
                                            /*if(i==userdetails.vehicleId.length-1)
                                            {
                                                User.findByIdAndUpdate(userdetails._id,userdetails,function (err) {
                                                    if(err)
                                                    {
                                                        return console.error('Error '+err);
                                                    }
                                                });
                                            }*/
                                        }
                                        Port.findOne({PortID:checkinDetail.toPort},function (err,port) {
                                            if(err)
                                            {
                                                return console.error('Error : '+err);
                                            }
                                            if(port)
                                            {
                                                Station.findById(port.StationId,function (err,stat) {
                                                    if(err)
                                                    {
                                                        return console.error('Error : '+err);
                                                    }
                                                    if(stat)
                                                    {
                                                        Station.find({'stationType':'dock-station'},'ipAddress',function (err,ds) {
                                                            if(err)
                                                            {
                                                                return console.error('Error : '+err);
                                                            }
                                                            if(ds.length<=0)
                                                            {
                                                                return callback(new Error("No docking station found to update for sync"));
                                                            }
                                                            userdetails.unsyncedIp=[];
                                                            for(var i=0;i<ds.length;i++)
                                                            {
                                                                if(stat.ipAddress!=ds[i].ipAddress)
                                                                {
                                                                    userdetails.unsyncedIp.push(ds[i].ipAddress);
                                                                }
                                                            }
                                                            //result.unsyncedIp = ds;
                                                            userdetails.syncedIp=[];

                                                            //result.lastModifiedAt=new Date();
                                                            User.findByIdAndUpdate(userdetails._id,userdetails,function (err,res) {
                                                                if (err)
                                                                {
                                                                    return console.error('Error updating IPs to sync : '+err);
                                                                }
                                                                User.findByIdAndUpdate(userdetails._id,{$set:{lastModifiedAt:new Date()}},function (err,us) {
                                                                    if (err)
                                                                    {
                                                                        return console.error('Error : '+err);
                                                                    }
                                                                    CheckIn.findByIdAndUpdate(checkinDetail._id, {$set: {'localupdateStatus':0,'updateStatus':2}}, function (err) {
                                                                        if (err) {
                                                                            return console.error('Error updating checkin entry to Close status '+err);
                                                                        }
                                                                    });
                                                                    CheckOut.findByIdAndUpdate(result._id, {$set: {'localupdateStatus':0,'updateStatus':2}}, function (err) {
                                                                        if (err) {
                                                                            return console.error('Error updating checkout entry to Close status'+err);
                                                                        }
                                                                    });
                                                                });
                                                            });
                                                        });
                                                    }
                                                });
                                            }

                                        });
                                    }
                                    else
                                    {
                                        CheckIn.findByIdAndUpdate(checkinDetail._id, {$set: {'localupdateStatus':0,'updateStatus':2}}, {new: true}, function (err) {
                                            if (err) {
                                                return console.error('Error '+err);
                                            }
                                        });
                                        CheckOut.findByIdAndUpdate(result._id, {$set: {'localupdateStatus':0,'updateStatus':2}}, {new: true}, function (err) {
                                            if (err) {
                                                return console.error('Error '+err);
                                            }
                                        });
                                    }
                                }
                            });
                        }
                    });
                },function (err) {
                    console.error('Error : '+err);
                    //callback();
                });
                return callback(null,null);
            }
            else
            {
                return callback(null,null);
            }
        }
    ],function (err,result) {
        if(err)
        {
            return console.log(err);
        }

    });
};