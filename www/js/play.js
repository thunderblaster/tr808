var alreadyPlaying = false;
var stopIt = false;


function drummachine (bd, sd, lt, mt, ht, rs, cp, cb, cy, oh, ch, tempo, groove, measures) {
	this.bd = bd;
	this.sd = sd;
	this.lt = lt;
	this.mt = mt;
	this.ht = ht;
	this.rs = rs;
	this.cp = cp;
	this.cb = cb;
	this.cy = cy;
	this.oh = oh;
	this.ch = ch;
	this.tempo = tempo;
	this.groove = groove;
	this.measures = measures;
}

function instrument (name, steps, level, tone, decay, which, howl) {
	this.name = name; //2 character string stating name of instrument which should be played
	this.steps = steps; //array of 64 elements, each of which is true if the instrument should be played on that step
	this.level = level; //int, 0-4
	this.howl = howl; //howl object
	//if any of the below do not apply, set to false
	this.tone = tone; //int, 0-4
	this.decay = decay; //int, 0-4
	this.which = which; //2 character string stating name of instrument which should be played (used for instruments with selects)
}

function playButtonClicked() {
	console.log(masterDrumMachine);
	if(alreadyPlaying) {
		shutItDown();
	} else {
		startPlaying();
	}
}

function shutItDown() {
	if(alreadyPlaying) {
		stopIt = true;
		alreadyPlaying = false;
	}
}

function formatFilename (prefix, tone, decay) {
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
		return prefix;
	} else if(decay===false) {
		return prefix + tone;
	} else if(tone===false) {
		return prefix + decay;
	} else {
		return prefix + tone + decay;
	}
}

function createDrumMachine() {
	var bd = createInstrument("bd");
	var sd = createInstrument("sd");
	var lt = createInstrument("lt");
	var mt = createInstrument("mt");
	var ht = createInstrument("ht");
	var rs = createInstrument("rs");
	var cp = createInstrument("cp");
	var cb = createInstrument("cb");
	var cy = createInstrument("cy");
	var oh = createInstrument("oh");
	var ch = createInstrument("ch");
	var tempo = $("#tempo").spinner("value");
	var groove = $("#groove").slider("value");
	var measures = $("#number-of-measures :radio:checked").val();
	var tr808 = new drummachine(bd, sd, lt, mt, ht, rs, cp, cb, cy, oh, ch, tempo, groove, measures);
	return tr808;
}
	
function startPlaying() {
	masterDrumMachine = createHowls(masterDrumMachine);
	alreadyPlaying = true;
	updateDrumMachine();
	var stringifiedValueToStore = "drummachine=" + JSON.stringify(masterDrumMachine, function (key, value) {
		if(key=="howl") {
			return undefined;
		}
		return value;
	});	
	document.cookie = stringifiedValueToStore;
	runPattern(1);
}

function runPattern (step) {
	playStep(step); 
	if(step%4===0) {
		updateDrumMachine();
	} 
	scheduleNextStep(step);
}

function createInstrument(ins) {
	var name = ins;
	var steps = [];
	//var currentSteps = getSteps(name);
	for(i=0; i<=48; i++) {
		//console.log(i, steps);
		steps[i] = null;
	}
	var level = getLevel(ins);
	var tone = getTone(ins);
	var decay = getDecay(ins);
	var which = getWhich(ins);
	var completedInstrument = new instrument(name, steps, level, tone, decay, which);
	return completedInstrument;
}

function updateDrumMachine () {
	masterDrumMachine.bd = updateInstrument(masterDrumMachine.bd);
	masterDrumMachine.sd = updateInstrument(masterDrumMachine.sd);
	masterDrumMachine.lt = updateInstrument(masterDrumMachine.lt);
	masterDrumMachine.mt = updateInstrument(masterDrumMachine.mt);
	masterDrumMachine.ht = updateInstrument(masterDrumMachine.ht);
	masterDrumMachine.rs = updateInstrument(masterDrumMachine.rs);
	masterDrumMachine.cp = updateInstrument(masterDrumMachine.cp);
	masterDrumMachine.cb = updateInstrument(masterDrumMachine.cb);
	masterDrumMachine.cy = updateInstrument(masterDrumMachine.cy);
	masterDrumMachine.oh = updateInstrument(masterDrumMachine.oh);
	masterDrumMachine.ch = updateInstrument(masterDrumMachine.ch);
	masterDrumMachine.tempo = $("#tempo").spinner("value");
	masterDrumMachine.groove = $("#groove").slider("value");
	masterDrumMachine.measures = $("#number-of-measures :radio:checked").val();
}

function updateInstrument(ins) {
	var currentSteps = getSteps(ins.name);
	for(i=0; i<currentSteps.length; i++) {
		if(currentSteps[i]!==undefined) {
			ins.steps[i] = currentSteps[i];
		}
	}
	
	ins.level = getLevel(ins.name);
	if(ins.tone!==false) {
		ins.tone = getTone(ins.name);
	}
	if(ins.decay!==false) {
		ins.decay = getDecay(ins.name);
	}
	if(ins.which!==false) {
		ins.which = getWhich(ins.name);
	}
	return ins;
}

function switchCurrentMeasure(measure) {
	updateDrumMachine();
	$("#measure-header").html(measure);
	$("#measure-selector").val(measure).selectmenu("refresh");
	setSteps(masterDrumMachine.bd);
	setSteps(masterDrumMachine.sd);
	setSteps(masterDrumMachine.lt);
	setSteps(masterDrumMachine.mt);
	setSteps(masterDrumMachine.ht);
	setSteps(masterDrumMachine.rs);
	setSteps(masterDrumMachine.cp);
	setSteps(masterDrumMachine.cb);
	setSteps(masterDrumMachine.cy);
	setSteps(masterDrumMachine.oh);
	setSteps(masterDrumMachine.ch);
	$(".beat").button("refresh");
}

function playStep (step) {
	var stepPosition = step;
	if(stepPosition>48) {
		if(stepPosition===49) {
			switchCurrentMeasure("4");
		}
		stepPosition = stepPosition - 48;
	} else if(stepPosition>32) {
		if(stepPosition===33) {
			switchCurrentMeasure("3");
		}
		stepPosition = stepPosition - 32;
	} else if(stepPosition>16) {
		if(stepPosition===17) {
			switchCurrentMeasure("2");
		}
		stepPosition = stepPosition - 16;
	} else {
		if(stepPosition===1) {
			switchCurrentMeasure("1");
		}
	}
	$(".step-label, .table-footer").removeClass("step-highlighted");
	$("#step-label-" + stepPosition + ", #step-footer-" + stepPosition).addClass("step-highlighted");
	if(masterDrumMachine.bd.steps[step]===true) {
		masterDrumMachine.bd.howl.volume(masterDrumMachine.bd.level);
		masterDrumMachine.bd.howl.play(formatFilename(masterDrumMachine.bd.name, masterDrumMachine.bd.tone, masterDrumMachine.bd.decay));
	}
	if(masterDrumMachine.sd.steps[step]===true) {
		masterDrumMachine.sd.howl.volume(masterDrumMachine.sd.level);
		masterDrumMachine.sd.howl.play(formatFilename(masterDrumMachine.sd.name, masterDrumMachine.sd.tone, masterDrumMachine.sd.decay));
	}
	if(masterDrumMachine.lt.steps[step]===true) {
		masterDrumMachine.lt.howl.volume(masterDrumMachine.lt.level);
		masterDrumMachine.lt.howl.play(formatFilename(masterDrumMachine.lt.which, masterDrumMachine.lt.tone, masterDrumMachine.lt.decay));
	}
	if(masterDrumMachine.mt.steps[step]===true) {
		masterDrumMachine.mt.howl.volume(masterDrumMachine.mt.level);
		masterDrumMachine.mt.howl.play(formatFilename(masterDrumMachine.mt.which, masterDrumMachine.mt.tone, masterDrumMachine.mt.decay));
	}
	if(masterDrumMachine.ht.steps[step]===true) {
		masterDrumMachine.ht.howl.volume(masterDrumMachine.ht.level);
		masterDrumMachine.ht.howl.play(formatFilename(masterDrumMachine.ht.which, masterDrumMachine.ht.tone, masterDrumMachine.ht.decay));
	}
	if(masterDrumMachine.rs.steps[step]===true) {
		masterDrumMachine.rs.howl.volume(masterDrumMachine.rs.level);
		masterDrumMachine.rs.howl.play(formatFilename(masterDrumMachine.rs.which, masterDrumMachine.rs.tone, masterDrumMachine.rs.decay));
	}
	if(masterDrumMachine.cp.steps[step]===true) {
		masterDrumMachine.cp.howl.volume(masterDrumMachine.cp.level);
		masterDrumMachine.cp.howl.play(formatFilename(masterDrumMachine.cp.which, masterDrumMachine.cp.tone, masterDrumMachine.cp.decay));
	}
	if(masterDrumMachine.cb.steps[step]===true) {
		masterDrumMachine.cb.howl.volume(masterDrumMachine.cb.level);
		masterDrumMachine.cb.howl.play();
	}
	if(masterDrumMachine.cy.steps[step]===true) {
		masterDrumMachine.cy.howl.volume(masterDrumMachine.cy.level);
		masterDrumMachine.cy.howl.play(formatFilename(masterDrumMachine.cy.name, masterDrumMachine.cy.tone, masterDrumMachine.cy.decay));
	}
	if(masterDrumMachine.oh.steps[step]===true) {
		masterDrumMachine.oh.howl.volume(masterDrumMachine.oh.level);
		masterDrumMachine.oh.howl.play(formatFilename(masterDrumMachine.oh.name, masterDrumMachine.oh.tone, masterDrumMachine.oh.decay));
	}
	if(masterDrumMachine.ch.steps[step]===true) {
		masterDrumMachine.ch.howl.volume(masterDrumMachine.ch.level);
		masterDrumMachine.ch.howl.play();
	}
}

function scheduleNextStep(step) {
	if(!stopIt) {
		var numberOfSteps = Number($("#number-of-measures :radio:checked").val()) * 16;
		if(step===numberOfSteps) {
			step = 0;
		}
		var isTempoValid = $("#tempo").spinner("isValid");
		if(isTempoValid) {
			var beatsPerMinute = $("#tempo").spinner("value");
		} else {
			var beatsPerMinute = 120;
		}
		var secondsPerBeat = 60 / beatsPerMinute;
		var secondsPerStep = secondsPerBeat / 4;
		var millisecondsPerStep = secondsPerStep * 1000;
		var grooveCoefficient = $("#groove").slider("value");
		if((step+2)%4===0) {
			millisecondsPerStep = millisecondsPerStep * grooveCoefficient;
		} else if((step+1)%4===0) {
			millisecondsPerStep = millisecondsPerStep / grooveCoefficient;
		}
		setTimeout(function() {
			runPattern(step + 1)
		}, millisecondsPerStep);
	} else {
		stopIt = false;
		$(".step-label, .table-footer").removeClass("step-highlighted");
	}
}

function getSteps (ins) {
	var steps = [];
	var currentMeasure = Number($("#measure-header").html());
	var stepOffset = (currentMeasure - 1) * 16;
	for(i=1; i<=16; i++) {
		steps[stepOffset+i] = document.getElementById(ins + i).checked;
	}
	return steps;
}


function getLevel (ins) {
	var level = $( "#" + ins + "-level" ).slider( "option", "value" );
	return level;
}

function getTone (ins) {
	if(document.getElementById(ins + "-tone")) {
		var tone = $( "#" + ins + "-tone" ).slider( "option", "value" );
		return tone;
	} else {
		return false;
	}
}

function getDecay (ins) {
	if(document.getElementById(ins + "-decay")) {
		var decay = $( "#" + ins + "-decay" ).slider( "option", "value" );
		return decay;
	} else {
		return false;
	}
}

function getWhich (ins) {
	if(document.getElementById(ins + "-which")) {
		var which = document.getElementById(ins + "-which").value;
		return which;
	} else {
		return false;
	}
}

function createHowls(tr808) {
	tr808.bd.howl = new Howl({
	  "src": [
		"audio/bd/bd.mp3",
		"audio/bd/bd.ogg",
		"audio/bd/bd.m4a",
		"audio/bd/bd.ac3"
	  ],
	  "sprite": {
		"bd0000": [
		  0,
		  250.02267573696147
		],
		"bd0010": [
		  2000,
		  3000.022675736961
		],
		"bd0025": [
		  7000,
		  500.022675736961
		],
		"bd0050": [
		  9000,
		  1500.022675736961
		],
		"bd0075": [
		  12000,
		  2000.022675736961
		],
		"bd1000": [
		  16000,
		  250.02267573696102
		],
		"bd1010": [
		  18000,
		  3000.022675736961
		],
		"bd1025": [
		  23000,
		  500.022675736961
		],
		"bd1050": [
		  25000,
		  1500.022675736961
		],
		"bd1075": [
		  28000,
		  2000.022675736961
		],
		"bd2500": [
		  32000,
		  250
		],
		"bd2510": [
		  34000,
		  3000.0226757369646
		],
		"bd2525": [
		  39000,
		  500.0226757369646
		],
		"bd2550": [
		  41000,
		  1500.0226757369646
		],
		"bd2575": [
		  44000,
		  2000.0226757369646
		],
		"bd5000": [
		  48000,
		  250.02267573696457
		],
		"bd5010": [
		  50000,
		  3000.0226757369646
		],
		"bd5025": [
		  55000,
		  500.0226757369646
		],
		"bd5050": [
		  57000,
		  1500.0226757369646
		],
		"bd5075": [
		  60000,
		  2000.0226757369646
		],
		"bd7500": [
		  64000,
		  250.02267573695747
		],
		"bd7510": [
		  66000,
		  3000.0226757369574
		],
		"bd7525": [
		  71000,
		  500.02267573695747
		],
		"bd7550": [
		  73000,
		  1500.0226757369574
		],
		"bd7575": [
		  76000,
		  2000.0226757369574
		]
	  }
	});
	tr808.cb.howl = new Howl({src: ["audio/cb/cb.wav"]});
	tr808.ch.howl = new Howl({src: ["audio/ch/ch.wav"]});
	tr808.cp.howl = new Howl({
	  "src": [
		"audio/cp/cp.mp3",
		"audio/cp/cp.ogg",
		"audio/cp/cp.m4a",
		"audio/cp/cp.ac3"
	  ],
	  "sprite": {
		"cp": [
		  0,
		  2000.0226757369614
		],
		"ma": [
		  4000,
		  250
		]
	  }
	});
	tr808.cy.howl = new Howl({
	  "src": [
		"audio/cy/cy.mp3",
		"audio/cy/cy.ogg",
		"audio/cy/cy.m4a",
		"audio/cy/cy.ac3"
	  ],
	  "sprite": {
		"cy0000": [
		  0,
		  1500.0226757369614
		],
		"cy0010": [
		  3000,
		  4000.022675736961
		],
		"cy0025": [
		  9000,
		  2000.022675736961
		],
		"cy0050": [
		  13000,
		  2500.022675736961
		],
		"cy0075": [
		  17000,
		  3500.022675736961
		],
		"cy1000": [
		  22000,
		  1500.022675736961
		],
		"cy1010": [
		  25000,
		  4000.022675736961
		],
		"cy1025": [
		  31000,
		  2000.0226757369646
		],
		"cy1050": [
		  35000,
		  2500.0226757369646
		],
		"cy1075": [
		  39000,
		  3500.0226757369646
		],
		"cy2500": [
		  44000,
		  1500.0226757369646
		],
		"cy2510": [
		  47000,
		  4000.0226757369574
		],
		"cy2525": [
		  53000,
		  2000.0226757369646
		],
		"cy2550": [
		  57000,
		  2500.0226757369646
		],
		"cy2575": [
		  61000,
		  3500.0226757369574
		],
		"cy5000": [
		  66000,
		  1500.0226757369574
		],
		"cy5010": [
		  69000,
		  4000.0226757369574
		],
		"cy5025": [
		  75000,
		  2000.0226757369574
		],
		"cy5050": [
		  79000,
		  2500.0226757369574
		],
		"cy5075": [
		  83000,
		  3500.0226757369574
		],
		"cy7500": [
		  88000,
		  1500.0226757369574
		],
		"cy7510": [
		  91000,
		  4000.0226757369574
		],
		"cy7525": [
		  97000,
		  2000.0226757369574
		],
		"cy7550": [
		  101000,
		  2500.0226757369574
		],
		"cy7575": [
		  105000,
		  3500.0226757369574
		]
	  }
	});
	tr808.ht.howl = new Howl({
	  "src": [
		"audio/ht/ht.mp3",
		"audio/ht/ht.ogg",
		"audio/ht/ht.m4a",
		"audio/ht/ht.ac3"
	  ],
	  "sprite": {
		"hc00": [
		  0,
		  500.02267573696145
		],
		"hc10": [
		  2000,
		  500.02267573696145
		],
		"hc25": [
		  4000,
		  500.022675736961
		],
		"hc50": [
		  6000,
		  500.022675736961
		],
		"hc75": [
		  8000,
		  500.022675736961
		],
		"ht00": [
		  10000,
		  1000.022675736961
		],
		"ht10": [
		  13000,
		  1000.022675736961
		],
		"ht25": [
		  16000,
		  1000.022675736961
		],
		"ht50": [
		  19000,
		  1000.022675736961
		],
		"ht75": [
		  22000,
		  1000.022675736961
		]
	  }
	});
	tr808.lt.howl = new Howl({
	  "src": [
		"audio/lt/lt.mp3",
		"audio/lt/lt.ogg",
		"audio/lt/lt.m4a",
		"audio/lt/lt.ac3"
	  ],
	  "sprite": {
		"lc00": [
		  0,
		  500.02267573696145
		],
		"lc10": [
		  2000,
		  500.02267573696145
		],
		"lc25": [
		  4000,
		  500.022675736961
		],
		"lc50": [
		  6000,
		  500.022675736961
		],
		"lc75": [
		  8000,
		  500.022675736961
		],
		"lt00": [
		  10000,
		  1000.022675736961
		],
		"lt10": [
		  13000,
		  1000.022675736961
		],
		"lt25": [
		  16000,
		  1000.022675736961
		],
		"lt50": [
		  19000,
		  1000.022675736961
		],
		"lt75": [
		  22000,
		  1000.022675736961
		]
	  }
	});
	tr808.mt.howl = new Howl({
	  "src": [
		"audio/mt/mt.mp3",
		"audio/mt/mt.ogg",
		"audio/mt/mt.m4a",
		"audio/mt/mt.ac3"
	  ],
	  "sprite": {
		"mc00": [
		  0,
		  0
		],
		"mc10": [
		  1000,
		  500.02267573696145
		],
		"mc25": [
		  3000,
		  500.02267573696145
		],
		"mc50": [
		  5000,
		  500.022675736961
		],
		"mc75": [
		  7000,
		  500.022675736961
		],
		"mt00": [
		  9000,
		  1000.022675736961
		],
		"mt10": [
		  12000,
		  1000.022675736961
		],
		"mt25": [
		  15000,
		  1000.022675736961
		],
		"mt50": [
		  18000,
		  1000.022675736961
		],
		"mt75": [
		  21000,
		  1000.022675736961
		]
	  }
	});
	tr808.oh.howl = new Howl({
	  "src": [
		"audio/oh/oh.mp3",
		"audio/oh/oh.ogg",
		"audio/oh/oh.m4a",
		"audio/oh/oh.ac3"
	  ],
	  "sprite": {
		"oh00": [
		  0,
		  250.02267573696147
		],
		"oh10": [
		  2000,
		  750.0226757369614
		],
		"oh25": [
		  4000,
		  250.02267573696102
		],
		"oh50": [
		  6000,
		  500.022675736961
		],
		"oh75": [
		  8000,
		  750.022675736961
		]
	  }
	});
	tr808.rs.howl = new Howl({
	  "src": [
		"audio/rs/rs.mp3",
		"audio/rs/rs.ogg",
		"audio/rs/rs.m4a",
		"audio/rs/rs.ac3"
	  ],
	  "sprite": {
		"cl": [
		  0,
		  250
		],
		"rs": [
		  2000,
		  250.02267573696147
		]
	  }
	});
	tr808.sd.howl = new Howl({
	  "src": [
		"audio/sd/sd.mp3",
		"audio/sd/sd.ogg",
		"audio/sd/sd.m4a",
		"audio/sd/sd.ac3"
	  ],
	  "sprite": {
		"sd0000": [
		  0,
		  250
		],
		"sd0010": [
		  2000,
		  500.02267573696145
		],
		"sd0025": [
		  4000,
		  250.02267573696102
		],
		"sd0050": [
		  6000,
		  500.022675736961
		],
		"sd0075": [
		  8000,
		  500.022675736961
		],
		"sd1000": [
		  10000,
		  250
		],
		"sd1010": [
		  12000,
		  500.022675736961
		],
		"sd1025": [
		  14000,
		  250
		],
		"sd1050": [
		  16000,
		  500.022675736961
		],
		"sd1075": [
		  18000,
		  500.022675736961
		],
		"sd2500": [
		  20000,
		  250.02267573696102
		],
		"sd2510": [
		  22000,
		  500.022675736961
		],
		"sd2525": [
		  24000,
		  250.02267573696102
		],
		"sd2550": [
		  26000,
		  500.022675736961
		],
		"sd2575": [
		  28000,
		  500.022675736961
		],
		"sd5000": [
		  30000,
		  250.02267573696102
		],
		"sd5010": [
		  32000,
		  500.0226757369646
		],
		"sd5025": [
		  34000,
		  250.02267573696457
		],
		"sd5050": [
		  36000,
		  500.0226757369646
		],
		"sd5075": [
		  38000,
		  500.0226757369646
		],
		"sd7500": [
		  40000,
		  250.02267573696457
		],
		"sd7510": [
		  42000,
		  500.0226757369646
		],
		"sd7525": [
		  44000,
		  250
		],
		"sd7550": [
		  46000,
		  500.0226757369646
		],
		"sd7575": [
		  48000,
		  500.0226757369646
		]
	  }
	});
	return tr808;
}

function exportDrumMachine() {
	updateDrumMachine();
	var stringifiedValueToStore = JSON.stringify(masterDrumMachine, function (key, value) {
		if(key=="howl") {
			return undefined;
		}
		return value;
	});	

	var xhr = new XMLHttpRequest(); //$.ajax doesn't handle binary files well, so we MUST use native JS :(
	xhr.open('POST', '/export', true); //http://stackoverflow.com/questions/29393601/downloading-file-from-ajax-result-using-blob
	xhr.responseType = 'blob';
	xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
	xhr.onload = function(e) {
		if (this.status == 200) {
			console.log(this.response.size);
			if(this.response.size!=0) {
				var blob = new Blob([this.response], {type: 'audio/mpeg'});
				saveAs(blob, "808beat.mp3");
			} else {
				alert('Unable to download mp3.')
			}
		} else {
			alert('Unable to download mp3.')
		}
	};
	xhr.send(stringifiedValueToStore);
	
	

}

function saveDrumMachine() {
	updateDrumMachine();
	var stringifiedValueToStore = JSON.stringify(masterDrumMachine, function (key, value) {
		if(key=="howl") {
			return undefined;
		}
		return value;
	});	
	document.cookie = "drummachine=" + stringifiedValueToStore;
	
	var savePost = $.ajax({
		data: stringifiedValueToStore,
		method: "POST",
		url: "http://tr808.online/save",
		crossDomain: true
	}).success(function (data) {
	console.log(data);
	history.pushState({}, null, "/save/" + data);
});
}
function twitterButtonClick() {
	var twitterWindow = window.open('', '_blank');
	updateDrumMachine();
	var stringifiedValueToStore = JSON.stringify(masterDrumMachine, function (key, value) {
		if(key=="howl") {
			return undefined;
		}
		return value;
	});	
	document.cookie = "drummachine=" + stringifiedValueToStore;
	
	var savePost = $.ajax({
		data: stringifiedValueToStore,
		method: "POST",
		url: "http://tr808.online/save",
		crossDomain: true
	}).success(function (data) {
	console.log(data);
	history.pushState({}, null, "/save/" + data);
	var saveURL = "http://tr808.online/save/" + data;
    twitterWindow.location = ("https://twitter.com/share?text=Check%20my%20beat&url=" + saveURL);
});
}
function fbButtonClick() {
	var twitterWindow = window.open('', '_blank');
	updateDrumMachine();
	var stringifiedValueToStore = JSON.stringify(masterDrumMachine, function (key, value) {
		if(key=="howl") {
			return undefined;
		}
		return value;
	});	
	document.cookie = "drummachine=" + stringifiedValueToStore;
	
	var savePost = $.ajax({
		data: stringifiedValueToStore,
		method: "POST",
		url: "http://tr808.online/save",
		crossDomain: true
	}).success(function (data) {
	console.log(data);
	history.pushState({}, null, "/save/" + data);
	var saveURL = "http://tr808.online/save/" + data;
    twitterWindow.location = ("http://www.facebook.com/sharer/sharer.php?u=" + saveURL + "&title=Check%20this%20beat!");
});
}