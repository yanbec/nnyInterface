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
	resetInterval(req.params.device);
	console.log("Setting color: "+req.params.color.toString());
	setColor(req.params.color, req.params.device);
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end();
});

app.get("/:device/pattern/:pattern/:speed", function(req, res) {
	var device = req.params.device;
	var pattern = req.params.pattern;
	var speed = req.params.speed;
	resetInterval(device);
	setPattern(pattern, device, speed);
});

app.listen(8080, function() {
	console.log("Server started.");
});

function setPattern(pattern, device, speed) {
	var delay = (1/speed)*3000;
	switch(pattern) {
		case "blink":
		IntervalIDs[device] = setInterval(function() {
			if (frame[device] == 0) {
				setColor("000000", device);
				frame[device]++
			}
			else {
				setColor("0000FF", device);
				frame[device] = 0;
			}
		}, delay);
		break;
	}
}

function resetInterval(device) {
	if (IntervalIDs[device]) {
		clearInterval(IntervalIDs[device]);
		IntervalIDs[device] = false;
	}
}

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
