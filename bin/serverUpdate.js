/**
 * Created by root on 22/4/17.
 */
var SDCService = require('../app/services/SDC-Pull');
var BrideService = require('../app/services/bridge-service');
var TransactionProcessing = require('../app/services/transaction-processing');

setInterval(function () {
// setTimeout(function () {
 //console.log('Timeout');

    SDCService.getUsers(function (err,result) {
    if(err)
    {
        console.log('Users not synced');
        return;
    }
 });
 },10000);

setInterval(function () {
//setTimeout(function () {
    //console.log('Timeout');

    SDCService.getVehicles(function (err,result) {
        if(err)
        {
            console.log('Vehicles not synced');
            return;
        }
    });
},15000);

setInterval(function () {
//setTimeout(function () {
    //console.log('Timeout');

    SDCService.getFareplan(function (err,result) {
        if(err)
        {
            console.log('Fareplan not synced');
            return;
        }
        SDCService.getMembership(function (err,result) {
            if(err)
            {
                console.log('Membership not synced');
                return;
            }
        });
    });
},20000);

setInterval(function () {
//setTimeout(function () {
    //console.log('Timeout');

    SDCService.getStation(function (err,result) {
        if(err)
        {
            console.log('Stations not synced');
            return;
        }
        SDCService.getPorts(function (err,result) {
            if(err)
            {
                console.log('ports not synced');
                return;
            }
        });
    });
},25000);

//setTimeout(function () {
setInterval(function () {
    //console.log('Timeout');
    BrideService.Checkoutuploader(function (err,result) {
            if(err)
            {
                console.log('upload checkoutError');
                //return;
            }
        }
    );

},1000);

//setTimeout(function () {
setInterval(function () {
    // console.log('Timeout');
    BrideService.Checkinuploader(function (err,result) {
        if(err)
        {
            console.log('Upload checkin Error');
            //return;
        }

    });
},3000);

setInterval(function () {
//setTimeout(function () {
    //console.log('Timeout');
    TransactionProcessing.timelyCheckout(function (err,result) {
        if(err)
        {
            console.log('Error');
            return;
        }
        //console.log('checkin');
        /*if(result) {
         console.log(result);
         }*/
    });
},1000);

setInterval(function () {
//setTimeout(function () {
    //console.log('Timeout');
    TransactionProcessing.timelyCheckin(function (err,result) {
        if(err)
        {
            console.log('Error');
            return;
        }
        //console.log('checkin');
        /*if(result) {
         console.log(result);
         }*/
        TransactionProcessing.ReconcileTransaction();
    });
},3000);

/*
setInterval(function () {
//setTimeout(function () {
    //console.log('Timeout');
/!*   TransactionProcessing.timelyCheckin(function (err,result) {
        if(err)
        {
            console.log('Error');
            return;
        }
        //console.log('checkin');
        /!*if(result) {
         console.log(result);
         }*!/

    );*!/
    TransactionProcessing.ReconcileTransaction();
},3000);*/
