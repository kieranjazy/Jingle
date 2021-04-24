const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioctx = new AudioContext();
/*
 * Composer
 * Version 2.1 (work in progress though!)
 * Created by Daniel Hannon (danielh2942)
 * Last Edited 24/04/2021
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
	this.instrumentBank = [wavetable_wobbly];
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
		console.log("Master Volume changed to: "+val);
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
	} else {
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
	this.isPlaying = true;
	this.sequenceLength = this.sequencer.getLength();
	/* (44100 * bps)/32*/
	let frameSize = Math.floor(audioctx.sampleRate * this.bps * 0.03125);
	let totalFrames = this.sequenceLength - this.sequencePosition;
	let totalBufferSize = frameSize * totalFrames;
	console.log("Frame Size: "+frameSize+" Number of Frames: "+totalFrames+" Total Buffer Size: "+totalBufferSize);
	if(totalFrames == 0) {
		console.log("Nothing Passed!, nothing to play.");
		return;
	}
	let myArrayBuffer = audioctx.createBuffer(this.channels,totalBufferSize,audioctx.sampleRate);
	if(this.channels == 1) {
		//Mono
		let nowBuffering = myArrayBuffer.getChannelData(0);
		let framePosition = 0;
		for(let step = this.sequencePosition; step < this.sequenceLength; step++) {
			//Step 1: Step Loading
			let tempNotes = this.sequencer.getData(step);
			for(let i = 0; i < tempNotes.length; i++) {
				if(tempNotes[i][1]=='') {
					continue;
				}
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
			//Step 2: Buffer Loading
			if (totalNotes > 0) {
				let ended_instruments = 0;
				let i = 0;
				for (; i < frameSize; i+=totalNotes) {
					let offset = 0;
					totalNotes-=ended_instruments;
					if(totalNotes<=0) {
						console.log("Ended Instrument break!");
						break;
					}
					ended_instruments = 0;
					for(let j = 0; j < this.activeNotes.length; j++) {
						if(this.loadedInstruments[j]["type"] == "wavetable") {
							for(let k = 0; k < this.activeNotes[j].length; k++) {
								//Gets offset value to ensure notes don't vary in frequency during playback
								this.keyPositions[j][this.activeNotes[j][k]] = (this.keyPositions[j][this.activeNotes[j][k]] + (this.keyfreqs[this.activeNotes[j][k]] * offset)) % this.instrumentBank[j].length;
								let lower = Math.floor(this.keyPositions[j][this.activeNotes[j][k]]);
								let upper = Math.floor(this.keyPositions[j][this.activeNotes[j][k]] + 0.5) % this.instrumentBank[j].length;
								/*	This is disgusting I hate it so much */
								/* Breakdown:
								   1. gets the position in the wavetable
								   2. gets the next position in the wavetable
								   3. gets the difference between the two and multiplies it by the value after the decimal point
								   4. adds this value to the lower value
								   5. Multiplies this result by the volumes for the instrument and master Volume
								   6. Performs a MaxMin operation to avoid clipping
								   7. loads this newly calculated value to the correct buffer position
								*/
								nowBuffering[framePosition + i + offset] = Math.min(Math.max(this.instrumentVolumes[j] * this.masterVolume * (this.instrumentBank[j][lower] + ((this.instrumentBank[j][upper] - this.instrumentBank[j][lower]) * (this.keyPositions[j][this.activeNotes[j][k]]%1))),-1),1);
								//By Adding this to the end we can make every sample act as if it's the only sample being played regardless of it's position
								this.keyPositions[j][this.activeNotes[j][k]] = (this.keyPositions[j][this.activeNotes[j][k]] + (this.keyfreqs[this.activeNotes[j][k]] * (totalNotes - offset))) % this.instrumentBank[j].length;
								offset++;
							}
						} else {
							//Drum Kit (and Vox if there's time :) )
							/*Drum design Specification*/
							/*Drums are typically Triggered and the sample runs to the end
							Hopefully this sounds good, I might regret writing this lol
							*/
							/*Basically so it doesn't make shit of the whole thing I have it so the instruments are removed at the end of their cycle :)
							After all other drum sounds have been rendered though!!
							Drum Spec
							Drum sounds are stored in a 2d array rather than a 1d array but both go into instrumentBank for convenience :)
							*/
							let dead_instruments = [];
							for(let k = 0; k < this.activeNotes[j].length; k++) {
								let note = this.activeNotes[j][k];
								this.keyPositions[j][note]+=offset;
								nowBuffering[framePosition + i + offset] = Math.min(Math.max(this.instrumentVolumes[j] * this.masterVolume * this.instrumentBank[j][note][this.keyPositions[j][note]],-1),1);
								this.keyPositions[j][note]+=(totalNotes-offset);
								if(this.keyPositions[j][note] >= this.instrumentBank[j][note].length) {
									ended_instruments++;
									dead_instruments.push(note);
								}
								offset++;
							}
								//Purge dead instruments, This is performed for drumkits as they are triggered rather than gated.
								//It also guarantees that it doesn't sound like complete muck to the listener
							if (ended_instruments > 0) {
								for(let k = 0; k < this.dead_instruments.length; k++) {
									this.activeNotes[j].splice(this.activeNotes[j].indexOf(dead_instruments[k]),1);
								}
							}
						}
					}
				}
				//In case buffer empties from drums ending
				if(i < frameSize) {
					for(;i < frameSize; i++) {
						nowBuffering[framePosition+i] = 0;
					}
				}
			} else {
				//Load in Zeroes for empty steps :)
				for(let i = 0; i < frameSize; i++) {
					nowBuffering[framePosition + i] = 0;
				}
			}
			framePosition += frameSize;
		}
	} else {
		//Stereo - Loading is almost identitical to mono
		//I had to write it twice to eliminate 1322999 If/Else's!
		let left = myArrayBuffer.getChannelData(0);
		let right = myArrayBuffer.getChannelData(1);
		let framePosition = 0;
		for(let step = this.sequencePosition; step < this.sequenceLength; step++) {
			let tempNotes = this.sequencer.getData(step);
			for(let i = 0; i < tempNotes.length; i++) {
				if(tempNotes[i][2] == 1) {
					if(this.activeNotes[tempNotes[i][0]].indexOf(tempNotes[i][1]) == -1) {
						this.activeNotes[tempNotes[i][0]].push(tempNotes[i][1]);
					}
					this.keyPositions[tempNotes[i][0]][tempNotes[i][1]] = 0;
				} else {
					let position = this.activeNotes[tempNotes[i][0]].indexOf(tempNotes[i][1]);
					if(position != -1) {
						this.activeNotes[tempNotes[i][0]].splice(position,1);
					}
				}
			}
			let totalNotes = 0;
			for(let i = 0; i < this.activeNotes.length; i++) {
				totalNotes += this.activeNotes[i].length;
			}
			if (totalNotes > 0) {
				let ended_instruments = 0;

				let i = 0
				for (; i < frameSize; i+=totalNotes) {
					let offset = 0;
					totalNotes-=ended_instruments;
					if(totalNotes<=0) {
						break;
					}
					ended_instruments = 0;
					for(let j = 0; j < this.activeNotes.length; j++) {
						console.log(j);
						if(this.loadedInstruments[j]["type"] == "wavetable") {
							for(let k = 0; k < this.activeNotes[j].length; k++) {
								this.keyPositions[j][this.activeNotes[j][k]] = (this.keyPositions[j][this.activeNotes[j][k]] + (this.keyfreqs[this.activeNotes[j][k]] * offset)) % this.instrumentBank[j].length;
								let lower = Math.floor(this.keyPositions[j][this.activeNotes[j][k]]);
								let upper = Math.floor(this.keyPositions[j][this.activeNotes[j][k]] + 0.5) % this.instrumentBank[j].length;
								let val = Math.min(Math.max(this.instrumentVolumes[j] * this.masterVolume * (this.instrumentBank[j][lower] + ((this.instrumentBank[j][upper] - this.instrumentBank[j][lower]) * (this.keyPositions[j][this.activeNotes[j][k]]%1))),-1),1);
								left[framePosition+i+offset]=this.trackVolumes[j][0]*val;
								right[framePosition+i+offset]=this.trackVolumes[j][1]*val;
								this.keyPositions[j][this.activeNotes[j][k]] = (this.keyPositions[j][this.activeNotes[j][k]] + (this.keyfreqs[this.activeNotes[j][k]] * (totalNotes - offset))) % this.instrumentBank[j].length;
								offset++;
							}
						} else {
							let dead_instruments = [];
							for(let k = 0; k < this.activeNotes[j].length; k++) {
								let note = this.activeNotes[j][k];
								this.keyPositions[j][note]+=offset;
								let val = Math.min(Math.max(this.instrumentVolumes[j] * this.masterVolume * this.instrumentBank[j][note][this.keyPositions[j][note]],-1),1);
								left[framePosition+i+offset] = this.trackVolumes[j][0]*val;
								right[framePosition+i+offset] = this.trackVolumes[j][1]*val;
								this.keyPositions[j][note]+=(totalNotes-offset);
								if(this.keyPositions[j][note] >= this.instrumentBank[j][note].length) {
									ended_instruments++;
									dead_instruments.push(note);
								}
								offset++;
							}
							if (ended_instruments > 0) {
								for(let k = 0; k < this.dead_instruments.length; k++) {
									this.activeNotes[j].splice(this.activeNotes[j].indexOf(dead_instruments[k]),1);
								}
							}
						}
					}
				}
				//In case buffer empties from drums ending
				if(i < frameSize) {
					for(;i < frameSize; i++) {
						left[framePosition+i] = 0;
						right[framePosition+i]=0;
					}
				}
			} else {
				//Load in Zeroes for empty steps :)
				for(let i = 0; i < frameSize; i++) {
					left[framePosition+i] = 0;
					right[framePosition+i] = 0;
				}
			}
			framePosition += frameSize;
		}
	}
	console.log("Playing!");
	let source = audioctx.createBufferSource();
	source.buffer = myArrayBuffer;
	source.connect(audioctx.destination);
	source.start();
	source.onended = () => {this.stop()};
};

Composer.prototype.play = function() {
	if(!this.isPlaying) {
		console.log("Commencing playback!");
		this.__play();
	} else if(audioctx.state=="suspended") {
		console.log("Resuming Playback");
		audioctx.resume();
	}
};

Composer.prototype.pause = function() {
	if(audioctx.state=="running") {
		console.log("Pausing Playback");
		audioctx.suspend();
	}
}

Composer.prototype.stop = async function() {
	if(audioctx.state=="running"||audioctx.state=="suspended") {
		console.log("Stopped");
		await audioctx.close().then(()=>{
			console.log("AudioContext Closed");
		});
		audioctx = new AudioContext();
	}
	this.activeNotes=[[]];
	this.sequencePosition=0;
	this.isPlaying = false;
}


Composer.prototype.seek = function(position) {
	if(typeof("position") == "number") {
		console.log("Position set to: " + position);
		this.sequencePosition = Math.floor(position+0.5);
	}
};

//Internal Recording process
Composer.prototype.__record = async function(trackNum) {
	console.log("Recording");
	this.isPlaying = true;
	let prevNotes = [];
	//Total Track Length is how many notes you can fit in 30s
	let totalTrackLength = (30/this.bps) * 32;
	this.sequenceLength = totalTrackLength;
	this.sequencer.setLength(totalTrackLength);
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
		if(this.isPlaying == false) {
			this.sequencer.setLength(i+1);
			break;
		}
	}
	console.log("Recording finished");
	this.isPlaying = false;
};

Composer.prototype.record = function(trackNum) {
	//Flushing this for good reason :)
	this.sequencePosition = 0;
	for(let i = 0; i < this.keyPositions.length; i++) {
		this.keyPositions[i] = {};
	}
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

Composer.prototype.playMetronome = async function() {
	let duration = Math.floor(this.bps*audioctx.sampleRate);
	let myArrayBuffer = audioctx.createBuffer(0,duration,audioctx.sampleRate);
	let nowBuffering = myArrayBuffer.getChannelData(0);
	for(let i = 0; i < duration; i++) {
		if(i < metronome.length) {
			nowBuffering[i] = metronome[i];
		} else {
			while(i < duration) {
				nowBuffering[i] = 0;
			}
		}
	}
	let source = audioctx.createBufferSource();
	source.buffer = myArrayBuffer;
	source.connect(audioctx.destination);
	source.onended = () => {this.playMetronome()};
}

Composer.prototype.fetchInstrument = function(instrument) {
	for(let i = 0; i < this.loadedInstruments.length; i++) {
		if(this.loadedInstruments[i].isLoaded == false) {
			//TODO Make serverside fetch
		}
	}
};

Composer.prototype.clearTrack = function(trackNo) {
	//Wrapper function for the sequencer class for easier access
	this.sequencer.removeInstrument(trackNo);
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
};

Composer.prototype.loadTestData = function() {
	this.sequencer.loadDummyData();
};
