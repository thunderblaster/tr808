var masterDrumMachine;

function init() {
	var isDown = false;   // Tracks status of mouse button

	$(document).mousedown(function() {
		isDown = true;      // When mouse goes down, set isDown to true
	}).mouseup(function() {
		isDown = false;    // When mouse goes up, set isDown to false
	});
	$(".beat").next().hover(function(){
		if(isDown) {
			$(this).removeClass("alreadyChanged");
			if(this.previousSibling.checked) {
				$(this).prev().prop("checked", false);
			} else {
				$(this).prev().prop("checked", true);
			}
			$(this).prev().button("refresh");
			$(this).addClass("alreadyChanged");
			setTimeout(function() {
				$(this).removeClass("alreadyChanged");
			}, 1000);
		}
	}, function() {
		var test = $(this).hasClass("alreadyChanged");
		if(!test) {
			if(isDown) {
				if(this.previousSibling.checked) {
					$(this).prev().prop("checked", false);
				} else {
					$(this).prev().prop("checked", true);
				}
				$(this).prev().button("refresh");
			}
		}
		$(this).removeClass("alreadyChanged");
	});
	$("#browser-warning").dialog({
		autoOpen: false,
		modal: true,
		buttons: {
        	Ok: function() {
          		$( this ).dialog( "close" );
        	}
      	}
	});
	
	$("#screen-warning").dialog({
		autoOpen: false,
		modal: true,
		buttons: {
        	Ok: function() {
          		$( this ).dialog( "close" );
        	}
      	}
	});
	
	var ieVersion = detectIE();
	var screenWidth = $(window).width();
	
	if(ieVersion < 12 && ieVersion!==false) {
		$("#browser-warning").dialog("open");
	} else if(screenWidth < 800) {
		$("#screen-warning").dialog("open");
	}
	
	
	$("#tempo").spinner({
		min: 60,
		max: 300
	});
	$("#tempo").spinner("value", 140);
	$(".level-slider").slider({
		min: 0,
		max: 1,
		value: 1,
		step: 0.1
	});
	
	$(".tone-slider").slider({
		min: 0,
		max: 4,
		value: 2
	});
	
	$(".decay-slider").slider({
		min: 0,
		max: 4,
		value: 1
	});

	$(".beat").button();

	$(".social-button").button();
	
	$("#groove").slider({
		min: 1,
		max: 2,
		step: 0.1,
		value: 1
	});
	
	$(".select").selectmenu();

	updateMeasureSelector();
	
	$("#number-of-measures").buttonset();
	
	$( "#play" ).button({
		text: false,
		icons: {
			primary: "ui-icon-play"
		}
    });

	$( "#stop" ).button({
        text: false,
        icons: {
			primary: "ui-icon-stop"
		}
	});
	
	$("#reset").button();
	$("#export-button").button();
	$("#save-button").button();
	
	$('input[type=radio][name=number-of-measures]').change(function() {
		updateMeasureSelector();
    });
	
	$("#measure-selector").selectmenu({
		change: function(event, ui) {
			switchCurrentMeasure(event.target.value);
		}
	});
	
	$('#language').on("selectmenuchange", function() {
		var lang = $(this).val();
		addLabels(lang);
		document.cookie = "language=" + lang;
	});
	
	masterDrumMachine = createDrumMachine();
	
	var tr808 = getCookie("drummachine");
	
	if(tr808) {
		tr808 = JSON.parse(tr808);
		
		masterDrumMachine.bd = tr808.bd;
		masterDrumMachine.sd = tr808.sd;
		masterDrumMachine.lt = tr808.lt;
		masterDrumMachine.mt = tr808.mt;
		masterDrumMachine.ht = tr808.ht;
		masterDrumMachine.rs = tr808.rs;
		masterDrumMachine.cp = tr808.cp;
		masterDrumMachine.cb = tr808.cb;
		masterDrumMachine.cy = tr808.cy;
		masterDrumMachine.oh = tr808.oh;
		masterDrumMachine.ch = tr808.ch;
		
		masterDrumMachine.tempo = tr808.tempo;
		masterDrumMachine.groove = tr808.groove;
		masterDrumMachine.measures = tr808.measures;
		
		setSteps(tr808.bd);
		setSteps(tr808.sd);
		setSteps(tr808.lt);
		setSteps(tr808.mt);
		setSteps(tr808.ht);
		setSteps(tr808.rs);
		setSteps(tr808.cp);
		setSteps(tr808.cb);
		setSteps(tr808.cy);
		setSteps(tr808.oh);
		setSteps(tr808.ch);
		
		setWhich(tr808.lt);
		setWhich(tr808.mt);
		setWhich(tr808.ht);
		setWhich(tr808.cp);
		setWhich(tr808.rs);
		
		$("#bd-level").slider("value", tr808.bd.level);
		$("#sd-level").slider("value", tr808.sd.level);
		$("#lt-level").slider("value", tr808.lt.level);
		$("#mt-level").slider("value", tr808.mt.level);
		$("#ht-level").slider("value", tr808.ht.level);
		$("#rs-level").slider("value", tr808.rs.level);
		$("#cp-level").slider("value", tr808.cp.level);
		$("#cb-level").slider("value", tr808.cb.level);
		$("#cy-level").slider("value", tr808.cy.level);
		$("#oh-level").slider("value", tr808.oh.level);
		$("#ch-level").slider("value", tr808.ch.level);
		
		$("#bd-tone").slider("value", tr808.bd.tone);
		$("#sd-tone").slider("value", tr808.sd.tone);
		$("#lt-tone").slider("value", tr808.lt.tone);
		$("#mt-tone").slider("value", tr808.mt.tone);
		$("#ht-tone").slider("value", tr808.ht.tone);
		$("#cy-tone").slider("value", tr808.cy.tone);

		$("#bd-decay").slider("value", tr808.bd.decay);
		$("#sd-decay").slider("value", tr808.sd.decay);
		$("#cy-decay").slider("value", tr808.cy.decay);
		$("#oh-decay").slider("value", tr808.oh.decay);
		
		$("#tempo").spinner("value", tr808.tempo);
		
		$("#groove").slider("value", tr808.groove);
		
		$("#number-of-measures :radio[value=" + tr808.measures + "]").prop("checked", true).trigger("click");
		$("#number-of-measures").buttonset("refresh");
		
		$(".beat").button("refresh");
		
		console.log(tr808);
	}
	
	
	
	var savedLanguage = getCookie("language");
	if(savedLanguage) {
		console.log("Loaded language from cookie!");
		$("#language").val(savedLanguage);
		$("#language").selectmenu("refresh");
		addLabels(savedLanguage);
	}
	
	var currentURL = window.location.href;
	var piecesOfURL = currentURL.split(".");
	// /https?:\/\/(.+)/
	var language = /https?:\/\/(.+)/i.exec(piecesOfURL[0]);
	language = language[1];
	if(language) {
		language = language.toLowerCase();
	}	
	if(language==="es") {
		$("#language").val("es");
		$("#language").selectmenu("refresh");
		addLabels("es");
	}
	if(language==="ro") {
		$("#language").val("ro");
		$("#language").selectmenu("refresh");
		addLabels("ro");
	}
	
	
	
}

function setSteps (ins) {
	var currentMeasure = Number($("#measure-header").html());
	var stepOffset = (currentMeasure - 1) * 16;
	for(i=1; i<=16; i++) {
		if(ins.steps[i + stepOffset]!==undefined && ins.steps[i + stepOffset]!==null) {
			document.getElementById(ins.name + i).checked = ins.steps[i + stepOffset];
		} else {
			document.getElementById(ins.name + i).checked = false;
			masterDrumMachine[ins.name].steps[i+stepOffset] = false;
		}
	}
	$(".beat").button("refresh");
}
	
function setWhich (ins) {
	document.getElementById(ins.name + "-which").value = ins.which;
}
	
function getCookie(cname) { //from http://www.w3schools.com/js/js_cookies.asp
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length,c.length);
        }
    }
    return "";
} 

function resetAll() {
	$(".level-slider").slider("value", 1);
	$(".tone-slider").slider("value", 2);
	$(".decay-slider").slider("value", 1);
	$("#groove").slider("value", 1);
	$("#tempo").spinner("value", 140);
	
	$(".beat").prop("checked",false);

	masterDrumMachine = createDrumMachine();
	
	$(".beat").button("refresh");
}

function detectIE() {
    var ua = window.navigator.userAgent;

    var msie = ua.indexOf('MSIE ');
    if (msie > 0) {
        // IE 10 or older => return version number
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    var trident = ua.indexOf('Trident/');
    if (trident > 0) {
        // IE 11 => return version number
        var rv = ua.indexOf('rv:');
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    var edge = ua.indexOf('Edge/');
    if (edge > 0) {
       // Edge (IE 12+) => return version number
       return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }

    // other browser
    return false;
}

function addLabels(language) {
	if(language==="en") {
		$("#level-label").html("Level");
		$("#tone-label").html("Tone");
		$("#decay-label").html("Decay");
		$("#bd-label").html("Bass Drum");
		$("#sd-label").html("Snare Drum");
		$("#lt-label").html("Low Tom");
		$("#lc-label").html("Low Conga");
		$("#mt-label").html("Mid Tom");
		$("#mc-label").html("Mid Conga");
		$("#ht-label").html("Hi Tom");
		$("#hc-label").html("Hi Conga");
		$("#rs-label").html("Rimshot");
		$("#cl-label").html("Claves");
		$("#cp-label").html("Handclap");
		$("#ma-label").html("Maracas");
		$("#cb-label").html("Cowbell");
		$("#cy-label").html("Cymbal");
		$("#oh-label").html("Open Hihat");
		$("#ch-label").html("Closed Hihat");
		$("#tempo-label").html("Tempo ");
		$("#reset").html("<span class='ui-button-text'>Reset</span>");
		$("#export-button").html("<span class='ui-button-text'>Export</span");
		$("#save-button").html("<span class='ui-button-text'>Save</span>");
		$("#groove-label").html("Groove ");
		$(".select").selectmenu("refresh");
		$(".lang-button").button("refresh");
		$("#number-of-measures-label").html("Number of measures:");
		$("#current-measure-label").html("Current measure:");
	} else if(language==="es") {
		$("#level-label").html("Fuerza");
		$("#tone-label").html("Tono");
		$("#decay-label").html("Decadencia");
		$("#bd-label").html("Bombo");
		$("#sd-label").html("Caja");
		$("#lt-label").html("Tantán Bajo");
		$("#lc-label").html("Conga Baja");
		$("#mt-label").html("Tantán Medio");
		$("#mc-label").html("Conga Media");
		$("#ht-label").html("Tartán Alto");
		$("#hc-label").html("Conga Alta");
		$("#rs-label").html("Rimshot");
		$("#cl-label").html("Claves");
		$("#cp-label").html("Palmada");
		$("#ma-label").html("Maracas");
		$("#cb-label").html("Cencerro");
		$("#cy-label").html("Címbalo");
		$("#oh-label").html("Hihat Abierto");
		$("#ch-label").html("Hihat Cerrado");
		$("#tempo-label").html("Tempo ");
		$("#reset").html("<span class='ui-button-text'>Reinciar</span>");
		$("#export-button").html("<span class='ui-button-text'>Exportar</span>");
		$("#save-button").html("<span class='ui-button-text'>Guarder</span>");
		$("#groove-label").html("Ritmo ");
		$(".select").selectmenu("refresh");
		$(".lang-button").button("refresh");
		$("#number-of-measures-label").html("Número de medidas:");
		$("#current-measure-label").html("Medida actual:");
	} else if(language==="ro") {
		$("#level-label").html("Nivel");
		$("#tone-label").html("Ton");
		$("#decay-label").html("Decadență");
		$("#bd-label").html("Tobă Bas");
		$("#sd-label").html("Tambur Cursă");
		$("#lt-label").html("Tom Redus");
		$("#lc-label").html("Conga Redus");
		$("#mt-label").html("Tom Mijlociu");
		$("#mc-label").html("Conga Mijlociu");
		$("#ht-label").html("Tom Mare");
		$("#hc-label").html("Conga Mare");
		$("#rs-label").html("Rimșot");
		$("#cl-label").html("Claves");
		$("#cp-label").html("Bate Din Palme");
		$("#ma-label").html("Maracasuri");
		$("#cb-label").html("Cowbell");
		$("#cy-label").html("Cinel");
		$("#oh-label").html("Hihat Deschis");
		$("#ch-label").html("Hihat Închis");
		$("#tempo-label").html("Tempo ");
		$("#reset").html("<span class='ui-button-text'>Potrivire</span>");
		$("#export-button").html("<span class='ui-button-text'>Transfer</span");
		$("#save-button").html("<span class='ui-button-text'>Salva</span>");
		$("#groove-label").html("Ritm ");
		$(".select").selectmenu("refresh");
		$(".lang-button").button("refresh");
		$("#number-of-measures-label").html("Mimăr De Măsuri:");
		$("#current-measure-label").html("Mâsură Curentă:");
	} else {
		console.log("Invalid language selected!");
	}	
}

function updateMeasureSelector() {
	var numberObject = $('input[type=radio][name=number-of-measures]:checked')[0];
	var numberOfMeasures = Number(numberObject.id.substring(numberObject.id.length - 1));
	switch(numberOfMeasures) {
		case 1:
			$('#measure-selector').children('option').each(function() {
				if ( Number($(this).val()) !== 1 ) {
					$(this).remove();
				}
			});
			break;
		case 2:
			$('#measure-selector').children('option').each(function() {
				if ( Number($(this).val()) > 2 ) {
					$(this).remove();
				}
			});
			var optionTwoMeasuresExists = ($('#measure-selector').children("option[value='2']").length > 0);
			if(!optionTwoMeasuresExists) {
				$("#measure-selector").append("<option value='2'>2</option>");
			}
			break;
		case 4:
			var optionTwoMeasuresExists = ($('#measure-selector').children("option[value='2']").length > 0);
			if(!optionTwoMeasuresExists) {
				$("#measure-selector").append("<option value='2'>2</option>");
			}
			var optionThreeMeasuresExists = ($('#measure-selector').children("option[value='3']").length > 0);
			if(!optionThreeMeasuresExists) {
				$("#measure-selector").append("<option value='3'>3</option>");
			}
			var optionFourMeasuresExists = ($('#measure-selector').children("option[value='4']").length > 0);
			if(!optionFourMeasuresExists) {
				$("#measure-selector").append("<option value='4'>4</option>");
			}
			break;
	}
	$("#measure-selector").selectmenu("refresh");
}