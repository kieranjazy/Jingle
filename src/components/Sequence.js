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
		console.log("Sequence Position : " + timeSteps + " " + this.sequenceData[timeSteps]);
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

export default Sequence;