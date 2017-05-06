/**
 * Created by root on 10/1/17.
 */

var express = require('express'),
    user = require('../models/users'),
    Messages = require('../core/messages');
var router = express.Router();

/* GET users listing. */
/*router.get('/', function(req, res, next) {
 res.send('respond with a resource');
 });*/

router


    .post('/', function (req, res, next) {
        user.create(req.body,function (err,result) {
            if(err)
            {
                next(err, req, res, next);
            }
            else
            {
                res.json({error: false, message: Messages.RECORD_CREATED_SUCCESS, description: '', data: result});
            }

        });
    })



;
module.exports = router;
