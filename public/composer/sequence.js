/*
 * Sequence.js
 * Version 1
 * Created by Daniel Hannon
 * For use in conjunction with composer.js
 *
 * Basically, it's a wrapper for the actual track sequencer to save writing boilerplate
 */

function Sequence() {
	//Sequence Data is gonna be stored as a dictionary
	this.sequenceData = {};
	this.sequenceLength = 0;
}

Sequence.prototype.addData(timeSteps, instrument, note ,flag) {
	if(Number.isInterger(timeSteps) && timeSteps >= 0) {
		if(typeof(this.sequenceData[timeSteps]) == "undefined") {
			this.sequenceData[timeSteps] = new Array();
		} else if(this.sequenceData[timeSteps].indexOf([instrument,note,flag]) == null) {
			console.log("Already Exists at this position!\n"+timeSteps+": ["+instrument+","+note+","+flag+"]");
			return 0;
		}
		if(Number.isInterger(instrument) && Number.isInterger(note) && Number.isInterger(flag)) {
			this.sequenceData[timeSteps].append([instrument, note, flag]);
			if(timeSteps > this.sequenceLength) {
				this.sequenceLength = timeSteps;
			}
			return 1;
		}
	} else {
		//Failure Condition
		console.log("ERROR: timeSteps must be a non negative interger value\nValue:" + timeSteps);
		return 0;
	}
	return 0;
}

Sequence.prototype.removeData(timeSteps, instrument, note, flag) {
	if(typeof(this.sequenceData[timeSteps]) == "undefined") {
		console.log("Nothing Performed ["+instrument+","+note+","+flag"] at "+timeSteps);
		return 0;
	}
	this.sequenceData[timeSteps].splice(this.sequenceData[timeSteps].indexOf([instrument, note, flag]),1);
	console.log("Operation performed!");
	return 1;
}

Sequence.prototype.getData(timeSteps) {
	if(typeof(this.sequenceData[timeSteps]) == "undefined") {
		return [];
	} else {
		return this.sequenceData[timeSteps];
	}
}

Sequence.prototype.getLength() {
	return this.sequenceLength;
}

Sequence.prototype.setLength(val) {
	if(typeof(val) == "number") {
		this.sequenceLength = val;
		return 1;
	} else {
		console.log("Failed!");
		return 0;
	}
}
