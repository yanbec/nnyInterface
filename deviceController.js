const configFile = "./config.json";

var dgram = require('dgram');
var nconf = require('nconf');

//Stuff
var frame = [];
var IntervalIDs = [];
var patternTemp = [];

nconf.use('file', { file: configFile });
nconf.load();

//Export functions
  exports.resetInterval = resetInterval;
  exports.setColor = setColor;
  exports.setPattern = setPattern;

  function resetInterval(device) {
  	if (IntervalIDs[device]) {
  		clearInterval(IntervalIDs[device]);
  		IntervalIDs[device] = false;
  	}
  }


function setPattern(pattern, device, color, speed) {
	frame[device] = 0;
	var delay = (1/speed)*3000;
	switch(pattern) {
		case "blink":
			setPatternBlink(device, color, delay);
		break;
		case "runningLight":
			setPatternRunningLight(device, color, delay);
		break;
    case "fillAll":
      setPatternFillAll(device, color, delay);
    break;
    case "fadeAll":
      setPatternFadeAll(device, delay);
    break;
    case "knightrider":
      setPatternKnightrider(device, color);
    break;
	}
}

function setPatternBlink(device, color, delay) {
	IntervalIDs[device] = setInterval(function() {
		if (frame[device] == 0) {
			setColor("000000", device);
			frame[device]++
		}
		else {
			setColor(color, device);
			frame[device] = 0;
		}
	}, delay);
}

function setPatternRunningLight(device, color, delay) {
	IntervalIDs[device] = setInterval(function() {
			console.log("Device: " + device);
			var ledCount = getLedCount(device);
			if (frame[device] == ledCount)
				frame[device] = 0;
			console.log("LedCount: " + ledCount + " framedev: " + frame[device]);
			var bufstring = "000000".repeat(frame[device])
						+ color + "000000".repeat(ledCount-frame[device]-1);
			sendToDevice(device, bufstring);
			frame[device]++;
	}, delay);
}

function setPatternFillAll(device, color, delay) {
  IntervalIDs[device] = setInterval(function() {
      console.log("Device: " + device);
      var ledCount = getLedCount(device);
      if (frame[device] == ledCount)
        frame[device] = 0;
      console.log("LedCount: " + ledCount + " framedev: " + frame[device]);
      var bufstring = color.repeat(frame[device])
            + "000000".repeat(ledCount-frame[device]);
      sendToDevice(device, bufstring);
      frame[device]++;
  }, delay);
}

function setPatternFadeAll(device, delay) {
  IntervalIDs[device] = setInterval(function() {
      var ledCount = getLedCount(device);
      var color = "000000";
      if (frame[device] == 300)
        frame[device] = 0;

      if (frame[device] < 100)
        color = colorPercentToHex(100-frame[device])
          + colorPercentToHex(frame[device]) + "00";
      else if (frame[device] >= 100 && frame[device] < 200)
        color = "00" + colorPercentToHex(200-frame[device])
          + colorPercentToHex(frame[device]-100);
      else if (frame[device] >= 200 && frame[device] < 300)
        color = colorPercentToHex(frame[device]-200) + "00"
          + colorPercentToHex(300-frame[device]);

      bufstring = color.repeat(ledCount);
      sendToDevice(device, bufstring);
      frame[device]++;
  }, delay);
}

function setPatternKnightrider(device, color) {
  IntervalIDs[device] = setInterval(function() {
      var ledCount = getLedCount(device);
      var ledsToLight = Math.round(ledCount/5);
      var maxFrame = (ledCount-ledsToLight)*2;
      if (frame[device] == maxFrame)
        frame[device] = 0;
      if (frame[device] < maxFrame/2)
        var bufstring = "000000".repeat(frame[device]) + color.repeat(ledsToLight)
        + "000000".repeat(ledCount-ledsToLight-frame[device]);
      else {
        var bufstring = "000000".repeat(ledCount-ledsToLight-frame[device]+maxFrame/2)
          + color.repeat(ledsToLight) + "000000".repeat(frame[device]-(maxFrame/2));
      }

      sendToDevice(device, bufstring);
      frame[device]++;
  }, 1000/getLedCount(device));
}



function setColor(colorHex, device) {
	console.log("Setting Color: " + colorHex);
	var bufstring = colorHex.repeat(getLedCount(device));
	sendToDevice(device, bufstring);
}

function sendToDevice(device, bufstring) {
	console.log("Sending: " + bufstring);
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

function colorPercentToHex(color) {
  if (color > 100)
    return 100;
  if (color < 0)
    return 0;
    var hex = Math.round(color*2.55).toString(16);
    if (hex.length < 2)
      hex = "0" + hex;
  return hex;
}
