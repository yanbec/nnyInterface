var express = require('express');
var app = express();
var fs = require('fs');
var controller = require('./deviceController.js');

app.get("/", function (req, res) {
	fs.readFile('gui/index.html', function(err, data) {
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(data);
	});
	console.log("/ served.");
});

app.get("/:device/color/:color", function(req, res) {
	controller.resetInterval(req.params.device);
	console.log("Setting color: "+req.params.color.toString());
	controller.setColor(req.params.color, req.params.device);
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end();
});

app.get("/:device/pattern/:pattern/:color/:speed", function(req, res) {
	var device = req.params.device;
	var pattern = req.params.pattern;
	var color = req.params.color;
	var speed = req.params.speed;
	controller.resetInterval(device);
	controller.setPattern(pattern, device, color, speed);
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end();
});

app.listen(8080, function() {
	console.log("Server started.");
});
