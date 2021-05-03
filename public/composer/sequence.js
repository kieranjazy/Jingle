/*
 * Sequence.js
 * Version 1.1
 * Created by Daniel Hannon (danielh2942)
 * For use in conjunction with composer.js
 *
 * Basically, it's a wrapper for the actual track sequencer to save writing boilerplate
 */

function Sequence() {
	//Sequence Data is gonna be stored as a dictionary
	this.sequenceData = {};
	this.sequenceLength = 0;
	this.maxLengthLocked = false;
	console.log("Sequencer Object Created");
}

Sequence.prototype.toggleLockLength = function() {
	//Invert the value :) - this is done to restrict length, if needs be :)
	this.maxLengthLocked ^= true;
};

Sequence.prototype.addData = function(timeSteps, instrument, note ,flag) {
	if(timeSteps > this.sequenceLength && this.maxLengthLocked) {
		console.log("Cannot add data because the sequence length is locked!");
		return 0;
	}
	if(timeSteps >= 0) {
		if(typeof(this.sequenceData[timeSteps]) == "undefined") {
			this.sequenceData[timeSteps] = new Array();
		} else if(this.sequenceData[timeSteps].indexOf([instrument,note,flag]) != -1) {
			console.log("Already Exists at this position!\n"+timeSteps+": ["+instrument+","+note+","+flag+"]");
			return 0;
		}
		if(typeof(note) == "undefined") {
			console.log("Undefined Note");
			return 0;
		}
		this.sequenceData[timeSteps].push([instrument, note, flag]);
		//console.log("Data Inserted! "+timeSteps+": ["+instrument+","+note+","+flag+"]");
		if(timeSteps > this.sequenceLength) {
			this.sequenceLength = timeSteps + 1;
		}
		return 1;
	}
	return 0;
};

Sequence.prototype.removeData = function(timeSteps, instrument, note, flag) {
	if(typeof(this.sequenceData[timeSteps]) == "undefined") {
		//console.log("Nothing Performed ["+instrument+","+note+","+flag"] at "+timeSteps);
		return 0;
	}
	this.sequenceData[timeSteps].splice(this.sequenceData[timeSteps].indexOf([instrument, note, flag]),1);
	console.log("Operation performed!");
	return 1;
};

Sequence.prototype.getData = function(timeSteps) {
	if(typeof(this.sequenceData[timeSteps]) == "undefined") {
		return [];
	} else {
		console.log("Sequence Position :" + timeSteps + " " + this.sequenceData[timeSteps]);
		return this.sequenceData[timeSteps];
	}
};

Sequence.prototype.getLength = function() {
	return this.sequenceLength;
};

Sequence.prototype.setLength = function(val) {
	if(typeof(val) == "number") {
		if(this.sequenceLength > val) {
			for(let i = val; i < this.sequenceLength; i++) {
				if(typeof(this.sequenceData[i])!="undefined") {
					this.sequenceData[i] = [];
				}
			}
		}
		this.sequenceLength = val;
		return 1;
	} else {
		console.log("Failed!");
		return 0;
	}
};

Sequence.prototype.removeInstrument = function(instrument) {
	for(let key in this.sequenceData) {
		for(let i = 0; i < this.sequenceData[key].length; i++) {
			if(this.sequenceData[key][i][0] == instrument) {
				this.sequenceData[key].splice(i,1);
				i--;
				if(this.sequenceData[key].length == 0) {
					delete this.sequenceData[key];
					break;
				}
				continue;
			}
		}
	}
	console.log("Data Purged!");
};

Sequence.prototype.getTrackData = function() {
	//Create Object and Return it as a String
	let sequenceDump = {sequenceData:this.sequenceData, sequenceLength: this.sequenceLength};
	return JSON.stringify(sequenceDump);
}

Sequence.prototype.loadTrackData = function(dataString) {
	//Parse the String and then insert the data into the object
	let data = JSON.parse(dataString);
	if(typeof(data.sequenceData)!="undefined") {
		this.sequenceData = data.sequenceData;
	}
	if(typeof(data.sequenceLength)!="undefined") {
		this.sequenceLength = data.sequenceLength;
	}
}

Sequence.prototype.loadDummyData = function() {
	//this.sequenceData = {"0":[[0,60,1]],"26":[[0,60,0]],"36":[[0,60,1]],"64":[[0,60,0]],"76":[[0,67,1]],"97":[[0,67,0]],"113":[[0,67,1]],"136":[[0,67,0]],"172":[[0,69,1]],"188":[[0,69,0]],"207":[[0,69,1]],"223":[[0,69,0]],"239":[[0,67,1]],"281":[[0,67,0]],"294":[[0,65,1]],"310":[[0,65,0]],"327":[[0,65,1]],"342":[[0,65,0]],"357":[[0,64,1]],"378":[[0,64,0]],"390":[[0,64,1]],"411":[[0,64,0]],"420":[[0,62,1]],"438":[[0,62,0]],"448":[[0,62,1]],"468":[[0,62,0]],"477":[[0,60,1]],"496":[[0,60,0]]};
	//this.sequenceLength = 960;

	//this.sequenceData = {"0":[[1,61,1]],"32":[[1,62,1]]};
	//this.sequenceLength = 64;

	//this.sequenceData = {"11":[[1,60,1]],"14":[[1,60,0]],"19":[[1,60,1]],"21":[[1,60,0]],"27":[[1,64,1]],"29":[[1,64,0]],"35":[[1,60,1]],"38":[[1,60,0]],"42":[[1,60,1]],"45":[[1,60,0]],"51":[[1,60,1]],"54":[[1,60,0]],"60":[[1,64,1]],"63":[[1,64,0]],"68":[[1,60,1]],"71":[[1,60,0]],"76":[[1,60,1]],"79":[[1,60,0]],"84":[[1,60,1]],"86":[[1,60,0]],"92":[[1,64,1]],"94":[[1,64,0]],"99":[[1,60,1]],"102":[[1,60,0]],"107":[[1,60,1]],"109":[[1,60,0]],"114":[[1,60,1]],"117":[[1,60,0]],"122":[[1,64,1]],"125":[[1,64,0]],"130":[[1,60,1]],"132":[[1,60,0]],"137":[[1,60,1]],"140":[[1,60,0]],"145":[[1,60,1]],"148":[[1,60,0]],"153":[[1,64,1]],"156":[[1,64,0]],"161":[[1,60,1]],"164":[[1,60,0]],"168":[[1,60,1]],"171":[[1,60,0]],"175":[[1,60,1]],"178":[[1,60,0]],"184":[[1,64,1]],"187":[[1,64,0]],"192":[[1,60,1]],"196":[[1,60,0]],"200":[[1,60,1]],"203":[[1,60,0]],"207":[[1,60,1]],"211":[[1,60,0]],"216":[[1,64,1]],"219":[[1,64,0]],"223":[[1,60,1]],"226":[[1,60,0]],"231":[[1,60,1]],"233":[[1,60,0]],"238":[[1,60,1]],"242":[[1,60,0]],"247":[[1,64,1]],"250":[[1,64,0]],"256":[[1,60,1]],"260":[[1,60,0]],"265":[[1,60,1]],"268":[[1,60,0]],"272":[[1,60,1]],"276":[[1,60,0]],"281":[[1,64,1]],"283":[[1,64,0]],"287":[[1,60,1]],"290":[[1,60,0]],"294":[[1,60,1]],"298":[[1,60,0]],"302":[[1,60,1]],"305":[[1,60,0]],"311":[[1,64,1]],"313":[[1,64,0]],"317":[[1,60,1]],"320":[[1,60,0]],"324":[[1,60,1]],"327":[[1,60,0]],"332":[[1,60,1]],"335":[[1,60,0]],"339":[[1,64,1]],"342":[[1,64,0]],"346":[[1,60,1]],"349":[[1,60,0]],"353":[[1,60,1]],"356":[[1,60,0]],"361":[[1,60,1]],"365":[[1,60,0]],"369":[[1,64,1]],"371":[[1,64,0]],"375":[[1,60,1]],"378":[[1,60,0]],"383":[[1,60,1]],"386":[[1,60,0]],"390":[[1,60,1]],"393":[[1,60,0]],"398":[[1,64,1]],"401":[[1,64,0]],"405":[[1,60,1]],"408":[[1,60,0]],"413":[[1,60,1]],"415":[[1,60,0]],"420":[[1,60,1]],"423":[[1,60,0]],"427":[[1,64,1]],"429":[[1,64,0]],"434":[[1,60,1]],"437":[[1,60,0]],"442":[[1,60,1]],"445":[[1,60,0]],"449":[[1,60,1]],"453":[[1,60,0]],"457":[[1,64,1]],"459":[[1,64,0]],"463":[[1,60,1]],"466":[[1,60,0]],"471":[[1,60,1]],"474":[[1,60,0]],"478":[[1,60,1]],"482":[[1,60,0]],"486":[[1,64,1]],"489":[[1,64,0]],"494":[[1,60,1]],"497":[[1,60,0]],"501":[[1,60,1]],"505":[[1,60,0]],"509":[[1,60,1]],"512":[[1,60,0]],"519":[[1,64,1]],"522":[[1,64,0]],"526":[[1,60,1]],"529":[[1,60,0]],"534":[[1,60,1]],"537":[[1,60,0]],"541":[[1,60,1]],"544":[[1,60,0]],"550":[[1,64,1]],"553":[[1,64,0]],"557":[[1,60,1]],"560":[[1,60,0]],"565":[[1,60,1]],"568":[[1,60,0]],"573":[[1,60,1]],"575":[[1,60,0]],"580":[[1,64,1]],"582":[[1,64,0]],"594":[[1,60,1]],"599":[[1,60,0]],"602":[[1,60,1]],"605":[[1,60,0]],"609":[[1,60,1]],"612":[[1,60,0]],"613":[[1,64,1]],"616":[[1,64,0]],"624":[[1,60,1]],"627":[[1,60,0]],"631":[[1,60,1]],"634":[[1,60,0]],"639":[[1,60,1]],"641":[[1,60,0]],"642":[[1,64,1]],"646":[[1,64,0]],"655":[[1,60,1]],"660":[[1,60,0]],"664":[[1,60,1]],"666":[[1,60,0]],"672":[[1,64,1]],"675":[[1,64,0]],"680":[[1,60,1]],"682":[[1,60,0]],"687":[[1,60,1]],"690":[[1,60,0]],"694":[[1,60,1]],"698":[[1,60,0]],"703":[[1,64,1]],"706":[[1,64,0]],"710":[[1,60,1]],"713":[[1,60,0]],"718":[[1,60,1]],"721":[[1,60,0]],"725":[[1,60,1]],"729":[[1,60,0]],"733":[[1,64,1]],"736":[[1,64,0]],"740":[[1,60,1]],"743":[[1,60,0]],"748":[[1,60,1]],"751":[[1,60,0]],"755":[[1,60,1]],"758":[[1,60,0]],"762":[[1,64,1]],"765":[[1,64,0]],"769":[[1,60,1]],"772":[[1,60,0]],"777":[[1,60,1]],"780":[[1,60,0]],"784":[[1,60,1]],"789":[[1,60,0]],"792":[[1,64,1]],"795":[[1,64,0]]};
	//this.sequenceLength=900;
	this.sequenceData = {"3":[[0,64,1]],"5":[[0,67,1],[0,60,1]],"16":[[1,62,1]],"18":[[1,62,0]],"22":[[1,62,1]],"25":[[1,62,0]],"29":[[1,63,1]],"31":[[1,63,0]],"36":[[1,62,1]],"38":[[1,62,0]],"42":[[1,62,1]],"44":[[1,62,0]],"45":[[0,70,1]],"49":[[1,62,1]],"51":[[1,62,0]],"58":[[1,63,1]],"60":[[1,63,0]],"67":[[1,62,1]],"70":[[1,62,0]],"73":[[1,62,1]],"75":[[1,62,0]],"81":[[1,63,1]],"83":[[1,63,0]],"87":[[1,62,1]],"89":[[0,70,0]],"90":[[1,62,0]],"94":[[1,62,1]],"97":[[1,62,0]],"100":[[1,62,1]],"101":[[1,62,0]],"106":[[1,63,1]],"108":[[1,63,0]],"110":[[0,70,1]],"114":[[1,62,1]],"117":[[1,62,0]],"120":[[1,62,1]],"122":[[1,62,0]],"127":[[1,62,1]],"128":[[1,62,0]],"133":[[1,63,1]],"135":[[1,63,0]],"139":[[1,62,1]],"141":[[1,62,0]],"146":[[1,62,1]],"147":[[1,62,0]],"150":[[1,62,1]],"154":[[1,62,0]],"157":[[1,63,1]],"159":[[1,63,0]],"164":[[1,62,1]],"166":[[0,68,1],[1,62,0]],"167":[[0,70,0]],"170":[[1,62,1]],"172":[[1,62,0]],"178":[[1,62,1]],"180":[[1,62,0]],"183":[[1,62,1]],"186":[[1,62,0]],"189":[[1,63,1]],"192":[[1,63,0]],"196":[[1,62,1]],"198":[[1,62,0]],"202":[[1,62,1]],"204":[[1,62,0]],"208":[[0,70,1]],"209":[[1,62,1]],"211":[[1,62,0]],"216":[[1,63,1]],"219":[[1,63,0]],"222":[[1,62,1]],"224":[[1,62,0]],"228":[[1,62,1]],"230":[[1,62,0]],"233":[[1,62,1]],"236":[[1,62,0]],"238":[[1,63,1]],"241":[[1,63,0]],"244":[[1,62,1]],"246":[[1,62,0]],"250":[[1,62,1]],"252":[[1,62,0]],"254":[[1,62,1]],"255":[[1,62,0]],"259":[[1,63,1]],"261":[[1,63,0]],"264":[[1,62,1]],"266":[[1,62,0]],"271":[[1,62,1]],"272":[[1,62,0]],"275":[[1,62,1]],"276":[[1,62,0]],"282":[[1,63,1]],"285":[[1,63,0]],"288":[[1,62,1]],"290":[[1,62,0]],"294":[[1,62,1]],"296":[[1,62,0]],"299":[[1,62,1]],"302":[[1,62,0]],"304":[[1,63,1]],"307":[[0,71,1],[0,68,0],[0,70,0],[1,63,0]],"310":[[1,62,1]],"313":[[1,62,0]],"316":[[1,62,1]],"320":[[1,62,0]],"322":[[1,64,1]],"325":[[1,64,0]],"328":[[1,62,1]],"330":[[1,62,0]],"334":[[1,62,1]],"337":[[1,62,0]],"340":[[1,62,1]],"343":[[1,62,0]],"346":[[1,64,1]],"347":[[1,64,0]],"350":[[1,62,1]],"353":[[1,62,0]],"356":[[1,62,1]],"359":[[1,62,0]],"363":[[1,62,1]],"365":[[1,62,0]],"368":[[1,64,1]],"371":[[1,64,0]],"374":[[1,62,1]],"376":[[1,62,0]],"381":[[1,62,1]],"384":[[1,62,0]],"387":[[1,62,1]],"390":[[1,62,0]],"392":[[1,64,1]],"394":[[1,64,0]],"397":[[1,62,1]],"400":[[1,62,0]],"403":[[1,62,1]],"406":[[1,62,0]],"408":[[0,71,0]],"409":[[1,62,1]],"413":[[1,62,0]],"416":[[1,65,1]],"418":[[1,65,0]],"420":[[1,62,1]],"422":[[1,62,0]],"426":[[1,62,1]],"429":[[1,62,0]],"431":[[1,65,1]],"432":[[1,65,0]],"434":[[1,62,1]],"437":[[1,62,0]],"447":[[1,62,1]],"450":[[1,62,0]],"454":[[0,71,1],[1,62,1]],"456":[[1,62,0]],"461":[[1,65,1]],"463":[[1,65,0]],"466":[[1,62,1]],"469":[[1,62,0]],"473":[[1,62,1]],"475":[[1,62,0]],"478":[[1,62,1]],"480":[[1,62,0]],"482":[[1,62,1]],"484":[[1,62,0]],"493":[[1,65,1]],"496":[[1,65,0]],"514":[[1,62,1]],"517":[[1,62,0]],"522":[[1,62,1]],"524":[[1,62,0]],"529":[[1,65,1]],"532":[[1,65,0]],"537":[[1,62,1]],"539":[[1,62,0]],"542":[[1,62,1]],"544":[[1,62,0]],"551":[[1,62,1]],"553":[[1,62,0]],"555":[[1,62,1]],"557":[[1,62,0]],"562":[[1,65,1]],"564":[[1,65,0]],"575":[[0,71,0]],"576":[[1,62,1]],"578":[[0,71,1],[1,62,0]],"581":[[0,71,0]],"583":[[1,62,1]],"586":[[1,62,0]],"591":[[1,65,1]],"594":[[1,65,0]],"600":[[1,62,1]],"601":[[1,62,0]],"604":[[1,62,1]],"607":[[1,62,0]],"613":[[1,62,1]],"614":[[1,62,0]],"617":[[1,62,1]],"620":[[1,62,0]],"625":[[1,65,1]],"627":[[1,65,0]],"636":[[0,70,1]],"639":[[1,62,1]],"642":[[1,62,0]],"646":[[1,62,1]],"649":[[1,62,0]],"654":[[1,65,1]],"657":[[1,65,0]],"662":[[1,62,1]],"665":[[1,62,0]],"668":[[1,62,1]],"670":[[1,62,0]],"675":[[1,62,1]],"678":[[1,62,0]],"680":[[1,62,1]],"684":[[0,70,0],[1,62,0]],"687":[[1,65,1]],"690":[[1,65,0]],"701":[[1,62,1]],"704":[[1,62,0]],"706":[[0,71,1]],"707":[[1,62,1]],"711":[[1,62,0]],"714":[[1,67,1]],"717":[[1,67,0]],"720":[[1,62,1]],"723":[[1,62,0]],"725":[[1,62,1]],"728":[[1,62,0]],"733":[[1,62,1]],"736":[[1,62,0]],"739":[[1,62,1]],"742":[[1,62,0]],"747":[[1,67,1]],"750":[[0,71,0],[1,67,0]],"760":[[1,62,1]],"763":[[1,62,0]],"766":[[1,62,1]],"769":[[1,62,0]],"772":[[0,69,1]],"774":[[1,67,1]],"776":[[1,67,0]],"781":[[1,62,1]],"783":[[1,62,0]],"787":[[1,62,1]],"790":[[1,62,0]],"796":[[1,62,1]],"798":[[1,62,0]],"801":[[1,62,1]],"804":[[1,62,0]],"808":[[1,67,1]],"810":[[1,67,0]],"815":[[1,62,1]],"817":[[1,62,0]],"821":[[1,62,1]],"824":[[1,62,0]],"828":[[1,62,1]],"831":[[1,62,0]],"834":[[1,62,1]],"837":[[1,62,0]],"843":[[1,62,1]],"846":[[1,62,0]],"850":[[1,62,1]],"853":[[1,62,0]],"858":[[1,66,1]],"860":[[1,66,0]],"864":[[1,62,1]],"867":[[1,62,0]],"871":[[1,62,1]],"873":[[1,62,0]],"876":[[1,66,1]],"878":[[1,66,0]],"883":[[1,66,1]],"885":[[1,66,0]],"887":[[1,62,1]],"890":[[1,62,0]],"893":[[1,62,1]],"896":[[1,62,0]],"899":[[1,68,1]],"900":[[1,62,1],[1,68,0]],"904":[[1,62,0]],"907":[[1,68,1]],"909":[[1,68,0]],"912":[[0,70,1],[0,69,0],[1,62,1]],"915":[[1,62,0]],"918":[[1,62,1]],"920":[[1,62,0]],"925":[[1,62,1]],"927":[[1,62,0]],"931":[[1,62,1]],"934":[[1,62,0]],"937":[[1,62,1]],"939":[[1,62,0]],"944":[[1,62,1]],"946":[[1,62,0]],"948":[[1,67,1]],"950":[[1,67,0]],"952":[[1,62,1]],"955":[[1,62,0]],"957":[[1,67,1]],"959":[[1,62,1],[1,67,0]]};
	this.sequenceLength = 1000;
}