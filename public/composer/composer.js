/*
 *	composer.js
 *	Version 2
 *	Last Edited by Daniel Hannon (danielh2942) on 28/01/2021
 *
 *	Abstract: This is to handle all inputs from the GUI
 *	I aspire to make it WebMidi compatible by default.
 *
 *	Useful resources:
 *	WebMidi Documentation: https://webaudio.github.io/web-midi-api/
 *	WebAudio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
 */

 //Set this up by using something like "const composer = new Composer();"

//Load in WebAudio
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioctx = new AudioContext();

function Composer() {
	this.sequence = {};
	this.running = 0;
	this.bpm = 60;
	this.audioStep = 0;
	this.channels = 2;
	this.instruments = {
		{
			name:"01_Synth_lead",
			isBuffered:False,
			data:NULL
		}
	};
	this.freqTable = fetch("keyfreqs.json").then((response)=>response.json()).then((responseJson)=>{return responseJson});
}

Composer.seek(position) {
	this.audioStep = position;
}

Composer.loadSequence(sequence) {
	this.sequence = sequence;
	this.audioStep = 0;
}

Composer.prototype.playSequence() {
		this.playMonoNote(this.sequence[0][this.audioStep][0],this.sequence[1],this.sequence[0][this.audioStep][1])
}

Composer.prototype.startStop() {
	if (this.running == 0) {
		this.running = 1;
	} else {
		this.running = 0;
	}
}

Composer.prototype.getBps() {
	return this.bpm * 0.16666666;
}

Composer.prototype.fetchInstrument(instrument) {
	/*
	 *	Basically This is being done because wavetables are big and
	 *	if we end up having a lot of wavetables it will take up a LOT
	 *	of memory and that is not something we want to happen
	 */
	return fetch(("/wavetables/"+instrument.name+".json"))
		.then((response) => response.json())
		.then((responseJson)=>{
			instrument.data = responseJson;
			if(instrument.data == NULL) {
				return False;
			}
			instrumet.isBuffered = True;
			return True;
		});
}

Composer.prototype.playMonoNote(noteindex, instrument, duration) {
	/*The reason we use note index rather than frequency is so that it is
	 *inherently compatable with WebMidi if we have time to implement it:
	 */
	// Check if the instrument has been loaded
	if(instrument.isBuffered == False) {
		await this.fetchInstrument(instrument);
	}
	// Basically this gets the exact amount of frames needed for the note
	// To play for a given duration by doing some multiplication as
	// Division is inheritly Slow :)let frameCount = duration * Math.floor(audioctx.sampleRate * __Composer_get_bps());
	let frameCount = duration * Math.floor(audioctx.sampleRate * this.getBps());
	let myArrayBuffer = audioctx.createBuffer(this.channels,frameCount,audioctx.sampleRate);
	let stepSize = this.freqTable[noteindex];
	let waveTableLength = instrument.waveTable.length;
	// This provides us with the actual data
	for(let channel = 0; channel < this.channels, channel++) {
		let nowBuffering = myArrayBuffer.getChannelData(channel);
		let l = 0;
		let m = 1;
		let freq = stepSize;
		for (let i = 0; i < frameCount; i++) {
			l = Math.floor(freq);
			m = l + 1;
			if (m >= waveTable.data.length) {
				m = 0;
			}
			nowBuffering[i] = waveTable.data[l] + ((waveTable.data[m] - waveTable[l]) * (freq - l));
			freq += stepSize;
			if (freq >= waveTable.data.length) {
				freq -= waveTable.data.length;
			}
		}
	}
	//Load into buffer and play
	let source = audioctx.createBufferSource();
	source.buffer = myArrayBuffer;
	source.connect(audioctx.destination);
	source.start();
	source.onended = () => {
		if(this.running == 1) {
			this.playSequence();
		}
	}
}
