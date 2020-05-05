/**
 * ContentService
 * Simple HTTP Server
 */
const os = require('os');
const express = require('express');
const server  = express();

module.exports = {
 start, stop
}

let running = false;
let ready = true;

function start(port, contentDir, portOfControlService) {
    if (!running && ready) {
        ready = false
        server.use(express.static(contentDir));
        server.use(function(req, res, next) {
            console.log('ContentService [HTTP] ' + req.method + ' ' + req.originalUrl + ' from ' + req.ip);
            next();
        })
        server.get('/', function(req, res) {
            res.send('Hello World from ContentService');
        })
        server.listen(port);
        running = true;
        console.log("ContentService running on http://localhost:" + port + "/");
        ready = true;
    }
}

function stop() {
    if (running && ready) {
        ready = false;
        running = false;
        console.log("ContentService stopped");
        ready = true;
    }
}

