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
	//Iterate through keys and nothing else
	console.log("Deleting Data for Instrument: " + instrument);
	for(let key in this.sequenceData) {
		for(let i = 0; i < this.sequenceData[key].length; i++) {
			if(this.sequenceData[key][i][0] == instrument) {
				this.sequenceData[key].splice(i,1);
				i--;
				//Delete step if it contains nothing else
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
	return JSON.stringify(this.sequenceData);
}

Sequence.prototype.loadTrackData = function(data) {
	this.sequenceData = JSON.parse(data);
}

Sequence.prototype.loadDummyData = function() {
	this.sequenceData = {"0":[[0,60,1]],"26":[[0,60,0]],"36":[[0,60,1]],"64":[[0,60,0]],"76":[[0,67,1]],"97":[[0,67,0]],"113":[[0,67,1]],"136":[[0,67,0]],"172":[[0,69,1]],"188":[[0,69,0]],"207":[[0,69,1]],"223":[[0,69,0]],"239":[[0,67,1]],"281":[[0,67,0]],"294":[[0,65,1]],"310":[[0,65,0]],"327":[[0,65,1]],"342":[[0,65,0]],"357":[[0,64,1]],"378":[[0,64,0]],"390":[[0,64,1]],"411":[[0,64,0]],"420":[[0,62,1]],"438":[[0,62,0]],"448":[[0,62,1]],"468":[[0,62,0]],"477":[[0,60,1]],"496":[[0,60,0]]};
	this.sequenceLength = 960;
}

export default Sequence;