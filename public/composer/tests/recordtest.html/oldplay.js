Composer.prototype.__play = async function() {
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
	let tempNotes = this.sequencer.getData(this.sequencePosition);
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
	let exactFrameLength = this.frameLength;
	let myArrayBuffer = audioctx.createBuffer(this.channels,exactFrameLength,audioctx.sampleRate);
	/*
		Basically because stereo requires two channels which will have
		MasterVolume * ChannelVolume * sample
		for either, in order to reduce the number of channel checks for every second of audio at 60bpm from 44100 to 32
		I have to more or less write the exact same code twice with like two different lines, it's kinda dumb but
		Javascript isn't exactly the best language for speed :)
	*/
	//Step 2: Buffer Loading
	if (totalNotes>0) {
		let ended_instruments = 0;
		if(this.channels > 1) {
			//Stereo
			/*See Mono for notes*/
			left = myArrayBuffer.getChannelData(0);
			right = myArrayBuffer.getChannelData(1);
			for (let i = 0; i < exactFrameLength; i += totalNotes) {
				totalNotes-=ended_instruments;
				if(totalNotes == 0) {
					break;
				}
				ended_instruments = 0;
				let offset = 0;
				for (let j = 0; j < this.activeNotes.length; j++) {
					if(this.loadedInstruments[j]["type"] == "wavetable") {
						for(let k = 0; k < this.activeNotes[j].length; k++) {
							this.keyPositions[j][this.activeNotes[j][k]] = (this.keyPositions[j][this.activeNotes[j][k]] + (this.keyfreqs[this.activeNotes[j][k]] * offset)) % this.instrumentBank[j].length;
							let lower = Math.floor(this.keyPositions[j][this.activeNotes[j][k]] );
							let upper = Math.floor(this.keyPositions[j][this.activeNotes[j][k]] + 0.5) % this.instrumentBank[j].length;
							let val = Math.min(Math.max(this.instrumentVolumes[j] * this.masterVolume * (this.insrumentBank[j][lower] + ((this.instrumentBank[j][upper] - this.instrumentBank[j][lower]) * (this.keyPositions[j][this.activeNotes[j][k]]%1))),-1),1);
							//Basically this does the same thing as mono but at the end populates left and right
							//By multiplying them by their respective channel volumes
							left[ i + offset] = this.trackVolumes[j][0] * val;
							right[i + offset] = this.trackVolumes[j][1] * val;
							this.keyPositions[j][this.activeNotes[j][k]] = (this.keyPositions[j][this.activeNotes[j][k]] + (this.keyfreqs[this.activeNotes[j][k]] * (totalNotes - offset))) % this.instrumentBank[j].length;
							offset++;
						}
					} else {
						//Drum Kit (and Vox if there's time :) )
						let dead_instruments = [];
						for(let k = 0; k < this.activeNotes[j].length; k++) {
							let note = this.activeNotes[j][k];
							this.keyPositions[j][note]+=offset;
							let val = Math.min(Math.max(this.instrumentVolumes[j] * this.masterVolume * this.instrumentBank[j][note][this.keyPositions[j][note]],-1),1);
							left[i + offset] = this.trackVolumes[j][0] * val;
							right[i + offset] = this.trackVolumes[j][1] * val;
							this.keyPositions[j][note]+=(totalNotes-offset);
							if(this.keyPositions[note] >= this.instrumentBank[j][note].length) {
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
		} else {
			//Mono
			let nowBuffering = myArrayBuffer.getChannelData(0);
			for (let i = 0; i < exactFrameLength; i += totalNotes) {
				totalNotes-=ended_instruments;
				if(totalNotes == 0 ) {
					break;
				}
				ended_instruments = 0;
				let offset = 0;
				for (let j = 0; j < this.activeNotes.length; j++) {
					if(this.loadedInstruments[j]["type"] == "wavetable") {
						for(let k = 0; k < this.activeNotes[j].length; k++) {
							//Gets offset value to ensure notes don't vary in frequency during playback
							this.keyPositions[j][this.activeNotes[j][k]] = (this.keyPositions[j][this.activeNotes[j][k]] + (this.keyfreqs[this.activeNotes[j][k]] * offset)) % this.instrumentBank[j].length;
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
							nowBuffering[i + offset] = this.instrumentVolumes[j] * this.masterVolume * (this.instrumentBank[j][lower] + ((this.instrumentBank[j][upper] - this.instrumentBank[j][lower]) * (this.keyPositions[j][this.activeNotes[j][k]]%1)));
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
							nowBuffering[i + offset] = Math.min(Math.max(this.instrumentVolumes[j] * this.masterVolume * this.instrumentBank[j][note][this.keyPositions[j][note]],-1),1);
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
		}
	} else {
		if(this.channels == 1) {
			let nowBuffering = myArrayBuffer.getChannelData(0);
			for(let i = 0; i < exactFrameLength; i++) {
				nowBuffering[i] = 0;
			}
		} else {
			let left = myArrayBuffer.getChannelData(0);
			let right = myArrayBuffer.getChannelData(1);
			for(let i = 0; i<exactFrameLength;i++) {
				left[i] = 0;
				right[i] = 0;
			}
		}
	}
	//Step 3: Playback
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
		this.isPlaying = true;
		this.sequenceLength = this.sequencer.getLength();
		this.frameLength = Math.floor(0.03125 * this.bps * 44100);
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
	for(let i = 0; i < this.activeNotes.length;i++) {
		this.activeNotes[i] = [];
	}
};
