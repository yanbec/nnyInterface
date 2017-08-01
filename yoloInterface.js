var express = require('express');
var app = express();
var fs = require('fs');
var dgram = require('dgram');
var nconf = require('nconf');

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
	});

app.get("/color/:device/:color", function(req, res) {
	console.log("Setting color: "+req.params.color.toString());
	setColor(req.params.color, req.params.device);
	res.writeHead(200, {'Content-Type': 'text/html'});
	res.end();
	});

app.listen(8080, function() {
	console.log("Server started.");
	});


function setColor(colorHex, device) {
	console.log("Setting Color: " + colorHex);
	var bufstring = "000000";
	for (let i = 0; i < 128; i++) {
		bufstring+=colorHex;
	}
	sendUDP(Buffer.from(bufstring, "hex"), getIP(device), getPort(device));
}

function sendUDP(buf, ip, port) {
	console.log("Sending to " + ip + ":" + port);
	console.log("Buffer: "+buf.toString());
	var client = dgram.createSocket('udp4');
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






