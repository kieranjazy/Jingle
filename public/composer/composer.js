const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioctx = new AudioContext();
/*
 * Composer
 * Version 2.1 (work in progress though!)
 * Created by Daniel Hannon (danielh2942)
 * Last Edited 28/04/2021
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
	this.table_speeds = [[1.000000,1.059463,1.122462,1.189207,1.259921,1.334840,1.414214,1.498307,1.587401,1.681793,1.781797,1.887749],[0.500000,0.529732,0.561231,0.594604,0.629961,0.667420,0.707107,0.749154,0.793701,0.840896,0.890899,0.943874]];
	this.table_vols = [[1.000000,0.916667,0.833333,0.750000,0.666667,0.583333,0.500000,0.416667,0.333333,0.250000,0.166667,0.083333],[0.000000,0.083333,0.166667,0.250000,0.333333,0.416667,0.500000,0.583333,0.666667,0.750000,0.833333,0.916667]];
	this.instrumentBank = [synth_lead,instruments];
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
	this.keyPositions = [];
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

Composer.prototype.generate_buffer_frequency = function(instrument, key, offset) {
	//Check if in range
	let octave = Math.floor(key/12) - 3;
	let upoctave = octave+1;
	let iter_value = key%12;
	let calc_val = 0;
	if(octave < 0) {
		this.keyPositions[instrument][1][key] = (this.keyPositions[instrument][1][key] + (offset * this.table_speeds[1][iter_value])) % this.instrumentBank[instrument][upoctave].length;
		let octave_lower_2 = Math.floor(this.keyPositions[instrument][1][key]);
		let octave_upper_2 = octave_lower_2 + 1;
		calc_val = this.instrumentBank[instrument][upoctave][octave_lower_2] + ((this.instrumentBank[instrument][upoctave][octave_upper_2] - this.instrumentBank[instrument][upoctave][octave_lower_2]) * this.keyPositions[instrument][1][key] % 1);
	} else if(octave > 8) {
		this.keyPositions[instrument][0][key] = (this.keyPositions[instrument][0][key] + (offset * this.table_speeds[0][iter_value])) % this.instrumentBank[instrument][octave].length;
		let octave_lower_1 = Math.floor(this.keyPositions[instrument][0][key]);
		let octave_upper_1 = octave_lower_1 + 1;
		calc_val = this.instrumentBank[instrument][octave][octave_lower_1] + ((this.instrumentBank[instrument][octave][octave_upper_1] - this.instrumentBank[instrument][octave][octave_lower_1]) * this.keyPositions[instrument][0][key] % 1);
	} else {
		/* Breakdown:
			1. Step changes are made for upper and lower wavetable
			2. Step positions for both tables are determined
			3. values are obtained from the wave table for the c below and the c above
			   Along with some code to generate mid-sample values by assuming it's a
			   straight line, this results in a somewhat broader spectrum of sound,
			   although it could potentially be a source of audio issues
			4. the Likeness to either c is then used to mix the two waves together
			   This hopefully makes it sound good but I don't know yet
			5. it returns the values and does nothing else
		*/
		this.keyPositions[instrument][0][key] = (this.keyPositions[instrument][0][key] + (offset * this.table_speeds[0][iter_value])) % this.instrumentBank[instrument][octave].length;
		this.keyPositions[instrument][1][key] = (this.keyPositions[instrument][1][key] + (offset * this.table_speeds[1][iter_value])) % this.instrumentBank[instrument][upoctave].length;
		let octave_lower_1 = Math.floor(this.keyPositions[instrument][0][key]);
		let octave_upper_1 = octave_lower_1 + 1;
		let octave_lower = this.instrumentBank[instrument][octave][octave_lower_1] + ((this.instrumentBank[instrument][octave][octave_upper_1] - this.instrumentBank[instrument][octave][octave_lower_1]) * this.keyPositions[instrument][0][key] % 1);
		let octave_lower_2 = Math.floor(this.keyPositions[instrument][1][key]);
		let octave_upper_2 = octave_lower_2 + 1;
		let octave_upper = this.instrumentBank[instrument][upoctave][octave_lower_2] + ((this.instrumentBank[instrument][upoctave][octave_upper_2] - this.instrumentBank[instrument][upoctave][octave_lower_2]) * this.keyPositions[instrument][1][key] % 1);
		calc_val = octave_lower;
		//Does not perform the end calculations as I want to reuse this for arpeggio
	}
	return calc_val;
};

Composer.prototype.__play = function() {
	//Pre checks
	let temp_val = this.instrumentBank.length;
	if(this.activeNotes.length<temp_val) {
		while(this.activeNotes.length < temp_val) {
			this.activeNotes.push([]);
		}
	}
	if(this.keyPositions.length < temp_val) {
		while(this.keyPositions.length < temp_val) {
			console.log("Poop!");
			this.keyPositions.push([]);
			this.keyPositions[this.keyPositions.length -1].push({});
			this.keyPositions[this.keyPositions.length -1].push({});
		}
	}
	this.isPlaying = true;
	this.sequenceLength = this.sequencer.getLength();
	/* (44100 * bps/32) */
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
		//Mono Code
		let nowBuffering = myArrayBuffer.getChannelData(0);
		let framePosition = 0;
		for(let step = this.sequencePosition; step < this.sequenceLength; step++) {
			//Step 1: Loading in Step Data
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
							this.activeNotes[tempNotes[i][0]].push(tempNotes[i][1]);
						}
						//Need to record two key Positions at any time so the new wavetable system can work correctly
						this.keyPositions[tempNotes[i][0]][0][tempNotes[i][1]] = 0;
						this.keyPositions[tempNotes[i][0]][1][tempNotes[i][1]] = 0;
					} else {
						//Drum Specific stuff
						let note = tempNotes[i][1] % this.instrumentBank[tempNotes[i][0]].length;
						if(this.activeNotes[tempNotes[i][0]].indexOf(tempNotes[i][1] % this.instrumentBank[tempNotes[i][0]].length) == -1) {
							this.activeNotes[tempNotes[i][0]].push(tempNotes[i][1] % this.instrumentBank[tempNotes[i][0]].length);
						}
						this.keyPositions[tempNotes[i][0]][0][note] = 0;
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
			if(totalNotes > 0) {
				let ended_instruments = 0;
				let i = 0;
				for(; i<frameSize; i+= totalNotes) {
					let offset = 0;
					totalNotes-=ended_instruments;
					if(totalNotes<=0) {
						console.log("Ended instrument break!");
						break;
					}
					ended_instruments = 0;
					for(let j = 0; j < this.activeNotes.length; j++) {
						if(this.activeNotes[j].length == 0) {
							//Skip if there's nothing to do
							continue;
						}
						if(this.loadedInstruments[j].type == 0) {
							//Wavetable
							//Check for Arpeggiator
							if(this.hasArpeggio[j] && this.activeNotes[j].length > 1) {
								//In case it's out of bounds
								this.arpeggioPosition[j] %= this.activeNotes[j].length;
								//Get note to save some array accesses
								let note = this.activeNotes[j][Math.floor(this.arpeggioPosition[j])];
								//Compared to the previous version, it uses a method rather than writing the exact same code a heap of times more than I have to
								let temp_val = this.generate_buffer_frequency(j,note,offset);
								nowBuffering[framePosition + i + offset] =  Math.min(Math.max(this.masterVolume * this.instrumentVolumes[j] * temp_val,-1),1);
								offset++;
								for(let k = 1; k < this.activeNotes[j].length; k++) {
									temp_val = this.generate_buffer_frequency(j,note,1);
									Math.min(Math.max(this.masterVolume * this.instrumentVolumes[j] * temp_val,-1),1);
									offset++;
								}
								let octave = Math.floor(note/12)-3;
								if(octave > 0) {
									this.keyPositions[j][0][note] = (this.keyPositions[j][0][note] + ((totalNotes - (offset - 1)) * this.table_speeds[0][note%12]))%this.instrumentBank[j][octave].length;
								}
								octave += 1;
								if(octave < 9) {
									this.keyPositions[j][1][note] = (this.keyPositions[j][1][note] + ((totalNotes - (offset - 1)) * this.table_speeds[1][note%12]))%this.instrumentBank[j][octave].length;
								}
							} else {
								//No Arpeggiator
								for(let k = 0; k < this.activeNotes[j].length; k++) {
									nowBuffering[framePosition + i + offset] = this.generate_buffer_frequency(j,this.activeNotes[j][k],offset);
									let note = this.activeNotes[j][k];
									let octave = Math.floor(this.activeNotes[j][k]/12) - 3;
									if(octave > -1) {
										this.keyPositions[j][0][note] = (this.keyPositions[j][0][note] + ((totalNotes - (offset)) * this.table_speeds[0][note%12]))%this.instrumentBank[j][octave].length;
									}
									octave++;
									if(octave < 9) {
										this.keyPositions[j][1][note] = (this.keyPositions[j][1][note] + ((totalNotes - (offset)) * this.table_speeds[1][note%12]))%this.instrumentBank[j][octave].length;
									}
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
								this.keyPositions[j][0][this.activeNotes[j][k]] += offset;
								nowBuffering[framePosition + i + offset] = Math.min(Math.max((this.instrumentVolumes[j] * this.masterVolume * this.instrumentBank[j][this.activeNotes[j][k]][this.keyPositions[j][0][this.activeNotes[j][k]]]),-1),1);
								this.keyPositions[j][0][this.activeNotes[j][k]] += (totalNotes - offset);
								if(this.keyPositions[j][0][this.activeNotes[j][k]] > this.instrumentBank[j][this.activeNotes[j][k]].length) {
									console.log("Dead Instrument");
									dead_instruments.push(this.activeNotes[j][k]);
									ended_instruments++;
								}
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
				//Fill empty buffer positions left from dead instruments
				if(i < frameSize) {
					while(i < frameSize) {
						nowBuffering[framePosition + i] = 0;
						i++;
					}
				}
			} else {
				for(let i = 0; i < frameSize; i++) {
					nowBuffering[framePosition+i] = 0;
				}
			}
			framePosition += frameSize;
		}
	} else {
		//Stereo
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
							this.activeNotes[tempNotes[i][0]].push(tempNotes[i][1]);
						}
						this.keyPositions[tempNotes[i][0]][0][tempNotes[i][1]] = 0;
						this.keyPositions[tempNotes[i][0]][1][tempNotes[i][1]] = 0;
					} else {
						let note = tempNotes[i][1] % this.instrumentBank[tempNotes[i][0]].length;
						if(this.activeNotes[tempNotes[i][0]].indexOf(tempNotes[i][1] % this.instrumentBank[tempNotes[i][0]].length) == -1) {
							this.activeNotes[tempNotes[i][0]].push(tempNotes[i][1] % this.instrumentBank[tempNotes[i][0]].length);
						}
						this.keyPositions[tempNotes[i][0]][0][note] = 0;
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
			if(totalNotes > 0) {
				let ended_instruments = 0;
				let i = 0;
				for(; i<frameSize; i+= totalNotes) {
					let offset = 0;
					totalNotes-=ended_instruments;
					if(totalNotes<=0) {
						console.log("Ended instrument break!");
						break;
					}
					ended_instruments = 0;
					for(let j = 0; j < this.activeNotes.length; j++) {
						if(this.activeNotes[j].length == 0) {
							continue;
						}
						if(this.loadedInstruments[j].type == 0) {
							if(this.hasArpeggio[j] && this.activeNotes[j].length > 1) {
								this.arpeggioPosition[j] %= this.activeNotes[j].length;
								let note = this.activeNotes[j][Math.floor(this.arpeggioPosition[j])];
								let temp_val = this.generate_buffer_frequency(j,note,offset);
								temp_val =  Math.min(Math.max(this.masterVolume * this.instrumentVolumes[j] * temp_val,-1),1);
								left[framePosition+i+offset] = temp_val * this.trackVolumes[j][0];
								right[framePosition+i+offset] = temp_val * this.trackVolumes[j][1];
								offset++;
								for(let k = 1; k < this.activeNotes[j].length; k++) {
									temp_val = this.generate_buffer_frequency(j,note,1);
									Math.min(Math.max(this.masterVolume * this.instrumentVolumes[j] * temp_val,-1),1);
									offset++;
								}
								let octave = Math.floor(note/12)-3;
								if(octave > 0) {
									this.keyPositions[j][0][note] = (this.keyPositions[j][0][note] + ((totalNotes - (offset - 1)) * table_speeds[0][note%12]))%this.instrumentBank[j][octave].length;
								}
								octave += 1;
								if(octave < 9) {
									this.keyPositions[j][1][note] = (this.keyPositions[j][1][note] + ((totalNotes - (offset - 1)) * table_speeds[1][note%12]))%this.instrumentBank[j][octave].length;
								}
							} else {
								for(let k = 0; k < this.activeNotes[j].length; k++) {
									let temp = this.generate_buffer_frequency(j,this.activeNotes[j][k],offset);
									left[framePosition + i + offset] = this.trackVolumes[j][0] * temp;
									right[framePosition+i+offset]=this.trackVolumes[j][1] * temp;
									let note = this.activeNotes[j][k];
									let octave = Math.floor(this.activeNotes[j][k]/12) - 3;
									if(octave > -1) {
										this.keyPositions[j][0][note] = (this.keyPositions[j][0][note] + ((totalNotes - (offset)) * table_speeds[0][note%12]))%this.instrumentBank[j][octave].length;
									}
									octave++;
									if(octave < 9) {
										this.keyPositions[j][1][note] = (this.keyPositions[j][1][note] + ((totalNotes - (offset)) * table_speeds[1][note%12]))%this.instrumentBank[j][octave].length;
									}
									offset++;
								}
							}
						} else {
							let dead_instruments = [];
							for(let k = 0; k < this.activeNotes[j].length; k++) {
								this.keyPositions[j][0][this.activeNotes[j][k]] += offset;
								let temp = Math.min(Math.max((this.instrumentVolumes[j] * this.masterVolume * this.instrumentBank[j][this.activeNotes[j][k]][this.keyPositions[j][0][this.activeNotes[j][k]]]),-1),1);
								left[framePosition + i + offset] = this.trackVolumes[j][0] * temp;
								right[framePosition + i + offset] = this.trackVolumes[j][1] * temp;
								this.keyPositions[j][0][this.activeNotes[j][k]] += (totalNotes - offset);
								if(this.keyPositions[j][0][this.activeNotes[j][k]] > this.instrumentBank[j][this.activeNotes[j][k]].length) {
									console.log("Dead Instrument");
									dead_instruments.push(this.activeNotes[j][k]);
									ended_instruments++;
								}
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
					while(i < frameSize) {
						left[framePosition + i] = 0;
						right[framePosition + i] = 0;
						i++;
					}
				}
			} else {
				for(let i = 0; i < frameSize; i++) {
					left[framePosition+i] = 0;
					right[framePosition+i] = 0;
				}
			}
			framePosition+=frameSize;
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
