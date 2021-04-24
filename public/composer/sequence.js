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
			this.sequenceLength = timeSteps;
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
		//Stops accidental overwrites 
		return this.sequenceData[timeSteps].slice();
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
	for(let i = 0; i < this.sequenceLength; i++) {
		if(typeof(this.sequenceData[i]) == "undefined") {
			continue;
		}
		for(let j = 0; j < this.sequenceData[i].length; j++) {
			if(this.sequenceData[i][j][0] == instrument) {
				this.sequence[i].splice(j,1);
			}
		}
	}
};

Sequence.prototype.getTrackData = function() {
	return JSON.stringify(this.sequenceData);
}

Sequence.prototype.loadTrackData = function(data) {
	this.sequenceData = JSON.parse(data);
}

Sequence.prototype.loadDummyData = function() {
	this.sequenceData = {"1":[[0,67,1],[0,64,1],[0,60,1]],"147":[[0,67,0],[0,64,0],[0,60,0]],"162":[[0,67,1],[0,64,1],[0,60,1]],"253":[[0,64,0]],"254":[[0,67,0]],"257":[[0,60,0]],"265":[[0,67,1],[0,64,1],[0,60,1]],"319":[[0,67,0],[0,64,0]],"320":[[0,60,0]],"330":[[0,64,1]],"332":[[0,67,1],[0,60,1]],"401":[[0,64,0],[0,60,0]],"402":[[0,67,0]],"413":[[0,64,1],[0,60,1],[0,67,1]],"449":[[0,69,1]],"451":[[0,67,0]],"469":[[0,67,1]],"470":[[0,69,0]],"496":[[0,67,0]],"497":[[0,64,0],[0,60,0]],"502":[[0,67,1],[0,64,1],[0,60,1]],"539":[[0,60,0]],"540":[[0,67,0],[0,64,0]],"554":[[0,67,1],[0,64,1],[0,60,1]],"591":[[0,67,0],[0,64,0],[0,60,0]],"604":[[0,64,1],[0,60,1]],"605":[[0,67,1]],"666":[[0,67,0]],"678":[[0,67,1]],"694":[[0,60,0]],"695":[[0,64,0]],"702":[[0,64,1]],"707":[[0,60,1]],"736":[[0,64,0]],"737":[[0,67,0]],"748":[[0,64,1]],"750":[[0,67,1]],"772":[[0,60,0]],"775":[[0,60,1]],"780":[[0,64,0]],"793":[[0,64,1]],"810":[[0,67,0]],"822":[[0,67,1]],"844":[[0,60,0]],"856":[[0,60,1]],"878":[[0,67,0]],"879":[[0,64,0]],"906":[[0,60,0]],"917":[[0,60,1]]};
	this.sequenceLength = 960;
}
