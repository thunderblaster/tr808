var ffmpeg = require("fluent-ffmpeg");
var express = require('express');
var crypto = require('crypto');
var pg = require('pg');
var keys = require(__dirname+'/keys.js');
var conString = "postgres://" + keys.postgres.user + ":" + keys.postgres.pass + "@" + keys.postgres.server + "/" + keys.postgres.database;
var path = require('path');
var server = express();
var locale = require("locale");
var supported = new locale.Locales(["en","es", "ro"]);

//=======================================================================
//===Negotiate best language based on HTTP Accept-Languages header=======
//===*.tr808.online/*====================================================
server.use(locale(supported));

//=======================================================================
//===Handle POST requests to export to audio file========================
//===*.tr808.online/export [type=POST]===================================
server.post('/export', function(req, res) {
	var body = [];
 	req.on("error", function(err) {
 		console.error(err);
 		res.statusCode = 400;
     	res.end();
 	}).on("data", function(chunk) {
 		body.push(chunk);
 	}).on("end", function() {
 		res.setHeader("Content-Type", "audio/mpeg");
 		res.setHeader("Access-Control-Allow-Origin", "*");
 		res.statusCode = 200;
 		
 		body = Buffer.concat(body).toString();
		 
		var drummachine = JSON.parse(body);
	
		var instruments = ["bd", "sd", "lt", "mt", "ht", "rs", "cp", "cb", "cy", "oh", "ch"];
		var filesToCombine = [];
		var x = 0;
		
		//================================================================================================
		//=====instead of doing all measures, this will have to go measure by measure=====================
		//=====and save each measure to a node stream, concat'ing the measures at the end=================
		//================================================================================================
		
		for(i=0; i<instruments.length; i++) {
			for(j=1; j<=(Number(drummachine.measures)*16); j++) {
				if(drummachine[instruments[i]].steps[j]) {
					filesToCombine[x] = getPositionOfFile(drummachine[instruments[i]], j, drummachine.tempo, drummachine.groove);
					x++;
				}
			}
	 	}
		console.log(filesToCombine);
		var pathToAudioFolder = path.resolve(__dirname + "/../www/audio/");
		var ffmpegCode = "ffmpeg()";
		for(i=0; i<filesToCombine.length; i++) {
			var nameOfInstrumentFolder = "/" + filesToCombine[i][1].substring(0,2) + "/";
			ffmpegCode = ffmpegCode + ".input('" + pathToAudioFolder + nameOfInstrumentFolder + filesToCombine[i][1] + ".wav')";
		}
		
		ffmpegCode = ffmpegCode + ".audioCodec('libmp3lame').format('mp3').complexFilter([";
			var numberOfPassesk = Math.ceil(filesToCombine.length/31); //number of items after split
			for(k=0; k<numberOfPassesk; k++) { 
				ffmpegCode = ffmpegCode + "'aevalsrc=0:d=" + ((240 / drummachine.tempo)*drummachine.measures) + "[s" + (filesToCombine.length + k) + "]',";
			}
		for(i=0; i<filesToCombine.length; i++) {
			ffmpegCode = ffmpegCode + "'aevalsrc=0:d=" + filesToCombine[i][0] + "[s" + i + "]',";
	
		}
		
		for(i=0; i<filesToCombine.length; i++) {
			ffmpegCode = ffmpegCode + "{filter: 'concat', options: {v: 0, a: 1}, inputs: ['s" + i + "', '" + i + ":a'], outputs: 'ac" + i + "'},";
		}
		if(filesToCombine.length > 31) { //need to split stuff up or amix will blow up
			var numberOfPasses = Math.ceil(filesToCombine.length/31); //number of items after split
			for(i=0; i<numberOfPasses; i++) { // i = number of passes
				var minThisPass = 0 + (31*i); //used in for loop to ensure all of filesToCombine[] are covered
				var maxThisPass = 30 + (31*i); //ditto
				var numberOfInputs = 32; //gets overwritten if this is the last pass (and number is fewer than 32)
				var lastOne = (filesToCombine.length < maxThisPass); //true if this is the last pass
				if(lastOne) {
					numberOfInputs = (filesToCombine.length - minThisPass + 1); //get accurate number of passes here
					maxThisPass = filesToCombine.length - 1; //get accurate last file
				}
				ffmpegCode = ffmpegCode + "{filter: 'amix', options: {inputs: " + numberOfInputs + ", duration: 'longest'}, inputs: ['s" + (filesToCombine.length + i) + "'";
					
				for(j=minThisPass; j<=maxThisPass; j++) { // j = each instrument within a pass
					console.log(j);
					ffmpegCode = ffmpegCode + ", 'ac" + j + "'"; //add to amix input
				}

				ffmpegCode = ffmpegCode + "], outputs: 'mix" + i + "'},";
			}

			//change this to amix the outputs of above for loop
			ffmpegCode = ffmpegCode + "{filter: 'amix', options: {inputs: " + numberOfPasses + ", duration: 'longest'}, inputs: ['mix0'";
			for(i=1; i<numberOfPasses; i++) {
				ffmpegCode = ffmpegCode + ", 'mix" + i + "'";
			}
		} else {
			ffmpegCode = ffmpegCode + "{filter: 'amix', options: {inputs: " + (filesToCombine.length + 1) + ", duration: 'longest'}, inputs: ['s" + (filesToCombine.length) + "'";
			for(i=0; i<filesToCombine.length; i++) {
				ffmpegCode = ffmpegCode + ", 'ac" + i + "'";
			}
		}
		
		
		ffmpegCode = ffmpegCode + "], outputs: 'out'}], 'out')";
		ffmpegCode = ffmpegCode + ".on('error', function (err, stdout, stderr) {"
                + "console.log('an error happened: ' + err.message);"
                + "console.log('ffmpeg stdout: ' + stdout);"
                + "console.log('ffmpeg stderr: ' + stderr);})";
		
		
		ffmpegCode = ffmpegCode + ".on('end', function () {"
                + "console.log('Processing finished !');res.end();})";
		
		ffmpegCode = ffmpegCode + ".pipe(res);";
		
		
		console.log(ffmpegCode);
		
		eval(ffmpegCode);

 	});
});


function getPositionOfFile(instrument, step, tempo, groove) {
	if(instrument.which) {
		var nameOfInstrument = instrument.which.toString();
	} else {
		var nameOfInstrument = instrument.name.toString();
	}
	var tone = instrument.tone;
	var decay = instrument.decay;
	if(tone!==false) {
		tone = tone * 25;
		if(tone===0) {
			tone = "00";
		} else if(tone===100) {
			tone = "10";
		}
	}
	if(decay!==false) {
		decay = decay * 25;
		if(decay===0) {
			decay = "00";
		} else if(decay===100) {
			decay = "10";
		}
	}
	if(tone===false&&decay===false) {
		var nameOfFile = nameOfInstrument;
	} else if(decay===false) {
		var nameOfFile = nameOfInstrument + tone;
	} else if(tone===false) {
		var nameOfFile = nameOfInstrument + decay;
	} else {
		var nameOfFile = nameOfInstrument + tone + decay;
	}
	var secondsPerBeat = 60 / tempo;
	var secondsPerStep = secondsPerBeat / 4;
	var millisecondsPerStep = secondsPerStep * 1000;
	var grooveCoefficient = groove;
	if((step+2)%4===0) {
		millisecondsPerStep = millisecondsPerStep * grooveCoefficient;
	} else if((step+1)%4===0) {
		millisecondsPerStep = millisecondsPerStep / grooveCoefficient;
	}
	var lengthOfSilence = millisecondsPerStep * (step - 1);
	lengthOfSilence = Math.round(lengthOfSilence) / 1000;
	var infoToReturn = [lengthOfSilence, nameOfFile];
	return infoToReturn;
}


//=======================================================================
//===Handle POST requests to save to URL=================================
//===*.tr808.online/save [type=POST]=====================================
server.post('/save', function(req, res) {
	var body = [];
 	req.on("error", function(err) {
 		console.error(err);
 		res.statusCode = 400;
     	res.end();
 	}).on("data", function(chunk) {
 		body.push(chunk);
 	}).on("end", function() {
 		res.setHeader("Content-Type", "text/plain");
 		res.setHeader("Access-Control-Allow-Origin", "*");
 		res.statusCode = 200;
 		
 		body = Buffer.concat(body).toString();
 		
		var hash = require('crypto').createHash('sha256').update(body).digest('hex');
		res.end(hash);
		pg.connect(conString, function(err, client, done) {
			if(err) {
				return console.error('could not connect to postgres', err);
			}
			client.query({
				name:"insert-if-needed",
				text:"INSERT INTO saves (id, settings) SELECT $1, $2 WHERE NOT EXISTS (SELECT id FROM saves WHERE id=$1);",
				values:[hash, body]
			}, function(err, result) {
				if(err) {
					return console.error('error running query', err);
				}
				done();
			});
		});
 	});
});

//=======================================================================
//===Handle POST requests to lookup if particular settings have already==
//===been saved to the database==========================================
//===*.tr808.online/lookup [type=POST]===================================
server.post('/lookup', function(req, res) {
	var body = [];
 	req.on("error", function(err) {
 		console.error(err);
 		res.statusCode = 400;
     	res.end();
 	}).on("data", function(chunk) {
 		body.push(chunk);
 	}).on("end", function() {
 		res.setHeader("Content-Type", "application/json");
 		res.setHeader("Access-Control-Allow-Origin", "*");
 		res.statusCode = 200;
 		
 		body = Buffer.concat(body).toString();
 		
		pg.connect(conString, function(err, client, done) {
			if(err) {
				return console.error('could not connect to postgres', err);
			}
			client.query({
				name:"lookup",
				text:"SELECT settings FROM saves WHERE id=$1;",
				values:[body]
			}, function(err, result) {
				if(err) {
					return console.error('error running query', err);
				}
				res.send(result, null, function(sendErr) {
					if(sendErr) {
						return console.error(sendErr);
					}
					res.end();
					done();
				});
				
			});
		});
 	});
});

//=======================================================================
//===Handle GET requests to load previously saved settings===============
//===*.tr808.online/save/* [type=GET]====================================
server.get('/save/*', function(req, res) {
	var requestedUrl = req.url;
	var splitRquest = requestedUrl.split('/');
	var drummachine = splitRquest[2];
	res.setHeader("Content-Type", "text/html");
 	res.setHeader("Access-Control-Allow-Origin", "*");
 	res.statusCode = 200;
	res.sendFile(path.resolve(__dirname + "/../www/loadsave.html"), function(err) {
		if(err) {
			console.error(err);
		}
		res.end();
	});
	
});

//=======================================================================
//===Inspect GET requests and redirect to local subdomain if applicable==
//===*.tr808.online/ [type=GET]==========================================
server.get("/", function(req, res) {
	var hostname = req.headers.host;
	var subdomain = hostname.split(".")[0];
	if(req.locale==="es" && subdomain!=="es") { //if subdomain is "es", they are already going to the spanish version
		res.redirect("http://es.tr808.online"); //and redirecting them will cause an infinite loop
	} else if(req.locale==="ro" && subdomain!=="ro") {
		res.redirect("http://ro.tr808.online"); 
	} else { //they should get the default file and their path should not be touched
		res.setHeader("Content-Type", "text/html");
		res.setHeader("Access-Control-Allow-Origin", "*");
		res.statusCode = 200;
		res.sendFile(path.resolve(__dirname + "/../www/index.html"), function(err) {
			if(err) {
				console.error(err);
			}
			res.end();
		});
	}
});

//=======================================================================
//===Handle GET requests to load previously saved settings===============
//===*.tr808.online/* [type=GET]=========================================
server.use(express.static(__dirname + "/../www"));

server.listen(80);