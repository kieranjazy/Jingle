const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioctx = new AudioContext();
/*
 * Composer
 * Version 2.1 (work in progress though!)
 * Created by Daniel Hannon (danielh2942)
 * Last Edited 26/04/2021
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
	this.loadedInstruments = [{"name":"01_synth_lead","isLoaded":false,"type":0},
														{"name":"drum_machine","isLoaded":false,"type":1}];
									/*These all follow the form f(x) = (440 * 2^((x-69)/12))/60
										Where 60 is middle C It's required for the wavetables to work correctly
										As the Wavetables are all recorded at middle C*/
	this.keyfreqs = [0.03125,0.03311,0.03508,0.03717,0.03938,0.04172,0.0442,0.04683,0.04961,0.05256,0.05569,0.059,0.06251,0.06622,0.07016,0.07433,0.07875,0.08344,0.0884,0.09365,0.09922,0.10512,0.11137,0.118,0.12501,0.13245,0.14032,0.14867,0.15751,0.16687,0.17679,0.18731,0.19844,0.21024,0.22275,0.23599,0.25002,0.26489,0.28064,0.29733,0.31501,0.33374,0.35359,0.37461,0.39689,0.42049,0.44549,0.47198,0.50005,0.52978,0.56129,0.59466,0.63002,0.66749,0.70718,0.74923,0.79378,0.84098,0.89099,0.94397,1.0001,1.05957,1.12257,1.18932,1.26004,1.33497,1.41435,1.49845,1.58756,1.68196,1.78197,1.88793,2.0002,2.11913,2.24514,2.37865,2.52009,2.66994,2.8287,2.99691,3.17511,3.36391,3.56394,3.77587,4.00039,4.23827,4.49029,4.75729,5.04018,5.33988,5.65741,5.99381,6.35022,6.72783,7.12789,7.55173,8.00078,8.47653,8.98057,9.51459,10.08035,10.67976,11.31481,11.98763,12.70045,13.45566,14.25577,15.10346,16.00156,16.95307,17.96115,19.02917,20.16071,21.35952,22.62963,23.97526,25.4009,26.91131,28.51155,30.20693,32.00313,33.90613,35.9223,38.05835,40.32141,42.71905,45.25926,47.95051];
	this.instrumentBank = [wavetable,instruments];
	this.bps = 1;
	//Mono by Default for speed
	this.channels = 1;
	/* Playback Variables */
	this.sequencePosition = 0;
	this.sequenceLength = 0;
	this.isPlaying = false;
	this.frameLength = 0;
	this.activeNotes = [[],[]];
	//This is where you send keyboard inputs to avoid blank notes being inputted :)
	this.keyboardState = [];
	//This is comprised of dictionaries because it takes up less memory than 512 numbers :)
	this.keyPositions = [{},{}];
	/*Arpeggio Related Info*/
	this.hasArpeggio = [false,false];
	this.arpeggioSpeed = [1.0,1.0];
	this.arpeggioPosition = [0,0];
	/*Metronome Playback*/
	this.metronomePlaying = false;
	this.metronomeSteps = 0;
	//Master Volume is a value between 0 and 2
	this.masterVolume = 1.0;
	this.numTracks = 1;
	this.trackVolumes = [[1.0,1.0],[1.0,1.0]];
	this.isMuted = [false,false];
	this.instrumentVolumes = [1.0,1.0];
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

Composer.prototype.getArpeggioState = function(track) {
	return this.hasArpeggio[track];
};

Composer.prototype.setArpeggioState = function(track, value) {
	console.log("Setting arp for track " + track + " to " + value);
	this.hasArpeggio[track] = value;
};

Composer.prototype.getArpeggioSpeed = function(track) {
	return this.arpeggioSpeed[track];
};

Composer.prototype.setArpeggioSpeed = function(track, value) {
	console.log("Setting Arpeggio at position: " + track + " to " + value);
	if(value < 0) return;
	this.arpeggioSpeed[track] = value;
};

Composer.prototype.setTrackMuteState = function(track, value) {
	console.log("Set track: " + track + " Mute State to: " + value);
	this.isMuted[track] = value;
}

Composer.prototype.getTrackMuteState = function(track) {
	return this.isMuted[track];
}

Composer.prototype.__play = function() {
	this.isPlaying = true;
	//Pre checks
	let temp_val = this.instrumentBank.length;
	if(this.activeNotes.length<temp_val) {
		while(this.activeNotes.length < temp_val) {
			this.activeNotes.push([]);
		}
	}
	if(this.keyPositions.length < temp_val) {
		while(this.keyPositions.length < temp_val) {
			this.keyPositions.push({});
		}
	}
	let frameSize = Math.floor(audioctx.sampleRate * this.bps * 0.03125);
	this.sequenceLength = this.sequencer.getLength() + 1;
	let totalFrames = this.sequenceLength - this.sequencePosition;
	let totalBufferSize = frameSize * totalFrames;
	console.log(totalFrames + " " + totalBufferSize + " " + frameSize);
	let myArrayBuffer = audioctx.createBuffer(this.channels,totalBufferSize,audioctx.sampleRate);
	this.activeNotes = [[],[]]; //Clear Just in case
	if(this.channels == 1) {
		//Mono
		let nowBuffering = myArrayBuffer.getChannelData(0);
		let framePosition = 0;
		for(let step = this.sequencePosition; step < this.sequenceLength; step++) {
			//Step 1: Step Loading
			let tempNotes = this.sequencer.getData(step);
			for(let i = 0; i < tempNotes.length; i++) {
				if(tempNotes[i].indexOf('')!= -1 || this.isMuted[tempNotes[i][0]]) {
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
					//Quick Safety Check
				if(tempNotes[i][0] >= this.instrumentBank.length) {
					console.log("This instrument is not defined: " + tempNotes[i][0]);
					continue;
				}
					/* Note on*/
				if(tempNotes[i][2] == 1) {
					if(this.loadedInstruments[tempNotes[i][0]].type === 0) {
						/*Wavetable Synth*/
						if(tempNotes[i][1] < 24 || tempNotes[i][1] > 127) {
							//Unplayable notes - They are not added to the activeNotes list
							continue;
						}
						if(this.activeNotes[tempNotes[i][0]].indexOf(tempNotes[i][1]) == -1) {
							//Note isn't already Playing
							//Input notes in order for the arpeggiator so it sounds decent
							if(this.activeNotes[tempNotes[i][0]].length == 0) {
								this.activeNotes[tempNotes[i][0]].push(tempNotes[i][1]);
							} else {
								let j = 0;
								let wasadded = false;
								while(j < this.activeNotes[tempNotes[i][0]].length) {
									if(this.activeNotes[tempNotes[i][0]][j] > tempNotes[i][1]) {
										this.activeNotes[tempNotes[i][0]].splice(j,0,tempNotes[i][1]);
										wasadded = true;
										break;
									}
									j++;
								}
								if(!wasadded) this.activeNotes[tempNotes[i][0]].push(tempNotes[i][1]);
							}
						}
						//Need to record two key Positions at any time so the new wavetable system can work correctly
						this.keyPositions[tempNotes[i][0]][tempNotes[i][1]] = 0;
					} else {
						//Drum Specific stuff
						let note = tempNotes[i][1] % this.instrumentBank[tempNotes[i][0]].length;
						if(this.activeNotes[tempNotes[i][0]].indexOf(tempNotes[i][1] % this.instrumentBank[tempNotes[i][0]].length) == -1) {
							this.activeNotes[tempNotes[i][0]].push(tempNotes[i][1] % this.instrumentBank[tempNotes[i][0]].length);
						}
						this.keyPositions[tempNotes[i][0]][note] = 0;
					}
				} else {
					//Note Off
					//Drums Are Triggered not Gated
					if(this.loadedInstruments[tempNotes[i][0]].type !== 0) {
						continue;
					}
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
				let offset = 0;
				let i = 0
				for (; i < frameSize; i+=totalNotes) {
					totalNotes-=ended_instruments;
					if(totalNotes<=0) {
						break;
					}
					ended_instruments = 0;
					for(let j = 0; j < this.activeNotes.length; j++) {
						if(this.activeNotes[j].length == 0) {
							continue;
						}
						if(this.loadedInstruments[j]["type"] === 0) {
							//Arpeggio Code (experimental :) )
							//As you cannot alternate between notes if only one is playing, it doesn't arpeggiate if that's the case
							if(this.hasArpeggio[j] && this.activeNotes[j].length > 1) {
								//Prevent it accessing an illegal position in memory
								this.arpeggioPosition[j] %= this.activeNotes[j].length;
								//Get note to save Array Accesses
								let note = this.activeNotes[j][Math.floor(this.arpeggioPosition[j])];
								//Add the Offset of the first one
								this.keyPositions[j][note] = (this.keyPositions[j][note] + (this.keyfreqs[note] * offset)) % this.instrumentBank[j].length;
								for(let k = 0; k < this.activeNotes[j].length; k++) {
									let lower = Math.floor(this.keyPositions[j][note]);
									let upper = Math.floor(this.keyPositions[j][note] + 1) % this.instrumentBank[j].length;
									//Gets difference between the first frame and the previous frame and then adds it to the current frame
									nowBuffering[framePosition + i + offset] = Math.min(Math.max(this.instrumentVolumes[j] * this.masterVolume * ( (this.instrumentBank[j][lower] + ((this.instrumentBank[j][upper] - this.instrumentBank[j][lower]) * (this.keyPositions[j][note]%1)))),-1),1);
									//Moves frame position by one step relative to the keyfreqs table
									this.keyPositions[j][note] = (this.keyPositions[j][note] + this.keyfreqs[note]) % this.instrumentBank[j].length;
									offset++;
								}
								//Adds what's left over
								this.keyPositions[j][note] = (this.keyPositions[j][note] + (this.keyfreqs[note] * (totalNotes - offset-1))) % this.instrumentBank[j].length;
							} else {
								for(let k = 0; k < this.activeNotes[j].length; k++) {
									//Gets offset value to ensure notes don't vary in frequency during playback
									this.keyPositions[j][this.activeNotes[j][k]] = (this.keyPositions[j][this.activeNotes[j][k]] + (this.keyfreqs[this.activeNotes[j][k]] * offset)) % this.instrumentBank[j].length;
									let lower = Math.floor(this.keyPositions[j][this.activeNotes[j][k]]);
									let upper = Math.floor(this.keyPositions[j][this.activeNotes[j][k]] + 1) % this.instrumentBank[j].length;
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
								for(let k = 0; k < dead_instruments.length; k++) {
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
			//Add Arpeggio increments
			for(let i = 0; i < this.arpeggioPosition.length; i++) {
				if(this.activeNotes[i].length == NaN || this.activeNotes[i].length == 0) {
					continue;
				}
				this.arpeggioPosition[i] = (this.arpeggioPosition[i] + this.arpeggioSpeed[i]) % this.activeNotes[i].length;
			}
			framePosition += frameSize;
		}
		console.log(nowBuffering);
	} else {
		//Stereo - Loading is almost identitical to mono
		//I had to write it twice to eliminate 1322999 If/Else's!
		let left = myArrayBuffer.getChannelData(0);
		let right = myArrayBuffer.getChannelData(1);
		let framePosition = 0;
		for(let step = this.sequencePosition; step < this.sequenceLength; step++) {
			let tempNotes = this.sequencer.getData(step);
			for(let i = 0; i < tempNotes.length; i++) {
				if(tempNotes[i].indexOf('')!= -1 || this.isMuted[tempNotes[i][0]]) {
					continue;
				}
				if(tempNotes[i][0] >= this.instrumentBank.length) {
					console.log("This instrument is not defined: " + tempNotes[i][0]);
					continue;
				}
				if(tempNotes[i][2] == 1) {
					if(this.loadedInstruments[tempNotes[i][0]].type === 0) {
						if(tempNotes[i][1] < 24 || tempNotes[i][1] > 127) {
							continue;
						}
						if(this.activeNotes[tempNotes[i][0]].indexOf(tempNotes[i][1]) == -1) {
							if(this.activeNotes[tempNotes[i][0]].length == 0) {
								this.activeNotes[tempNotes[i][0]].push(tempNotes[i][1]);
							} else {
								let j = 0;
								let wasadded = false;
								while(j < this.activeNotes[tempNotes[i][0]].length) {
									if(this.activeNotes[tempNotes[i][0]][j] > tempNotes[i][1]) {
										this.activeNotes[tempNotes[i][0]].splice(j,0,tempNotes[i][1]);
										wasadded = true;
										break;
									}
									j++;
								}
								if(!wasadded) this.activeNotes[tempNotes[i][0]].push(tempNotes[i][1]);
							}
						}
						this.keyPositions[tempNotes[i][0]][tempNotes[i][1]] = 0;
					} else {
						let note = tempNotes[i][1] % this.instrumentBank[tempNotes[i][0]].length;
						if(this.activeNotes[tempNotes[i][0]].indexOf(tempNotes[i][1] % this.instrumentBank[tempNotes[i][0]].length) == -1) {
							this.activeNotes[tempNotes[i][0]].push(tempNotes[i][1] % this.instrumentBank[tempNotes[i][0]].length);
						}
						this.keyPositions[tempNotes[i][0]][note] = 0;
					}
				} else {
					if(this.loadedInstruments[tempNotes[i][0]].type !== 0) {
						continue;
					}
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
				let offset = 0;
				let i = 0
				for (; i < frameSize; i+=totalNotes) {
					totalNotes-=ended_instruments;
					if(totalNotes<=0) {
						break;
					}
					ended_instruments = 0;
					for(let j = 0; j < this.activeNotes.length; j++) {
						if(this.activeNotes[j].length == 0) {
							continue;
						}
						if(this.loadedInstruments[j]["type"] === 0) {
							if(this.hasArpeggio[j] && this.activeNotes[j].length > 1) {
								this.arpeggioPosition[j] %= this.activeNotes[j].length;
								let note = this.activeNotes[j][Math.floor(this.arpeggioPosition[j])];
								this.keyPositions[j][note] = (this.keyPositions[j][note] + (this.keyfreqs[note] * offset)) % this.instrumentBank[j].length;
								for(let k = 0; k < this.activeNotes[j].length; k++) {
									let lower = Math.floor(this.keyPositions[j][note]);
									let upper = Math.floor(this.keyPositions[j][note] + 1) % this.instrumentBank[j].length;
									let tempnote = Math.min(Math.max(this.instrumentVolumes[j] * this.masterVolume * ( (this.instrumentBank[j][lower] + ((this.instrumentBank[j][upper] - this.instrumentBank[j][lower]) * (this.keyPositions[j][note]%1)))),-1),1);
									left[framePosition + i + offset] = this.trackVolumes[j][0] * tempnote;
									right[framePosition + i + offset] = this.trackVolumes[j][1] * tempnote;
									this.keyPositions[j][note] = (this.keyPositions[j][note] + this.keyfreqs[note]) % this.instrumentBank[j].length;
									offset++;
								}
								this.keyPositions[j][note] = (this.keyPositions[j][note] + (this.keyfreqs[note] * (totalNotes - offset-1))) % this.instrumentBank[j].length;
							} else {
								for(let k = 0; k < this.activeNotes[j].length; k++) {
									this.keyPositions[j][this.activeNotes[j][k]] = (this.keyPositions[j][this.activeNotes[j][k]] + (this.keyfreqs[this.activeNotes[j][k]] * offset)) % this.instrumentBank[j].length;
									let lower = Math.floor(this.keyPositions[j][this.activeNotes[j][k]]);
									let upper = Math.floor(this.keyPositions[j][this.activeNotes[j][k]] + 1) % this.instrumentBank[j].length;
									let tempnote = Math.min(Math.max(this.instrumentVolumes[j] * this.masterVolume * (this.instrumentBank[j][lower] + ((this.instrumentBank[j][upper] - this.instrumentBank[j][lower]) * (this.keyPositions[j][this.activeNotes[j][k]]%1))),-1),1);
									left[framePosition + i + offset] = this.trackVolumes[j][0] * tempnote;
									right[framePosition + i + offset] = this.trackVolumes[j][1] * tempnote;
									this.keyPositions[j][this.activeNotes[j][k]] = (this.keyPositions[j][this.activeNotes[j][k]] + (this.keyfreqs[this.activeNotes[j][k]] * (totalNotes - offset))) % this.instrumentBank[j].length;
									offset++;
								}
							}
						} else {
							let dead_instruments = [];
							for(let k = 0; k < this.activeNotes[j].length; k++) {
								let note = this.activeNotes[j][k];
								this.keyPositions[j][note]+=offset;
								let tempnote = Math.min(Math.max(this.instrumentVolumes[j] * this.masterVolume * this.instrumentBank[j][note][this.keyPositions[j][note]],-1),1);
								left[framePosition + i + offset] = this.trackVolumes[j][0] * tempnote;
								right[framePosition + i + offset] = this.trackVolumes[j][1] * tempnote;
								this.keyPositions[j][note]+=(totalNotes-offset);
								if(this.keyPositions[j][note] >= this.instrumentBank[j][note].length) {
									ended_instruments++;
									dead_instruments.push(note);
								}
								offset++;
							}
							if (ended_instruments > 0) {
								for(let k = 0; k < dead_instruments.length; k++) {
									this.activeNotes[j].splice(this.activeNotes[j].indexOf(dead_instruments[k]),1);
								}
							}
						}
					}
				}
				if(i < frameSize) {
					for(;i < frameSize; i++) {
						left[framePosition+i] = 0;
						right[framePosition +i] = 0;
					}
				}
			} else {
				for(let i = 0; i < frameSize; i++) {
					left[framePosition+i] = 0;
					right[framePosition+i] = 0;
				}
			}
			for(let i = 0; i < this.arpeggioPosition.length; i++) {
				if(this.activeNotes[i].length == NaN || this.activeNotes[i].length == 0) {
					continue;
				}
				this.arpeggioPosition[i] = (this.arpeggioPosition[i] + this.arpeggioSpeed[i]) % this.activeNotes[i].length;
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
		for(let i = 0; i < this.arpeggioPosition.length; i++) {
			this.arpeggioPosition[i] = 0;
		}
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
	this.activeNotes=[[],[]];
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
		let currNotes = this.keyboardState.slice();
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
			break;
		}
	}
	console.log("Recording finished");
	this.isPlaying = false;
	this.stop();
	this.metronomePlaying = false;
	this.metronomeSteps = 0;
};

Composer.prototype.record = async function(trackNum) {
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
	if(!this.metronomePlaying) {
		//Play four beeps of a metro			//Add Arpeggio incrementsnome at the pace of the song before input
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
	} else {
		let tempSteps = this.metronomeSteps * 1;
		while((this.metronomeSteps - tempSteps) < 4) {
			await sleep(50);
		}
		this.__record(trackNum);
	}
};

Composer.prototype.playMetronome = async function() {
	/*Basically the way this will work is that it'll get rid of the four leading metronome beats if the metronome is already playing :)*/
	this.metronomePlaying = true;
	let duration = Math.floor(this.bps*audioctx.sampleRate);
	let myArrayBuffer = audioctx.createBuffer(1,duration,audioctx.sampleRate);
	let nowBuffering = myArrayBuffer.getChannelData(0);
	for(let i = 0; i < duration; i++) {
		if(i < metronome.length) {
			nowBuffering[i] = metronome[i];
		} else {
			while(i < duration) {
				nowBuffering[i] = 0;
				i++;
			}
			break;
		}
	}
	let source = audioctx.createBufferSource();
	source.buffer = myArrayBuffer;
	source.connect(audioctx.destination);
	source.start();
	source.onended = () => {this.playMetronome();this.metronomeSteps++;};
};

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
