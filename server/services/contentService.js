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
let getCfgFromProvider = null;

function start(port, contentDir, cfgProvider) {
    if (!running && ready) {
        ready = false
        getCfgFromProvider = cfgProvider;
        server.use(express.static(contentDir));
        server.use(function(req, res, next) {
            console.log('ContentService [HTTP] ' + req.method + ' ' + req.originalUrl + ' from ' + req.ip);
            next();
        });
        server.get('/', function(req, res) {
            res.send('Hello World from ContentService');
        });
        server.get('/clientConfig.json', function(req, res) {
            res.send(generateClientConfig());
        });
        server.listen(port);
        running = true;
        console.log("ContentService running on http://localhost:" + port + "/");
        ready = true;
    }
}

function generateClientConfig() {
    cfg = getCfgFromProvider();
    json = {
        "appTitle": "DriveMe",
        "sNr": cfg.sNr,
        "iavNr": cfg.iavNr,
        "rtDriverProfile": (cfg.dNr == 1) ? driverProfile1 : driverProfile2
    }
    return json;
}

function stop() {
    if (running && ready) {
        ready = false;
        running = false;
        console.log("ContentService stopped");
        ready = true;
    }
}

var driverProfile1 = {
    "shortname": "Elenor",
    "fullname": "Elenor Kaiser",
    "pictureUrl": "../shared/assets/images/Elenor.png",
    "age": 26,
    "experience": "6 Jahre",
    "hobbies": "Reiten, Lesen, Reisen"
}

var driverProfile2 = {
    "shortname": "Jan",
    "fullname": "Jan Mayer",
    "pictureUrl": "../shared/assets/images/Jan.png",
    "age": 27,
    "experience": "9 Jahre",
    "hobbies": "Kochen, Fußball, Gaming"
}

