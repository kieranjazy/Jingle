const table_vols = [[1.000000,0.916667,0.833333,0.750000,0.666667,0.583333,0.500000,0.416667,0.333333,0.250000,0.166667,0.083333],[0.000000,0.083333,0.166667,0.250000,0.333333,0.416667,0.500000,0.583333,0.666667,0.750000,0.833333,0.916667]];
const table_speeds = [[1.000000,1.059463,1.122462,1.189207,1.259921,1.334840,1.414214,1.498307,1.587401,1.681793,1.781797,1.887749],[0.500000,0.529732,0.561231,0.594604,0.629961,0.667420,0.707107,0.749154,0.793701,0.840896,0.890899,0.943874]];
// Input 60 -> C4
// 60/12 = 5 C4 is wavetable[instrument][2]
Composer.prototype.generate_buffer_frequency = function(instrument, key, offset) {
	//Check if in range
	let octave = Math.floor(key/12) - 3;
	let upoctave = octave+1;
	let iter_value = key%12;
	let calc_val = 0;
	if(octave < 0) {
		this.keyPositions[instrument][1][key] = (this.keyPositions[instrument][1][key] + (offset * table_speeds[1][iter_value])) % wavetable[instrument][upoctave].length;
		let octave_lower_2 = Math.floor(this.keyPositions[instrument][1][key]);
		let octave_upper_2 = octave_lower_2 + 1;
		calc_val = wavetable[instrument][upoctave][octave_lower_2] + ((wavetable[instrument][upoctave][octave_upper_2] - wavetable[instrument][upoctave][octave_lower_2]) * this.keyPositions[instrument][1][key] % 1);
	} else if(octave > 8) {
		this.keyPositions[instrument][0][key] = (this.keyPositions[instrument][0][key] + (offset * table_speeds[0][iter_value])) % wavetable[instrument][octave].length;
		let octave_lower_1 = Math.floor(this.keyPositions[instrument][0][key]);
		let octave_upper_1 = octave_lower_1 + 1;
		calc_val = wavetable[instrument][octave][octave_lower_1] + ((wavetable[instrument][octave][octave_upper_1] - wavetable[instrument][octave][octave_lower_1]) * this.keyPositions[instrument][0][key] % 1);
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
		this.keyPositions[instrument][0][key] = (this.keyPositions[instrument][0][key] + (offset * table_speeds[0][iter_value])) % wavetable[instrument][octave].length;
		this.keyPositions[instrument][1][key] = (this.keyPositions[instrument][1][key] + (offset * table_speeds[1][iter_value])) % wavetable[instrument][upoctave].length;
		let octave_lower_1 = Math.floor(this.keyPositions[instrument][0][key]);
		let octave_upper_1 = octave_lower_1 + 1;
		let octave_lower = wavetable[instrument][octave][octave_lower_1] + ((wavetable[instrument][octave][octave_upper_1] - wavetable[instrument][octave][octave_lower_1]) * this.keyPositions[instrument][0][key] % 1);
		let octave_lower_2 = Math.floor(this.keyPositions[instrument][1][key]);
		let octave_upper_2 = octave_lower_2 + 1;
		let octave_upper = wavetable[instrument][upoctave][octave_lower_2] + ((wavetable[instrument][upoctave][octave_upper_2] - wavetable[instrument][upoctave][octave_lower_2]) * this.keyPositions[instrument][1][key] % 1);
		calc_val = (octave_lower * table_vols[0][iter_value]) + (octave_upper * table_vols[1][iter_value]);
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
			this.keyPositions.push([{},{}]);
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
						if(key < 24 || key > 127) {
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
								nowBuffering[temp + i + offset] =  Math.min(Math.max(this.masterVolume * this.instrumentVolumes[j] * temp_val,-1),1);
								offset++;
								for(let k = 1; k < this.activeNotes[j].length; k++) {
									temp_val = this.generate_buffer_frequency(j,note,1);
									Math.min(Math.max(this.masterVolume * this.instrumentVolumes[j] * temp_val,-1),1);
									offset++;
								}
								let octave = Math.floor(note/12)-3;
								if(octave > 0) {
									this.keyPositions[j][0][note] = (this.keyPositions[j][0][note] + ((totalNotes - (offset - 1)) * table_speeds[0][note%12])%this.instrumentBank[j][octave].length;
								}
								octave += 1;
								if(octave < 9) {
									this.keyPositions[j][1][note] = (this.keyPositions[j][1][note] + ((totalNotes - (offset - 1)) * table_speeds[1][note%12])%this.instrumentBank[j][octave].length;
								}
							} else {
								//No Arpeggiator
								for(let k = 0; k < this.activeNotes[j].length; k++) {
									nowBuffering[framePosition + i + offset] = this.generate_buffer_frequency(j,this.activeNotes[j][k],offset);
									let note = this.activeNotes[j][k];
									let octave = Math.floor(this.activeNotes[j][k]/12) - 3;
									if(octave > -1) {
										this.keyPositions[j][0][note] = (this.keyPositions[j][0][note] + ((totalNotes - (offset)) * table_speeds[0][note%12])%this.instrumentBank[j][octave].length;
									}
									octave++;
									if(octave < 9) {
										this.keyPositions[j][1][note] = (this.keyPositions[j][1][note] + ((totalNotes - (offset)) * table_speeds[1][note%12])%this.instrumentBank[j][octave].length;
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
						if(key < 24 || key > 127) {
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
									this.keyPositions[j][0][note] = (this.keyPositions[j][0][note] + ((totalNotes - (offset - 1)) * table_speeds[0][note%12])%this.instrumentBank[j][octave].length;
								}
								octave += 1;
								if(octave < 9) {
									this.keyPositions[j][1][note] = (this.keyPositions[j][1][note] + ((totalNotes - (offset - 1)) * table_speeds[1][note%12])%this.instrumentBank[j][octave].length;
								}
							} else {
								for(let k = 0; k < this.activeNotes[j].length; k++) {
									let temp = this.generate_buffer_frequency(j,this.activeNotes[j][k],offset);
									left[framePosition + i + offset] = this.trackVolumes[j][0] * temp;
									right[framePosition+i+offset]=this.trackVolumes[j][1] * temp;
									let note = this.activeNotes[j][k];
									let octave = Math.floor(this.activeNotes[j][k]/12) - 3;
									if(octave > -1) {
										this.keyPositions[j][0][note] = (this.keyPositions[j][0][note] + ((totalNotes - (offset)) * table_speeds[0][note%12])%this.instrumentBank[j][octave].length;
									}
									octave++;
									if(octave < 9) {
										this.keyPositions[j][1][note] = (this.keyPositions[j][1][note] + ((totalNotes - (offset)) * table_speeds[1][note%12])%this.instrumentBank[j][octave].length;
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
