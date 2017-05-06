/**
 * Created by root on 22/4/17.
 */
/**
 * Created by root on 3/10/16.
 */
var express = require('express'),

    config = require('config'),
    BridgeService = require('../services/bridge-service'),
    Messages = require('../core/messages');

var router = express.Router();

// Router Methods
router

    .post('/checkout/bridge', function (req, res, next) {
        BridgeService.BridgeCheckout(req.body,function (err,result) {
            if(err)
            {
                next(err, req, res, next);
            }
            else
            {
                res.json({error: false, message: Messages.CHECK_OUT_ENTRY_CREATED, description: '', data: result});
            }

        });
    })

    .post('/checkin/bridge', function (req, res, next) {
        BridgeService.BridgeCheckin(req.body,function (err,result) {
            if(err)
            {
                next(err, req, res, next);
            }
            else
            {
                res.json({error: false, message: Messages.CHECK_IN_ENTRY_CREATED, description: '', data: result});
            }

        });
    })
;
module.exports=router;