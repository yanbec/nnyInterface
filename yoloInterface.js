var express = require('express');
var app = express();
var fs = require('fs');
var dgram = require('dgram');
var nconf = require('nconf');


//Stuff
var frame = [0, 0];
var IntervalIDs = [0, 0];

nconf.use('file', { file: './config.json' });
nconf.load();

//nconf.set('devices:0:port', '7777');
//nconf.set('devices:1:port', '7777');
//nconf.save(function (err) {
//	if (err) {
//		console.error(err.message);
//		return;
//	}
//	console.log("Config saved.");
//	});


app.get("/", function (req, res) {
	fs.readFile('gui/index.html', function(err, data) {
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(data);
		});
		console.log("/ served.");
	});

app.get("/:device/color/:color", function(req, res) {
	if (IntervalIDs[req.params.device]) {
		clearInterval(IntervalIDs[req.params.device]);
		IntervalIDs[req.params.device] = false;
	}
	console.log("Setting color: "+req.params.color.toString());
	setColor(req.params.color, req.params.device);
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end();
	});

app.get("/:device/pattern", function(req, res) {
	console.log("Pattern on device " + req.params.device);
	var device = req.params.device;
	if (IntervalIDs[device]) {
		clearInterval(IntervalIDs[device]);
		IntervalIDs[device] = false;
	}
	IntervalIDs[device] = setInterval(function() {
			if (frame[device] == 0) {
				setColor("000000", req.params.device);
				frame[device]++
			}
			else {
				setColor("0000FF", req.params.device);
				frame[device] = 0;
			}


		}, 500, req.params.device);
	});

app.listen(8080, function() {
	console.log("Server started.");
	});


function setColor(colorHex, device) {
	console.log("Setting Color: " + colorHex);
	var bufstring = "";
	var ledCount = getLedCount(device);
	for (let i = 0; i < ledCount; i++) {
		bufstring+=colorHex;
	}
	sendUDP(bufstring, getIP(device), getPort(device));
}

function sendUDP(bufstring, ip, port) {
	console.log("Sending to " + ip + ":" + port);
	var client = dgram.createSocket('udp4');
	var buf = Buffer.from("000000" + bufstring, "hex"); // Initial 3 bytes are ignored
	client.send(buf, 0, buf.length, port, ip, function(err, bytes) {
		if (err) throw err;
		console.log('Sent.');
		client.close();
		}
	);
}

function getIP(device) {
	return nconf.get('devices:'+device+':ip');
}

function getPort(device) {
	return nconf.get('devices:'+device+':port');
}

function getLedCount(device) {
	console.log("LedCount: " + nconf.get('devices:'+device+':ledCount'));
	return nconf.get('devices:'+device+':ledCount');
}
