var express = require('express');
var cors = require('cors');
var app = express();
var fs = require('fs');
var controller = require('./deviceController');
var config = require('./config');


app.use(cors());
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.get("/", function(req, res) {
    fs.readFile('api-example/index.html', function(err, data) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
    });
});

app.get("/:device/color/:color", function(req, res) {
    controller.resetInterval(req.params.device);
    controller.setColor(req.params.color, req.params.device);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end();
});

app.get("/:device/pattern/:pattern/:color/:speed", function(req, res) {
    var device = req.params.device;
    var pattern = req.params.pattern;
    var color = req.params.color;
    var speed = req.params.speed;
    controller.resetInterval(device);
    controller.setPattern(pattern, device, color, speed);
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end();
});

app.get("/config/get/general", function(req, res) {
    convertToJSONResult(res, config.getGeneralConfig());
});

app.get("/config/get/device/:device", function(req, res) {
    convertToJSONResult(res, config.getDeviceConfig(req.params.device));
});


app.listen(config.getGeneralConfig().port, function() {
    console.log("Server started on " + config.getGeneralConfig().port);

});

function convertToJSONResult(res, content) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify(content));
    res.end();
}