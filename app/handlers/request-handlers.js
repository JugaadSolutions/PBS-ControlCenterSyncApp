/**
 * Created by root on 22/4/17.
 */
var req = require('request'),
    config = require('config');

exports.RequestHandler = function (httpMethod, uri, requestBody,callback) {
    req(
        {
            method: httpMethod,
            baseUrl: config.get('SDC'),
            uri: uri,
            json: true,
            rejectUnauthorized: false
        }
        , function (error, response, body) {

            if (error) {
                // EventLoggersHandler.logger.error(error);
                return console.error('Error : Unable to reach server '+error);
            }

            if (body) {
                if (body.description) {
                    console.error("Response from API: " + body.description);
                }
                return callback(null,body.data);
            }

        }
    )

};

exports.PostRequestHandler = function (httpMethod, uri, requestBody,callback) {
    req(
        {
            method: httpMethod,
            baseUrl: config.get('SDC'),
            uri: uri,
            json: true,
            body:requestBody,
            rejectUnauthorized: false
        }
        , function (error, response, body) {

            if (error) {
                // EventLoggersHandler.logger.error(error);
                return console.error('Error : Unable to reach server '+error);
            }

            if (body) {
                if (body.description) {
                    console.error("Response from API: " + body.description);
                }
                return callback(null,body.data);
            }

        }
    )

};