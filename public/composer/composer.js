const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioctx = new AudioContext();
/*
 * Composer
 * Version 2 (work in progress though!)
 * Created by Daniel Hannon (danielh2942)
 * Last Edited 19/04/2021
 *
 * Abstract: Like the previous one but it was built in conjunction
 * with a UI so hopefully it works this time :)
 */


//Sleep function
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function Composer() {
	this.audioctx = new AudioContext();
	// TODO: Implement DrumKits
	this.loadedInstruments = [{"name":"01_synth_lead","isLoaded":false,"type":"wavetable"}];
									/*These all follow the form f(x) = (440 * 2^((x-69)/12))/60
										Where 60 is middle C It's required for the wavetables to work correctly
										As the Wavetables are all recorded at middle C*/
	this.keyfreqs = [0.03125,0.03311,0.03508,0.03716,0.03937,0.04171,0.04419,0.04682,0.04961,0.05256,0.05568,0.05899,
									0.0625,0.06622,0.07015,0.07432,0.07874,0.08343,0.08839,0.09364,0.09921,0.10511,0.11136,0.11798,
									0.125,0.13243,0.14031,0.14865,0.15749,0.16685,0.17677,0.18729,0.19842,0.21022,0.22272,0.23596,
									0.25,0.26486,0.28061,0.2973,0.31497,0.3337,0.35355,0.37457,0.39684,0.42044,0.44544,0.47193,
									0.49999,0.52972,0.56122,0.59459,0.62995,0.66741,0.70709,0.74914,0.79369,0.84088,0.89088,
									0.94386,1,1.05945,1.12244,1.18919,1.2599,1.33482,1.41419,1.49828,1.58737,1.68176,1.78177,
									1.88772,1.99997,2.11889,2.24489,2.37837,2.5198,2.66963,2.82838,2.99656,3.17475,3.36353,3.56353,
									3.77543,3.99993,4.23778,4.48977,4.75675,5.0396,5.33927,5.65676,5.99313,6.3495,6.72706,7.12707,
									7.55087,7.99986,8.47556,8.97954,9.5135,10.0792,10.67854,11.31352,11.98625,12.69899,13.45411,14.25414,
									15.10173,15.99973,16.95112,17.95909,19.02699,20.1584,21.35708,22.62703,23.97251,25.39799,26.90823,
									28.50828,30.20347,31.99946,33.90224,35.91818,38.05398,40.31679,42.71415,45.25407,47.94501];
	this.instrumentBank = [];
	this.bps = 1;
	//Mono by Default for speed
	this.channels = 1;
	/* Playback Variables */
	this.sequencePosition = 0;
	this.sequenceLength = 0;
	this.isPlaying = false;
	this.frameLength = 0;
	this.activeNotes = [[]];
	this.keyPositions = [{}];
	//Master Volume is a value between 0 and 2
	this.masterVolume = 1.0;
	this.numTracks = 1;
	this.trackVolumes = [[1.0,1.0]];
	this.instrumentVolumes = [1.0];
	this.sequencer = new Sequence();
	console.log("Composer Object Created");
}

Composer.prototype.setBpm=function(val) {
	if(typeof(val) == 'number') {
		this.bps = 60 / val;
		console.log("BPM Has Been Set to: " + val);
		return 1;
	}
	return 0;
};

Composer.prototype.setMasterVolume = function(val) {
	//masterVolume is a float between 0 and 2
	if(typeof(val) === 'number' && val >= 0 && val <= 2) {
		this.masterVolume = val;
		return 1;
	} else {
		console.log("Volume change failed! value:" + val);
		return 0;
	}
};

Composer.prototype.getBpm = function() {
	return this.bps * 60;
};

Composer.prototype.getBps = function() {
	return this.bps;
}

Composer.prototype.getMasterVolume = function() {
	return this.masterVolume;
};

Composer.prototype.panTrack = function(trackNo, val) {
	if(trackNo < 0) {
		console.log("Track Number must be positive");
		return;
	}
	if(val > 1 || val < 0) {
		console.log("Value out of range! " + val);
		return;
	}
	if(trackNo >= this.numTracks) {
		console.log("Track Does Not Exist!");
		return;
	}
	//this seemed to be the most efficient way to do this
	if(val < 0.5) {
		this.trackVolumes[trackNo][1] = val * 2;
		this.trackVolumes[trackNo][0] = 1.0;
	} else if (val > 0.5) {
		this.trackVolumes[trackNo][0] = (1 - val) * 2;
		this.trackVolumes[trackNo][1] = 1.0;
	} else {
		this.trackVolumes[trackNo] = [1.0,1.0];
	}
	console.log("Successfully changed volumes!");
}

Composer.prototype.getTrackPanning = function(trackNo) {
	if(trackNo >= this.numTracks) {
		console.log("Track does not exist");
		//Returns 0.5 as default so it doesn't break
		return 0.5
	} else {440 * 2^((x-69)/12)
		return 1 - (this.trackVolumes[trackNo][0]/2);
	}
}

Composer.prototype.setNumberOfChannels = function(value) {
	if(typeof(value) == "number") {
		if(value>=2) {
			this.channels = 2;
		} else {
			this.channels = 1;
		}
	}
};

Composer.prototype.getNumberOfChannels = function() {
	return this.channels;
};

Composer.prototype.__play = function() {
	// TODO: DrumKits
	if(!this.isPlaying) {
		//Pause
		return;
	}

	if(this.sequencePosition == this.sequenceLength) {
		this.stop();
		return;
	}
	/* Step 1: interpret sequencer data*/
	tempNotes = this.sequencer.getData(this.sequencePosition);
	for(let i = 0; i < tempNotes.length; i++) {
		/*
			Each item in the tempNotes array follows the following scheme
			[instrument_number, note, flag]
			instrument_number denotes the index in which the data for the instrument lies
			note is in the range 0 - 127
			flag has two possible values:
			1 - On
			0 - Off
			*/
			/* Note on*/
		if(tempNotes[i][2] == 1) {
			if(this.activeNotes[tempNotes[i][0]].indexOf(tempNotes[i][1]) == -1) {
				this.activeNotes[tempNotes[i][0]].push(tempNotes[i][1]);
			}
			this.keyPositions[tempNotes[i][0]][tempNotes[i][1]] = 0;
		} else {
			//Note Off
			let position = this.activeNotes[tempNotes[i][0]].indexOf(tempNotes[i][1]);
			//Check if it's in the instrument, this is to deal with fragments if they do happen to exist
			if(position != -1) {
				this.activeNotes[tempNotes[i][0]].splice(position,1);
			}
		}

	}
	//This is needed to do calculations later
	let totalNotes = 0;
	for(let i = 0; i < this.activeNotes.length; i++) {
		totalNotes += this.activeNotes[i].length;
	}
	//exactFrameLength is needed to ensure all samples get played and no errors happen in step 2
	let exactFrameLength = (this.frameLength % totalNotes) + this.frameLength;
	let myArrayBuffer = audioctx.createBuffer(this.channels,exactFrameLength,audioctx.sampleRate);
	/*
		Basically because stereo requires two channels which will have
		MasterVolume * ChannelVolume * sample
		for either, in order to reduce the number of channel checks for every second of audio at 60bpm from 44100 to 32
		I have to more or less write the exact same code twice with like two different lines, it's kinda dumb but
		Javascript isn't exactly the best language for speed :)
	*/
	if(this.channels > 1) {
		//Stereo
		/*See Mono for notes*/
		let left = myArrayBuffer.getChannelData(0);
		let right = myArrayBuffer.getChannelData(1);
		for (let i = 0; i < exactFrameLength; i += totalNotes) {
			let offset = 0;
			for (let j = 0; j < this.activeNotes.length; j++) {
				if(this.loadedInstruments[j]["type"] == "wavetable") {
					for(let k = 0; k < this.activeNotes[j].length; k++) {
						this.keyPositions[j][this.activeNotes[j][k]] = (this.keyPositions[j][activeNotes[j][k]] + (this.keyfreqs[activeNotes[j][k]] * totalNotes)) % this.instrumentBank[j].length;
						let lower = Math.floor(this.keyPositions[j][this.activeNotes[j][k]]);
						let upper = Math.floor(this.keyPositions[j][this.activeNotes[j][k]] + 0.5) % this.instrumentBank[j].length;
						let val = Math.min(Math.max(this.instrumentVolumes[j] * this.masterVolume * (this.insrumentBank[j][lower] + ((this.instrumentBank[upper] - this.instrumentBank[lower]) * (this.keyPositions[j][activeNotes[j][k]]%1))),-1),1);
						//Basically this does the same thing as mono but at the end populates left and right
						//By multiplying them by their respective channel volumes
						left[ i + offset] = this.trackVolumes[j][0] * val;
						right[i + offset] = this.trackVolumes[j][1] * val;
						offset++;
					}
				} else {
					//Drum Kit (and Vox if there's time :) )
				}
			}
		}
	} else {
		//Mono
		let nowBuffering = myArrayBuffer.getChannelData(0);
		for (let i = 0; i < exactFrameLength; i += totalNotes) {
			let offset = 0;
			for (let j = 0; j < this.activeNotes.length; j++) {
				if(this.loadedInstruments[j]["type"] == "wavetable") {
					for(let k = 0; k < this.activeNotes[j].length; k++) {
						this.keyPositions[j][this.activeNotes[j][k]] = (this.keyPositions[j][activeNotes[j][k]] + (this.keyfreqs[activeNotes[j][k]] * totalNotes) % this.instrumentBank[j].length;
						let lower = Math.floor(this.keyPositions[j][this.activeNotes[j][k]]);
						let upper = Math.floor(this.keyPositions[j][this.activeNotes[j][k]] + 0.5) % this.instrumentBank[j].length;
						/*	This is disgusting I hate it so much */
						/*	Breakdown:
								1. gets the position in the wavetable
								2. gets the next position in the wavetable
								3. gets the difference between the two and multiplies it by the value after the decimal point
								4. adds this value to the lower value
								5. Multiplies this result by the volumes for the instrument and master Volume
								6. Performs a MaxMin operation to avoid clipping
								7. loads this newly calculated value to the correct buffer position
						*/
						nowBuffering[i + offset] = Math.min(Math.max(this.instrumentVolumes[j] * this.masterVolume * (this.insrumentBank[j][lower] + ((this.instrumentBank[upper] - this.instrumentBank[lower]) * (this.keyPositions[j][activeNotes[j][k]]%1))),-1),1);
						offset++;
					}
				} else {
					//Drum Kit (and Vox if there's time :) )
				}
			}
		}
	}
	let source = audioctx.createBufferSource();
	source.buffer = myArrayBuffer;
	source.connect(audioctx.destination);
	source.start();
	//I could not think of another way to get it to start
	//recording after the metronome plays
	source.onended = () => {this.sequencePosition++;this.__play()};
};

Composer.prototype.play = function() {
	if(!this.isPlaying) {
		// TODO: Fetch channel volumes, mute/solo instructions, masterVolume
		// TODO: Check if instruments are loaded and fetch
		// Do that here because polling every 32nd of a note is slow and inefficient
		this.sequenceLength = this.sequence.getLength();
		this.frameLength = Math.floor(0.03125 * this.bps * audioctx.sampleRate);
		this.__play();
	}
};

Composer.prototype.pause = async function() {
	console.log("Paused");
	this.isPlaying = false;
};

Composer.prototype.stop = async function() {
	console.log("Stopped");
	this.isPlaying = false;
	this.sequencePosition = 0;
	for(let i = 0; i < this.activeNotes.length) {
		this.activeNotes[i] = [];
	}
};

Composer.prototype.seek = function(position) {
	// TODO: this
};

//Internal Recording process
Composer.prototype.__record = async function(trackNum) {
	console.log("Recording");
	let prevNotes = [];
	//Total Track Length is how many notes you can fit in 30s
	let totalTrackLength = (30/this.bps) * 32;
	console.log("Track Length " + totalTrackLength + " Steps");
	for(let i = 0; i < totalTrackLength; i++) {
		//toneKeys is in a different file at the moment
		//but I'll heap it together soon
		let currNotes = activeNotes.slice();
		let nextNotes = [];
		//console.log("Previous Notes: "+prevNotes);
		//Add currently pressed notes to the sequence and remove notes
		//that are no longer playing
		for(let l = 0; l < currNotes.length; l++) {
			if(prevNotes.indexOf(currNotes[l]) == -1) {
				this.sequencer.addData(i,trackNum,currNotes[l],1);
			}
			nextNotes.push(currNotes[l]);
		}
		for(let l = 0; l < prevNotes.length; l++) {
			if(nextNotes.indexOf(prevNotes[l]) == -1) {
				this.sequencer.addData(i,trackNum,prevNotes[l],0);
			}
		}
		prevNotes = nextNotes.slice();
		//Sleeps for now, going to have it do something else soon ;)
		// TODO: Play single track audio
		await sleep(Math.floor(this.bps*0.03125*1000));
	}
	console.log("Recording finished");
};

Composer.prototype.record = function(trackNum) {
	if (trackNum < 0) {
		console.log("Invalid track number");
		return;
	}
	if(trackNum>=this.numTracks) {
		for (;this.numTracks<trackNum;this.numTracks++) {
			this.trackVolumes.push([1.0,1.0]);
		}
		this.numTracks = trackNum;
	}
	//Play four beeps of a metronome at the pace of the song before input
	let frameCount = 4 * Math.floor(audioctx.sampleRate * this.bps);
	let myArrayBuffer = audioctx.createBuffer(this.channels,frameCount,audioctx.sampleRate);
	for(let channel = 0; channel < this.channels; channel++) {
		let nowBuffering = myArrayBuffer.getChannelData(channel);
		for(let i = 0; i < this.bps*4*44100; i+=this.bps*44100) {
			for(let l = 0; l < this.bps*44100; l++) {
				if(l >= metronome.length) {
					while(l < this.bps*44100) {
						nowBuffering[i + l] = 0;
						l++;
					}
					break;
				}
				nowBuffering[i + l] = metronome[l];
			}
		}
	}
	let source = audioctx.createBufferSource();
	source.buffer = myArrayBuffer;
	source.connect(audioctx.destination);
	source.start();
	//I could not think of another way to get it to start
	//recording after the metronome plays
	source.onended = () => {this.__record(trackNum)};
};

Composer.prototype.fetchInstrument = function(instrument) {
	for(let i = 0; i < this.loadedInstruments.length; i++) {
		if(this.loadedInstruments[i].isLoaded == false) {
			//TODO Make serverside fetch
		}
	}
};

Composer.prototype.saveData = function() {
	// TODO: Actually Save
	console.log(this.sequencer.getTrackData());
};

Composer.prototype.loadData = function(saveData) {
	// TODO: This
};

Composer.prototype.renderMp3 = function() {
	// TODO: this
	/*This will use lamejs https://github.com/zhuker/lamejs*/
}
