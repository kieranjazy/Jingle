import wavetable_wobbly from '../wavetables'
import Sequence from './Sequence'
import metronome from './Metronome'
import lamejs from 'lamejs'
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioctx = new AudioContext();
/*
 * Composer
 * Version 2.2 (work in progress though!)
 * Created by Daniel Hannon (danielh2942)
 * Last Edited 4/05/2021
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
	this.loadedInstruments = [{ "name": "01_synth_lead", "isLoaded": false, "type": 0 },
	{ "name": "drum_machine", "isLoaded": false, "type": 1 }];
	/*These all follow the form f(x) = (440 * 2^((x-69)/12))/60
		Where 60 is middle C It's required for the wavetables to work correctly
		As the Wavetables are all recorded at middle C*/
	this.keyfreqs = [0.03125, 0.03311, 0.03508, 0.03717, 0.03938, 0.04172, 0.0442, 0.04683, 0.04961, 0.05256, 0.05569, 0.059, 0.06251, 0.06622, 0.07016, 0.07433, 0.07875, 0.08344, 0.0884, 0.09365, 0.09922, 0.10512, 0.11137, 0.118, 0.12501, 0.13245, 0.14032, 0.14867, 0.15751, 0.16687, 0.17679, 0.18731, 0.19844, 0.21024, 0.22275, 0.23599, 0.25002, 0.26489, 0.28064, 0.29733, 0.31501, 0.33374, 0.35359, 0.37461, 0.39689, 0.42049, 0.44549, 0.47198, 0.50005, 0.52978, 0.56129, 0.59466, 0.63002, 0.66749, 0.70718, 0.74923, 0.79378, 0.84098, 0.89099, 0.94397, 1.0001, 1.05957, 1.12257, 1.18932, 1.26004, 1.33497, 1.41435, 1.49845, 1.58756, 1.68196, 1.78197, 1.88793, 2.0002, 2.11913, 2.24514, 2.37865, 2.52009, 2.66994, 2.8287, 2.99691, 3.17511, 3.36391, 3.56394, 3.77587, 4.00039, 4.23827, 4.49029, 4.75729, 5.04018, 5.33988, 5.65741, 5.99381, 6.35022, 6.72783, 7.12789, 7.55173, 8.00078, 8.47653, 8.98057, 9.51459, 10.08035, 10.67976, 11.31481, 11.98763, 12.70045, 13.45566, 14.25577, 15.10346, 16.00156, 16.95307, 17.96115, 19.02917, 20.16071, 21.35952, 22.62963, 23.97526, 25.4009, 26.91131, 28.51155, 30.20693, 32.00313, 33.90613, 35.9223, 38.05835, 40.32141, 42.71905, 45.25926, 47.95051];
	this.instrumentBank = [wavetable_wobbly, wavetable_wobbly];
	this.bps = 1;
	//Mono by Default for speed
	this.channels = 2;
	/* Playback Variables */
	this.sequencePosition = 0;
	this.sequenceLength = 0;
	this.isPlaying = false;
	this.frameLength = 0;
	this.activeNotes = [[], []];
	//This is where you send keyboard inputs to avoid blank notes being inputted :)
	this.keyboardState = [];
	//This is comprised of dictionaries because it takes up less memory than 512 numbers :)
	this.keyPositions = [{}, {}];
	/*Arpeggio Related Info*/
	this.hasArpeggio = [false, false];
	this.arpeggioSpeed = [1.0, 1.0];
	this.arpeggioPosition = [0, 0];
	/*Metronome Playback*/
	this.metronomePlaying = false;
	this.metronomeSteps = 0;
	//Master Volume is a value between 0 and 2
	this.masterVolume = 1.0;
	this.numTracks = 2;
	this.trackVolumes = [[1.0, 1.0], [1.0, 1.0]];
	this.isMuted = [false, false];
	this.instrumentVolumes = [1.0, 1.0];
	this.sequencer = new Sequence();
	console.log("Composer Object Created");
}

Composer.prototype.setBpm = function (val) {
	if (typeof (val) == 'number') {
		this.bps = 60 / val;
		console.log("BPM Has Been Set to: " + val);
		return 1;
	}
	return 0;
};

Composer.prototype.setMasterVolume = function (val) {
	//masterVolume is a float between 0 and 2
	if (typeof (val) === 'number' && val >= 0 && val <= 2) {
		console.log("Master Volume changed to: " + val);
		this.masterVolume = val;
		return 1;
	} else {
		console.log("Volume change failed! value:" + val);
		return 0;
	}
};

Composer.prototype.getBpm = function () {
	return 60 / this.bps;
};

Composer.prototype.getMasterVolume = function () {
	return this.masterVolume;
};

Composer.prototype.panTrack = function (trackNo, val) {
	if (trackNo < 0) {
		console.log("Track Number must be positive");
		return;
	}
	if (val > 1 || val < 0) {
		console.log("Value out of range! " + val);
		return;
	}
	if (trackNo >= this.numTracks) {
		console.log("Track Does Not Exist!");
		return;
	}
	//this seemed to be the most efficient way to do this
	if (val < 0.5) {
		this.trackVolumes[trackNo][1] = val * 2;
		this.trackVolumes[trackNo][0] = 1.0;
	} else if (val > 0.5) {
		this.trackVolumes[trackNo][0] = (1 - val) * 2;
		this.trackVolumes[trackNo][1] = 1.0;
	} else {
		this.trackVolumes[trackNo] = [1.0, 1.0];
	}
	console.log("Successfully changed volumes for Track at Index " + trackNo + "!");
	console.log(this.trackVolumes[trackNo]);
}

Composer.prototype.getTrackPanning = function (trackNo) {
	if (trackNo >= this.numTracks) {
		console.log("Track does not exist");
		//Returns 0.5 as default so it doesn't break
		return 0.5
	} else {
		return 1 - (this.trackVolumes[trackNo][0] + this.trackVolumes[trackNo][0]);
	}
}

Composer.prototype.setNumberOfChannels = function (value) {
	if (typeof (value) == "number") {
		if (value >= 2) {
			this.channels = 2;
		} else {
			this.channels = 1;
		}
	}
};

Composer.prototype.getNumberOfChannels = function () {
	return this.channels;
};

Composer.prototype.getArpeggioState = function (track) {
	return this.hasArpeggio[track];
};

Composer.prototype.setArpeggioState = function (track, value) {
	console.log("Setting arp for track " + track + " to " + value);
	this.hasArpeggio[track] = value;
};

Composer.prototype.getArpeggioSpeed = function (track) {
	return this.arpeggioSpeed[track];
};

Composer.prototype.setArpeggioSpeed = function (track, value) {
	console.log("Setting Arpeggio at position: " + track + " to " + value);
	if (value < 0) return;
	this.arpeggioSpeed[track] = value;
};

Composer.prototype.setTrackMuteState = function (track, value) {
	console.log("Set track: " + track + " Mute State to: " + value);
	this.isMuted[track] = value;
}

Composer.prototype.getTrackMuteState = function (track) {
	return this.isMuted[track];
}

Composer.prototype.generateAudioData = function (totalBufferSize, frameSize) {
	//Safety Checks
	let temp_val = this.instrumentBank.length;
	if (this.activeNotes.length < temp_val) {
		while (this.activeNotes.length < temp_val) {
			this.activeNotes.push([]);
		}
	}
	if (this.keyPositions.length < temp_val) {
		while (this.keyPositions.length < temp_val) {
			this.keyPositions.push({});
		}
	}
	//Had to separate this from the Play method in order to streamline the MP3 renderer
	//Basically in order to mitigate this sounding crap, I have to now make audio streams for every instrument and perform a mixing operation at the very end :)
	let instrument_streams = [];
	let isUpdated = [];
	for (let i = 0; i < this.instrumentBank.length; i++) {
		let instrument_stream = new Array(totalBufferSize).fill(0);
		instrument_streams.push(instrument_stream);
		isUpdated.push(false);
	}

	console.log(instrument_streams.length)
	//I Really hope this works because if it doesn't I'm all out of ideas

	//Processing time :)
	let framePosition = 0;
	let step = this.sequencePosition;
	for (; step < this.sequenceLength; step++) {
		let tempNotes = this.sequencer.getData(step);
		for (let i = 0; i < tempNotes.length; i++) {
			if (tempNotes[i].indexOf(' ') != -1 || this.isMuted[tempNotes[i][0]]) {
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
			if (tempNotes[i][0] >= this.instrumentBank.length) {
				console.log("This instrument is not defined: " + tempNotes[i][0]);
				continue;
			}
			if (tempNotes[i][2] == 1) {
				if (this.loadedInstruments[tempNotes[i][0]].type === 0) {
					/*Wavetable Synth*/
					if (tempNotes[i][1] < 24 || tempNotes[i][1] > 127) {
						//Unplayable notes - They are not added to the activeNotes list
						continue;
					}
					if (this.activeNotes[tempNotes[i][0]].indexOf(tempNotes[i][1]) == -1) {
						//Note isn't already Playing
						//Input notes in order for the arpeggiator so it sounds decent
						if (this.activeNotes[tempNotes[i][0]].length == 0) {
							this.activeNotes[tempNotes[i][0]].push(tempNotes[i][1]);
						} else {
							let j = 0;
							let wasadded = false;
							while (j < this.activeNotes[tempNotes[i][0]].length) {
								if (this.activeNotes[tempNotes[i][0]][j] > tempNotes[i][1]) {
									this.activeNotes[tempNotes[i][0]].splice(j, 0, tempNotes[i][1]);
									wasadded = true;
									break;
								}
								j++;
							}
							if (!wasadded) this.activeNotes[tempNotes[i][0]].push(tempNotes[i][1]);
						}
					}
					//Need to record two key Positions at any time so the new wavetable system can work correctly
					this.keyPositions[tempNotes[i][0]][tempNotes[i][1]] = 0;
				} else {
					//Drum Specific stuff
					let note = tempNotes[i][1] % this.instrumentBank[tempNotes[i][0]].length;
					if (this.activeNotes[tempNotes[i][0]].indexOf(tempNotes[i][1] % this.instrumentBank[tempNotes[i][0]].length) == -1) {
						this.activeNotes[tempNotes[i][0]].push(tempNotes[i][1] % this.instrumentBank[tempNotes[i][0]].length);
					}
					this.keyPositions[tempNotes[i][0]][note] = 0;
				}
			} else {
				//Note Off
				//Drums Are Triggered not Gated
				if (this.loadedInstruments[tempNotes[i][0]].type !== 0) {
					continue;
				}
				let position = this.activeNotes[tempNotes[i][0]].indexOf(tempNotes[i][1]);
				//Check if it's in the instrument, this is to deal with fragments if they do happen to exist
				if (position != -1) {
					this.activeNotes[tempNotes[i][0]].splice(position, 1);
				}
			}
		}
		let notesPerInstrument = [];
		for (let i = 0; i < this.activeNotes.length; i++) {
			notesPerInstrument.push(this.activeNotes[i].length);
		}
		let ended_instruments = 0;
		for (let i = 0; i < frameSize; i++) {
			ended_instruments = 0;
			for (let j = 0; j < this.activeNotes.length; j++) {
				if (this.activeNotes[j].length == 0) {
					continue;
				}
				isUpdated[j] = true;
				if (this.loadedInstruments[j]["type"] === 0) {
					//Wavetables
					if (this.hasArpeggio[j] || notesPerInstrument[j] == 0) {
						this.arpeggioPosition[j] %= notesPerInstrument[j];
						let note = this.activeNotes[j][Math.floor(this.arpeggioPosition[j])];
						this.keyPositions[j][note] = (this.keyPositions[j][note] + this.keyfreqs[note]) % this.instrumentBank[j].length;
						let lower = Math.floor(this.keyPositions[j][note]);
						let upper = Math.floor(this.keyPositions[j][note] + 1) % this.instrumentBank[j].length;
						instrument_streams[j][framePosition + i] = Math.min(Math.max(this.instrumentVolumes[j] * ((this.instrumentBank[j][lower] + ((this.instrumentBank[j][upper] - this.instrumentBank[j][lower]) * (this.keyPositions[j][note] % 1)))), -1), 1);
					} else {
						for (let k = 0; k < notesPerInstrument[j]; k++) {
							let note = this.activeNotes[j][k];
							this.keyPositions[j][note] = (this.keyPositions[j][note] + this.keyfreqs[note]) % this.instrumentBank[j].length;
							let lower = Math.floor(this.keyPositions[j][note]);
							let upper = Math.floor(this.keyPositions[j][note] + 1) % this.instrumentBank[j].length;
							instrument_streams[j][framePosition + i] = Math.min(Math.max(this.instrumentVolumes[j] * ((this.instrumentBank[j][lower] + ((this.instrumentBank[j][upper] - this.instrumentBank[j][lower]) * (this.keyPositions[j][note] % 1)))), -1), 1);
						}
						instrument_streams[j][framePosition + i] /= notesPerInstrument[j];
					}
				} else {
					//Drum Machine
					let dead_instruments = [];
					for (let k = 0; k < notesPerInstrument[j]; k++) {
						let note = this.activeNotes[j][k];
						this.keyPositions[j][note]++;
						instrument_streams[j][framePosition + i] = Math.min(Math.max(this.instrumentVolumes[j] * this.instrumentBank[j][note][this.keyPositions[j][note]], -1), 1);
						if (this.keyPositions[j][note] == (this.instrumentBank[j][note].length - 1)) {
							ended_instruments++;
							dead_instruments.push(note);
						}
					}
					//Purge dead instruments, This is performed for drumkits as they are triggered rather than gated.
					//It also guarantees that it doesn't sound like complete muck to the listener
					if (ended_instruments > 0) {
						for (let k = 0; k < dead_instruments.length; k++) {
							this.activeNotes[j].splice(this.activeNotes[j].indexOf(dead_instruments[k]), 1);
							notesPerInstrument[j]--;
						}
					}
				}
			}
		}
		for (let i = 0; i < this.arpeggioPosition.length; i++) {
			if (isNaN(this.activeNotes[i].length) || this.activeNotes[i].length == 0) {
				continue;
			}
			this.arpeggioPosition[i] = (this.arpeggioPosition[i] + this.arpeggioSpeed[i]) % this.activeNotes[i].length;
		}
		framePosition += frameSize;
	}
	return { audiodata: instrument_streams, isUpdated: isUpdated };
}

Composer.prototype.__play = function () {
	let frameSize = Math.floor(audioctx.sampleRate * this.bps * 0.03125);
	this.sequenceLength = this.sequencer.getLength();
	let totalFrames = this.sequenceLength - this.sequencePosition;
	let totalBufferSize = frameSize * totalFrames;
	console.log(totalFrames + " " + totalBufferSize + " " + frameSize);
	if (totalBufferSize == 0 || isNaN(totalBufferSize)) {
		console.log("Buffer is empty: Nothing to Play!");
		return;
	}

	//Unlike Before, I must perform a summation operation at the end and then divide them the total to perform passive mixing :)
	let audiodata = this.generateAudioData(totalBufferSize, frameSize);
	let instrument_streams = audiodata.audiodata;
	let isUpdated = audiodata.isUpdated;
	let totalInstrumentVolume = 0;
	for (let j = 0; j < this.instrumentBank.length; j++) {
		if (isUpdated[j]) {
			totalInstrumentVolume += this.instrumentVolumes[j];
		}
	}
	let myArrayBuffer = audioctx.createBuffer(this.channels, totalBufferSize, audioctx.sampleRate);
	if (this.channels == 1) {
		//Mono
		let nowBuffering = myArrayBuffer.getChannelData(0);
		for (let i = 0; i < totalBufferSize; i++) {
			if (totalInstrumentVolume == 0) {
				while (i < totalBufferSize) {
					nowBuffering[i] = 0;
					i++;
				}
				break;
			}
			for (let j = 0; j < this.instrumentBank.length; j++) {
				nowBuffering[i] += this.masterVolume * instrument_streams[j][i];
			}
			nowBuffering[i] /= totalInstrumentVolume;
		}
	} else {
		//Stereo
		let left = myArrayBuffer.getChannelData(0);
		let right = myArrayBuffer.getChannelData(1);
		for (let i = 0; i < totalBufferSize; i++) {
			//check if instrument is Playing in frame and then do the lovely calculations
			if (totalInstrumentVolume == 0) {
				while (i < totalBufferSize) {
					left[i] = 0;
					right[i] = 0;
					i++;
				}
				break;
			}
			for (let j = 0; j < this.instrumentBank.length; j++) {
				left[i] += this.masterVolume * this.trackVolumes[j][0] * instrument_streams[j][i];
				right[i] += this.masterVolume * this.trackVolumes[j][1] * instrument_streams[j][i];
			}
			left[i] /= totalInstrumentVolume;
			right[i] /= totalInstrumentVolume;
		}
	}
	console.log("Playing!");
	this.isPlaying = true;
	let source = audioctx.createBufferSource();
	source.buffer = myArrayBuffer;
	source.connect(audioctx.destination);
	source.start();
	source.onended = () => { this.stop() };
}

Composer.prototype.play = function () {
	if (!this.isPlaying) {
		for (let i = 0; i < this.arpeggioPosition.length; i++) {
			this.arpeggioPosition[i] = 0;
		}
		console.log("Commencing playback!");
		this.__play();
	} else if (audioctx.state == "suspended") {
		console.log("Resuming Playback");
		audioctx.resume();
	}
};

Composer.prototype.pause = function () {
	if (audioctx.state == "running") {
		console.log("Pausing Playback");
		audioctx.suspend();
	}
}

Composer.prototype.stop = async function () {
	if (audioctx.state == "running" || audioctx.state == "suspended") {
		console.log("Stopped");
		await audioctx.close().then(() => {
			console.log("AudioContext Closed");
		});
		audioctx = new AudioContext();
	}
	this.activeNotes = [[], []];
	this.sequencePosition = 0;
	this.isPlaying = false;
	this.metronomePlaying = false;
}


Composer.prototype.seek = function (position) {
	if (typeof ("position") == "number") {
		console.log("Position set to: " + position);
		this.sequencePosition = Math.floor(position + 0.5);
	}
};

//Internal Recording process
Composer.prototype.__record = async function (trackNum) {
	console.log("Recording");
	this.isPlaying = true;
	let prevNotes = [];
	//Total Track Length is how many notes you can fit in 30s
	let totalTrackLength = (30 / this.bps) * 32;
	this.sequenceLength = totalTrackLength;
	this.sequencer.setLength(totalTrackLength);
	console.log("Track Length " + totalTrackLength + " Steps");
	for (let i = 0; i < totalTrackLength; i++) {
		//toneKeys is in a different file at the moment
		//but I'll heap it together soon
		let currNotes = this.keyboardState.slice();
		let nextNotes = [];
		//console.log("Previous Notes: "+prevNotes);
		//Add currently pressed notes to the sequence and remove notes
		//that are no longer playing
		for (let l = 0; l < currNotes.length; l++) {
			if (prevNotes.indexOf(currNotes[l]) == -1) {
				this.sequencer.addData(i, trackNum, currNotes[l], 1);
			}
			nextNotes.push(currNotes[l]);
		}
		for (let l = 0; l < prevNotes.length; l++) {
			if (nextNotes.indexOf(prevNotes[l]) == -1) {
				this.sequencer.addData(i, trackNum, prevNotes[l], 0);
			}
		}
		prevNotes = nextNotes.slice();
		//Sleeps for now, going to have it do something else soon ;)
		// TODO: Play single track audio
		await sleep(Math.floor(this.bps * 0.03125 * 1000));
		if (this.isPlaying == false) {
			break;
		}
	}
	console.log("Recording finished");
	this.isPlaying = false;
	this.stop();
	this.metronomePlaying = false;
	this.metronomeSteps = 0;
};

Composer.prototype.record = async function (trackNum) {
	//Flushing this for good reason :)
	this.sequencePosition = 0;
	for (let i = 0; i < this.keyPositions.length; i++) {
		this.keyPositions[i] = {};
	}
	if (trackNum < 0) {
		console.log("Invalid track number");
		return;
	}
	if (trackNum >= this.numTracks) {
		for (; this.numTracks < trackNum; this.numTracks++) {
			this.trackVolumes.push([1.0, 1.0]);
		}
		this.numTracks = trackNum;
	}
	if (!this.metronomePlaying) {
		//Play four beeps of a metronome at the pace of the song before input
		//Add Arpeggio increments
		let frameCount = 4 * Math.floor(audioctx.sampleRate * this.bps);
		let myArrayBuffer = audioctx.createBuffer(this.channels, frameCount, audioctx.sampleRate);
		for (let channel = 0; channel < this.channels; channel++) {
			let nowBuffering = myArrayBuffer.getChannelData(channel);
			for (let i = 0; i < this.bps * 4 * 44100; i += this.bps * 44100) {
				for (let l = 0; l < this.bps * 44100; l++) {
					if (l >= metronome.length) {
						while (l < this.bps * 44100) {
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
		source.onended = () => { this.__record(trackNum) };
	} else {
		let tempSteps = this.metronomeSteps * 1;
		while ((this.metronomeSteps - tempSteps) < 4) {
			await sleep(50);
		}
		this.__record(trackNum);
	}
};

Composer.prototype.playMetronome = async function () {
	/*Basically the way this will work is that it'll get rid of the four leading metronome beats if the metronome is already playing :)*/
	this.metronomePlaying = true;
	let duration = Math.floor(this.bps * audioctx.sampleRate);
	let myArrayBuffer = audioctx.createBuffer(1, duration, audioctx.sampleRate);
	let nowBuffering = myArrayBuffer.getChannelData(0);
	for (let i = 0; i < duration; i++) {
		if (i < metronome.length) {
			nowBuffering[i] = metronome[i];
		} else {
			while (i < duration) {
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
	source.onended = () => { this.playMetronome(); this.metronomeSteps++; };
};

Composer.prototype.setTrackInstrument = function (trackNo, instrumentData) {
	if (this.loadedInstruments.length > trackNo) {
		this.loadedInstruments.splice(trackNo, 1, instrumentData);
	} else if (this.loadedInstruments.length == trackNo) {
		this.loadedInstruments.push(instrumentData);
	}
	this.numTracks = this.loadedInstruments.length;
	this.fetchInstrument(instrumentData);
}

Composer.prototype.fetchInstrument = function (instrument) {
	for (let i = 0; i < this.loadedInstruments.length; i++) {
		if (this.loadedInstruments[i].isLoaded == false) {
			//TODO Make serverside fetch
		}
	}
};

Composer.prototype.clearTrack = function (trackNo) {
	//Wrapper function for the sequencer class for easier access
	this.sequencer.removeInstrument(trackNo);
};

Composer.prototype.saveData = function () {
	// TODO: Actually Save
	let sequencerData = this.sequencer.getTrackData();
	let saveFile = {
		instruments: this.loadedInstruments,
		bps: this.bps,
		channels: this.channels,
		numberOfTracks: this.numTracks,
		instrumentVolumes: this.instrumentVolumes,
		trackVolumes: this.trackVolumes,
		hasArpeggio: this.hasArpeggio,
		arpeggioSpeed: this.arpeggioSpeed,
		sequenceData: sequencerData
	};
	console.log("Save Data Created");
	return JSON.stringify(saveFile);
};

Composer.prototype.loadData = function (saveDataString) {
	if (saveDataString.length == 0) {
		console.log("Failed to save! Reason: No Data Passed");
		return;
	}
	let saveData = JSON.parse(saveDataString);
	if (typeof (saveData.instruments) != "undefined") {
		this.loadedInstruments = saveData.instruments;
	}
	if (typeof (saveData.bps) != "undefined") {
		this.bps = saveData.bps;
	}
	if (typeof (saveData.channels) != "undefined") {
		this.channels = saveData.channels;
	}
	if (typeof (saveData.numTracks) != "undefined") {
		this.numTracks = saveData.numberOfTracks;
	}
	if (typeof (saveData.insturmentVolumes) != "undefined") {
		this.instrumentVolumes = saveData.instrumentVolumes;
	}
	if (typeof (saveData.trackVolumes) != "undefined") {
		this.trackVolumes = saveData.trackVolumes;
	}
	if (typeof (saveData.hasArpeggio) != "undefined") {
		this.hasArpeggio = saveData.hasArpeggio;
	}
	if (typeof (saveData.arpeggioSpeed) != "undefined") {
		this.arpeggioSpeed = saveData.arpeggioSpeed;
	}
	if (typeof (saveData.sequenceData) != "undefined") {
		this.sequencer.loadTrackData(saveData.sequenceData);
	}
	console.log("Loaded!");
};

Composer.prototype.renderMp3 = function (filename) {
	/*This will use lamejs https://github.com/zhuker/lamejs*/
	console.log("Rendering Mp3");
	this.sequencePosition = 0;
	let totalFrames = this.sequencer.getLength();
	let frameLength = Math.floor(44100 * 0.03125 * this.bps);
	let totalBufferSize = totalFrames * frameLength;
	let returnData = this.generateAudioData(totalBufferSize, frameLength);
	//Encode at 320 for highest quality Mp3
	let mp3Encoder = new lamejs.Mp3Encoder(this.channels, 44100, 320);
	let totalInstrumentVolume = 0;
	let isUpdated = returnData.isUpdated;
	let instrument_streams = returnData.audiodata;
	console.log(instrument_streams.length)

	for (let i = 0; i < this.instrumentBank.length; i++) {
		if (isUpdated[i]) totalInstrumentVolume++;
	}
	let mp3Data = [];
	if (this.channels == 1) {
		//Mono
		console.log("Generating Mono Track");
		//console.log(instrument_streams)
		let samples = new Int16Array(totalBufferSize);
		for (let i = 0; i < instrument_streams[0].length; i++) {
			let temp = 0;
			for (let j = 0; j < instrument_streams.length; j++) {
				temp += instrument_streams[j][i];
			}
			temp /= totalInstrumentVolume;
			if (temp < 0) {
				temp = Math.floor(temp * 0x8000);
			} else {
				temp = Math.floor(temp * 0xFFFF);
			}
			samples[i] = temp;
		}
		for (let i = 0; i < samples.length; i += 576) {
			let sampleChunk = samples.subarray(i, i + 576);
			let mp3buf = mp3Encoder.encodeBuffer(sampleChunk);

			if (mp3buf.length > 0) {
				mp3Data.push(mp3buf);
			}
		}
		let mp3buf = mp3Encoder.flush();
		if (mp3buf.length > 0) {
			mp3Data.push(new Int8Array(mp3buf));
		}
	} else {
		//Stereo
		console.log("Generating Stereo Track");
		let left = new Int16Array(totalBufferSize);
		let right = new Int16Array(totalBufferSize);
		let samples = new Int16Array(totalBufferSize);
		for (let i = 0; i < instrument_streams[0].length; i++) {
			let templeft = 0;
			let tempright = 0;
			for (let j = 0; j < instrument_streams.length; j++) {
				templeft += instrument_streams[j][i] * this.trackVolumes[j][0];
				tempright += instrument_streams[j][i] * this.trackVolumes[j][1];
			}
			templeft /= totalInstrumentVolume;
			tempright /= totalInstrumentVolume;
			if (templeft < 0) {
				templeft = Math.floor(templeft * 0x8000);
			} else {
				templeft = Math.floor(templeft * 0xFFFF);
			}
			if (tempright < 0) {
				tempright = Math.floor(tempright * 0x8000);
			} else {
				tempright = Math.floor(tempright * 0xFFFF);
			}
			left[i] = templeft;
			right[i] = tempright;
		}
		for (let i = 0; i < samples.length; i += 576) {
			let leftChunk = left.subarray(i, i + 576);
			let rightChunk = right.subarray(i, i + 576);
			let mp3buf = mp3Encoder.encodeBuffer(leftChunk, rightChunk);
			if (mp3buf.length > 0) {
				mp3Data.push(mp3buf);
			}
		}
		let mp3buf = mp3Encoder.flush();
		if (mp3buf.length > 0) {
			mp3Data.push(new Int8Array(mp3buf));
		}
	}
	var blob = new Blob(mp3Data, { type: 'audio/mp3' });
	var url = window.URL.createObjectURL(blob);
	if (!filename.endsWith(".mp3")) {
		filename += ".mp3";
	}
	let timestamp = new Date().getTime();
	let audioFile = new File([blob], filename, { lastModified: timestamp, type: blob.type });
	console.log("Mp3 File created");
	window.open(URL.createObjectURL(audioFile));
};

Composer.prototype.loadTestData = function () {
	this.sequencer.loadDummyData();
};

export default Composer;