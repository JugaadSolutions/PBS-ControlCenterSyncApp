/**
 * Created by root on 22/4/17.
 */
var async = require('async'),
    Users = require('../models/users'),
    Vehicles = require('../models/vehicle'),
    Fareplan = require('../models/fare-plan'),
    Membership = require('../models/membership'),
    Station = require('../models/station'),
    Ports = require('../models/port'),
    Syncflag = require('../models/syncflags'),
    RequestService = require('../handlers/request-handlers');


function userStat(u) {
    var IPs = [];
    Station.find({},function (err,result) {
        if(err)
        {
            console.error(err);
        }
        if(result.length>0)
        {
            for(var i=0;i<result.length;i++)
            {
                IPs.push(result[i].ipAddress);
            }
            console.log(IPs.toString());
            //u.lastModifiedAt = new Date();
            u.unsyncedIp = IPs;
            u.syncedIp = [];
            if(u.smartCardNumber)
            {

            }
            else
            {
                u.cardNum=0;
                u.smartCardNumber='-';
            }
            Users.findByIdAndUpdate(u._id,u,{new:true},function (err,result) {
                if(err)
                {
                    console.error('Error while updating user unsync ips');
                }
                if(result)
                {
                    Users.findByIdAndUpdate(u._id,{$set:{lastModifiedAt:new Date()}},function (err,result) {
                        if(err)
                        {
                            console.error('Error while updating user last modified');
                        }
                        return;
                    });
                }
                });
        }
        else
        {
            return;
        }
    });
}
function vehicleStat(u) {
    var IPs = [];
    Station.find({},function (err,result) {
        if(err)
        {
            console.error(err);
        }
        if(result.length>0)
        {
            for(var i=0;i<result.length;i++)
            {
                IPs.push(result[i].ipAddress);
            }
            console.log(IPs.toString());
           // u.lastModifiedAt = new Date();
            u.unsyncedIp = IPs;
            u.syncedIp = [];
            Vehicles.findByIdAndUpdate(u._id,u,{new:true},function (err,result) {
                if (err) {
                    console.error('Error while updating vehicle unsync ips');
                }
                if(result)
                {
                    Vehicles.findByIdAndUpdate(u._id,{$set:{lastModifiedAt:new Date()}},function (err,result) {
                        if(err)
                        {
                            console.error('Error while updating vehicle last modified');
                        }
                        return;
                    });
                }
            });
        }
        else
        {
            return;
        }
    });
}
function fareplanStat(u) {
    var IPs = [];
    Station.find({},function (err,result) {
        if(err)
        {
            console.error(err);
        }
        if(result.length>0)
        {
            for(var i=0;i<result.length;i++)
            {
                IPs.push(result[i].ipAddress);
            }
            console.log(IPs.toString());
            //u.lastModifiedAt = new Date();
            u.unsyncedIp = IPs;
            u.syncedIp = [];
            Fareplan.findByIdAndUpdate(u._id,u,{new:true},function (err,result) {
                if (err) {
                    console.error('Error while updating fareplan unsync ips');
                }
                if(result)
                {
                    Fareplan.findByIdAndUpdate(u._id,{$set:{lastModifiedAt:new Date()}},function (err,result) {
                        if(err)
                        {
                            console.error('Error while updating fareplan last modified');
                        }
                        return;
                    });
                }
            });
        }
        else
        {
            return;
        }
    });
}
function membershipStat(u) {
    var IPs = [];
    Station.find({},function (err,result) {
        if(err)
        {
            console.error(err);
        }
        if(result.length>0)
        {
            for(var i=0;i<result.length;i++)
            {
                IPs.push(result[i].ipAddress);
            }
            console.log(IPs.toString());
            //u.lastModifiedAt = new Date();
            u.unsyncedIp = IPs;
            u.syncedIp = [];
            Membership.findByIdAndUpdate(u._id,u,{new:true},function (err,result) {
                if (err) {
                    console.error('Error while updating Membership unsync ips');
                }
                if(result)
                {
                    Membership.findByIdAndUpdate(u._id,{$set:{lastModifiedAt:new Date()}},function (err,result) {
                        if(err)
                        {
                            console.error('Error while updating Membership last modified');
                        }
                        return;
                    });
                }
            });
        }
        else
        {
            return;
        }
    });
}
function stationStat(u) {
    Station.findById(u._id,function (err,result) {
        if(err)
        {
            console.error(err);
        }
        if(result)
        {
            console.log('Station '+result.ipAddress);
            u.lastModifiedAt = new Date();
            u.unsyncedIp.push(result.ipAddress) ;
            u.syncedIp = [];
            Station.findByIdAndUpdate(u._id,u,{new:true},function (err,stationInfo) {
                if(err)
                {
                    console.log('Error in updating station in SDCpull');
                }
                if(stationInfo)
                {
                      async.series([
                          /*function (callback) {
                              Station.findByIdAndUpdate(u._id,{$set:{lastModifiedAt:new Date()}},{new:true},function (err,result) {
                                  if (err) {
                                      //return console.error('Unable to push data to users while creating dock-station');
                                      return callback(err, null);
                                  }
                                  return callback(null, result);
                              });
                          },*/
                          function (callback) {
                              Fareplan.update({},{$push:{unsyncedIp:stationInfo.ipAddress},lastModifiedAt:new Date()},{ multi: true },function (err,result) {
                                  if(err)
                                  {
                                      //return console.error('Unable to push data to users while creating dock-station');
                                      return callback(err,null);
                                  }
                                  return callback(null,result);
                              });
                          },
                          function (callback) {
                              Membership.update({},{$push:{unsyncedIp:stationInfo.ipAddress},lastModifiedAt:new Date()},{ multi: true },function (err,result) {
                                  if(err)
                                  {
                                      //return console.error('Unable to push data to users while creating dock-station');
                                      return callback(err,null);
                                  }
                                  return callback(null,result);
                              });
                          },
                          function (callback) {
                              Users.update({}, {$push: {unsyncedIp: stationInfo.ipAddress},lastModifiedAt:new Date()}, {multi: true}, function (err, result) {
                                  if (err) {
                                      //return console.error('Unable to push data to users while creating dock-station');
                                      return callback(err, null);
                                  }
                                  return callback(null, result);
                              });
                          },
                          function (callback) {
                              Vehicles.update({}, {$push: {unsyncedIp: stationInfo.ipAddress},lastModifiedAt:new Date()}, {multi: true}, function (err, result) {
                                  if (err) {
                                      //return console.error('Unable to push data to users while creating dock-station');
                                      return callback(err, null);
                                  }
                                  return callback(null, result);
                              });
                          }
                      ],function (err,result) {
                          if(err)
                          {
                              console.error('Error updating entity when new station created');
                          }
                      }) ;
                }
            });
        }
        else
        {
            return;
        }
    });
}
function portsStat(u) {
    Station.findById(u.StationId,function (err,result) {
        if(err)
        {
            console.error(err);
        }
        if(result)
        {
            console.log("Port sync "+result.ipAddress);
            //u.lastModifiedAt = new Date();
            u.unsyncedIp.push(result.ipAddress) ;
            u.syncedIp = [];
            Ports.findByIdAndUpdate(u._id,u,{new:true},function (err,result) {
                if (err) {
                    console.error('Error while updating Ports unsync ips');
                }
                if(result)
                {
                    Ports.findByIdAndUpdate(u._id,{$set:{lastModifiedAt:new Date()}},function (err,result) {
                        if(err)
                        {
                            console.error('Error while updating Ports last modified');
                        }
                        return;
                    });
                }
            });
        }
        else
        {
            return;
        }
    });
}

exports.getUsers = function (callback) {

    async.waterfall([
        function (callback) {
            Syncflag.findOne({users:false},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                if(!result)
                {
                    return callback(new Error("Cannot sync user now"),null);
                }
                return callback(null,result);
            });
        },
        function (result,callback) {
            var httpMethod = 'GET',
                uri = 'sync/userupdated',
                requestBody='';
            RequestService.RequestHandler(httpMethod,uri,requestBody,function (err,userDetails) {
                if(err)
                {
                    console.log(' Connection Error');
                   // return callback(err,null);
                }
                if(userDetails.length>0)
                {
                    return callback(null,userDetails);
                }
                else
                {
                    return callback(null,null);
                }
            });
        },
        function (userDetails,callback) {
            if(userDetails)
            {
                if(userDetails.length>0)
                {
                    async.forEach(userDetails,function(user,callback){
                        Users.findById(user._id,function (err,result) {
                            if(err)
                            {
                                console.error('Unable to find users');
                               // callback(err,null);
                            }
                            if(result)
                            {
                                delete user._id;
                                Users.findByIdAndUpdate(result._id,user,{new:true},function (err,result) {
                                    if(err) {
                                        console.error('Unable to update users');
                                    }
                                    userStat(result);
                                    callback();
                                });
                            }
                            else
                            {
                                Users.create(user,function (err,result) {
                                    if(err)
                                    {
                                        console.error('err while creating user '+err);
                                    }
                                    userStat(result);
                                    callback();
                                });
                            }

                        });
                    },function (err,result) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                        return callback(null,result);
                    });

                }
                else
                {
                    return callback(null,[]);
                }

            }
            else
            {
                return callback(null,[]);
            }

        },
        function (result,callback) {
            Syncflag.findOneAndUpdate({users:false},{$set:{users:true}},function (err,result) {
                if(err)
                {
                    return callback(err,null);
                }
                return callback(null,result);
            });
        }
    ],function (err,result) {
        if(err)
        {
            return callback(err,null);
        }
        return callback(null,result);
    });
};

exports.getVehicles = function (callback) {

    async.waterfall([
        function (callback) {
            var httpMethod = 'GET',
                uri = 'sync/vehicleupdated',
                requestBody='';
            RequestService.RequestHandler(httpMethod,uri,requestBody,function (err,vehicleDetails) {
                if(err)
                {
                    console.log(' Connection Error');
               //     return callback(err,null);
                }
                if(vehicleDetails.length>0)
                {
                    return callback(null,vehicleDetails);
                }
                else
                {
                    return callback(null,null);
                }
            });
        },
        function (vehicleDetails,callback) {
            if(vehicleDetails)
            {
                if(vehicleDetails.length>0)
                {
                    async.forEach(vehicleDetails,function(vehicle,callback){
                        Vehicles.findById(vehicle._id,function (err,result) {
                            if(err)
                            {
                                console.error('Unable to find vehicle');
                                // callback(err,null);
                            }
                            if(result)
                            {
                                delete vehicle._id;
                                Vehicles.findByIdAndUpdate(result._id,vehicle,{new:true},function (err,result) {
                                    if(err) {
                                        console.error('Unable to update vehicle');
                                    }
                                    vehicleStat(result);
                                    callback();
                                });
                            }
                            else
                            {
                                Vehicles.create(vehicle,function (err,result) {
                                    if(err)
                                    {
                                        console.error('err while creating vehicle '+err);
                                    }
                                    vehicleStat(result);
                                    callback();
                                });
                            }

                        });
                    },function (err,result) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                        return callback(null,result);
                    });

                }
                else
                {
                    return callback(null,[]);
                }

            }
            else
            {
                return callback(null,[]);
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

exports.getFareplan = function (callback) {

    async.waterfall([
        function (callback) {
            var httpMethod = 'GET',
                uri = 'sync/fareplanupdated',
                requestBody='';
            RequestService.RequestHandler(httpMethod,uri,requestBody,function (err,fareplanDetails) {
                if(err)
                {
                    console.log(' Connection Error');
                   // return callback(err,null);
                }
                if(fareplanDetails.length>0)
                {
                    return callback(null,fareplanDetails);
                }
                else
                {
                    return callback(null,null);
                }
            });
        },
        function (fareplanDetails,callback) {
            if(fareplanDetails)
            {
                if(fareplanDetails.length>0)
                {
                    async.forEach(fareplanDetails,function(fareplan,callback){
                        Fareplan.findById(fareplan._id,function (err,result) {
                            if(err)
                            {
                                console.error('Unable to find fareplan');
                                // callback(err,null);
                            }
                            if(result)
                            {
                                delete fareplan._id;
                                Fareplan.findByIdAndUpdate(result._id,fareplan,{new:true},function (err,result) {
                                    if(err) {
                                        console.error('Unable to update fareplan');
                                    }
                                    fareplanStat(result);
                                    callback();
                                });
                            }
                            else
                            {
                                Fareplan.create(fareplan,function (err,result) {
                                    if(err)
                                    {
                                        console.error('err while creating fareplan '+err);
                                    }
                                    fareplanStat(result);
                                    callback();
                                });
                            }

                        });
                    },function (err,result) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                        return callback(null,result);
                    });

                }
                else
                {
                    return callback(null,[]);
                }

            }
            else
            {
                return callback(null,[]);
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

exports.getMembership = function (callback) {

    async.waterfall([
        function (callback) {
            var httpMethod = 'GET',
                uri = 'sync/membershipupdated',
                requestBody='';
            RequestService.RequestHandler(httpMethod,uri,requestBody,function (err,membershipDetails) {
                if(err)
                {
                    console.log(' Connection Error');
                  //  return callback(err,null);
                }
                if(membershipDetails.length>0)
                {
                    return callback(null,membershipDetails);
                }
                else
                {
                    return callback(null,null);
                }
            });
        },
        function (membershipDetails,callback) {
            if(membershipDetails)
            {
                if(membershipDetails.length>0)
                {
                    async.forEach(membershipDetails,function(membership,callback){
                        Membership.findById(membership._id,function (err,result) {
                            if(err)
                            {
                                console.error('Unable to find membership');
                                // callback(err,null);
                            }
                            if(result)
                            {
                                delete membership._id;
                                Membership.findByIdAndUpdate(result._id,membership,{new:true},function (err,result) {
                                    if(err) {
                                        console.error('Unable to update membership');
                                    }
                                    membershipStat(result);
                                    callback();
                                });
                            }
                            else
                            {
                                Membership.create(membership,function (err,result) {
                                    if(err)
                                    {
                                        console.error('err while creating membership '+err);
                                    }
                                    membershipStat(result);
                                    callback();
                                });
                            }

                        });
                    },function (err,result) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                        return callback(null,result);
                    });

                }
                else
                {
                    return callback(null,[]);
                }

            }
            else
            {
                return callback(null,[]);
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

exports.getStation = function (callback) {

    async.waterfall([
        function (callback) {
            var httpMethod = 'GET',
                uri = 'sync/stationupdated',
                requestBody='';
            RequestService.RequestHandler(httpMethod,uri,requestBody,function (err,stationDetails) {
                if(err)
                {
                    console.log(' Connection Error');
               //     return callback(err,null);
                }
                if(stationDetails.length>0)
                {
                    return callback(null,stationDetails);
                }
                else
                {
                    return callback(null,null);
                }
            });
        },
        function (stationDetails,callback) {
            if(stationDetails)
            {
                if(stationDetails.length>0)
                {
                    async.forEach(stationDetails,function(station,callback){
                        Station.findById(station._id,function (err,result) {
                            if(err)
                            {
                                console.error('Unable to find station');
                                // callback(err,null);
                            }
                            if(result)
                            {
                                delete station._id;
                                Station.findByIdAndUpdate(result._id,station,{new:true},function (err,result) {
                                    if(err) {
                                        console.error('Unable to update station');
                                    }
                                    stationStat(result);
                                    callback();
                                });
                            }
                            else
                            {
                                Station.create(station,function (err,result) {
                                    if(err)
                                    {
                                        console.error('err while creating station '+err);
                                    }
                                    stationStat(result);
                                    callback();
                                });
                            }

                        });
                    },function (err,result) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                        return callback(null,result);
                    });

                }
                else
                {
                    return callback(null,[]);
                }

            }
            else
            {
                return callback(null,[]);
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

exports.getPorts = function (callback) {

    async.waterfall([
        function (callback) {
            var httpMethod = 'GET',
                uri = 'sync/portsupdated',
                requestBody='';
            RequestService.RequestHandler(httpMethod,uri,requestBody,function (err,portsDetails) {
                if(err)
                {
                    console.log(' Connection Error');
                //    return callback(err,null);
                }
                if(portsDetails.length>0)
                {
                    return callback(null,portsDetails);
                }
                else
                {
                    return callback(null,null);
                }
            });
        },
        function (portsDetails,callback) {
            if(portsDetails)
            {
                if(portsDetails.length>0)
                {
                    async.forEach(portsDetails,function(port,callback){
                        Ports.findById(port._id,function (err,result) {
                            if(err)
                            {
                                console.error('Unable to find port');
                                // callback(err,null);
                            }
                            if(result)
                            {
                                delete port._id;
                                Ports.findByIdAndUpdate(result._id,port,{new:true},function (err,result) {
                                    if(err) {
                                        console.error('Unable to update port');
                                    }
                                    portsStat(result);
                                    callback();
                                });
                            }
                            else
                            {
                                Ports.create(port,function (err,result) {
                                    if(err)
                                    {
                                        console.error('err while creating port '+err);
                                    }
                                    portsStat(result);
                                    callback();
                                });
                            }

                        });
                    },function (err,result) {
                        if(err)
                        {
                            return callback(err,null);
                        }
                        return callback(null,result);
                    });

                }
                else
                {
                    return callback(null,[]);
                }

            }
            else
            {
                return callback(null,[]);
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