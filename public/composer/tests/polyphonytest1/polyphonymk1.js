const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioctx = new AudioContext();

let keyfreqs = [0.03125,0.03311,0.03508,0.03716,0.03937,0.04171,0.04419,0.04682,0.04961,0.05256,0.05568,0.05899,0.0625,0.06622,0.07015,0.07432,0.07874,0.08343,0.08839,0.09364,0.09921,0.10511,0.11136,0.11798,0.125,0.13243,0.14031,0.14865,0.15749,0.16685,0.17677,0.18729,0.19842,0.21022,0.22272,0.23596,0.25,0.26486,0.28061,0.2973,0.31497,0.3337,0.35355,0.37457,0.39684,0.42044,0.44544,0.47193,0.49999,0.52972,0.56122,0.59459,0.62995,0.66741,0.70709,0.74914,0.79369,0.84088,0.89088,0.94386,0.99998,1.05945,1.12244,1.18919,1.2599,1.33482,1.41419,1.49828,1.58737,1.68176,1.78177,1.88772,1.99997,2.11889,2.24489,2.37837,2.5198,2.66963,2.82838,2.99656,3.17475,3.36353,3.56353,3.77543,3.99993,4.23778,4.48977,4.75675,5.0396,5.33927,5.65676,5.99313,6.3495,6.72706,7.12707,7.55087,7.99986,8.47556,8.97954,9.5135,10.0792,10.67854,11.31352,11.98625,12.69899,13.45411,14.25414,15.10173,15.99973,16.95112,17.95909,19.02699,20.1584,21.35708,22.62703,23.97251,25.39799,26.90823,28.50828,30.20347,31.99946,33.90224,35.91818,38.05398,40.31679,42.71415,45.25407,47.94501];
function test1() {
	let testseq = [[60,1],[64,1],[67,1]];
	let channels = 2;
	let frameCount = audioctx.sampleRate;
	let myArrayBuffer = audioctx.createBuffer(channels,frameCount,audioctx.sampleRate);
	for (let channel = 0; channel < channels; channel++) {
		let nowBuffering = myArrayBuffer.getChannelData(channel);
		let freq1 = keyfreqs[testseq[0][0]];
		let freq2 = keyfreqs[testseq[1][0]];
		let freq3 = keyfreqs[testseq[2][0]];
		let l1 = 0;
		let l2 = freq2;
		let l3 = freq3 * 2;
		for(let i = 0; i < frameCount; i+=3) {
			nowBuffering[i] = wavetable[Math.floor(l1)];
			nowBuffering[i + 1] = wavetable[Math.floor(l2)];
			nowBuffering[i + 2] = wavetable[Math.floor(l3)];
			l1 += 3 * freq1;
			if(l1 >= wavetable.length) {
				l1 -= wavetable.length;
			}
			l2 += 3 * freq2;
			if(l2 >= wavetable.length) {
				l2 -= wavetable.length;
			}
			l3 += 3 * freq3;
			if(l3 >= wavetable.length) {
				l3 -= wavetable.length;
			}
		}
	}
	let source = audioctx.createBufferSource();
	source.buffer = myArrayBuffer;
	source.connect(audioctx.destination);
	source.start();
}

function test2() {
	/* Mark one Polyphony test (Basically all the notes are Gated and all last a given timeframe)*/
	let bps = 60/364;
	let sequence = [[60,54,48,47],[0],[60,54,48],[0],[67,54,52],[0],[0],[54,47,44],[58,54,47,46],[0],[54,46],[0],[65,54,52],[0],[54,45],[54,46,45],[0],[60,54],[0],[60,54,48],[0],[67,54,52],[0],[0],[54,47],[58,54,47,46],[0],[58,54],[54,47],[54,42,47],[0],[76,55,54,47],[54,47]];
	let channels = 2;
	let frameCount = Math.round(bps * sequence.length * audioctx.sampleRate);
	let myArrayBuffer = audioctx.createBuffer(channels,frameCount,audioctx.sampleRate);
	let stepLength = Math.round(audioctx.sampleRate * bps);
	let wtLength = wavetable.length;
	for (let channel = 0; channel < channels; channel++) {
		let nowBuffering = myArrayBuffer.getChannelData(channel);
		let offset = 0;
		/* Polyphony Setup (It's very gross)*/
		for (let sequencePos = 0; sequencePos < sequence.length; sequencePos++) {
			let tableStep = [];
			let wavePos = [];
			for(let i = 0; i < sequence[sequencePos].length; i++) {
				if (sequence[sequencePos][i] != 0) {
					tableStep.push(keyfreqs[sequence[sequencePos][i]]);
					wavePos.push(i * tableStep[i]);
				} else {
					tableStep.push(0);
					wavePos.push(0);
				}
			}
			let noteStep = sequence[sequencePos].length;
			for(let i = 0; i < stepLength; i+= noteStep) {
				for(let j = 0; j < noteStep; j++) {
					nowBuffering[offset + i + j] = wavetable[Math.floor(wavePos[j])];
					wavePos[j] = wavePos[j] + (noteStep * tableStep[j]);
					if (wavePos[j] >= wtLength) {
						wavePos[j] -= wtLength;
					}
				}
			}
			offset += stepLength;
		}
	}
	let source = audioctx.createBufferSource();
	source.buffer = myArrayBuffer;
	source.connect(audioctx.destination);
	source.start();
}

function test3() {
	/* New form of audio data test */
	/* structure of a single flag in the audio data
		key instrument flag
		key: frequency is stored as the Midi Value (0-127)
		instrument: position of wavetable for the instrument required
		flag: what is being done to what
		0 - End Note
		1 - Begin Note
		2 - Reset Note (Press again)
		These flags will be stored in an array which will store the audio data in a hashmap and will be accessible/accessed every 32nd of a 4/4 note

		Additional useful numbers
		1/32 = 0.03125
	*/
	/* Demonstration will use lavender town from pokemon */
	let bps = 60/120;
	let length = 48;
	let channels = 2;
	/* Create Zeroed Array to store table positions for *Every* note (This is to reduce the need for other operations :) ) */
	let phases = Array.apply(null, Array(128)).map(function(x, i){return 0});
	let phases2 = Array.apply(null, Array(128)).map(function(x, i){return 0});
	/*Create new dictionary*/
	let sequence = {};
	for (i = 0; i < 13; i++) {
		let offset = 128 * i;
		sequence[offset] = [[60,0,1]];
		sequence[offset + 8] = [[60,0,0]];
		sequence[offset + 32] = [[67,0,1]];
		sequence[offset + 40] = [[67,0,0]];
		sequence[offset + 64] = [[71,0,1]];
		sequence[offset + 72] = [[71,0,0]];
		sequence[offset + 96] = [[66,0,1]];
		sequence[offset + 104] = [[66,0,0]];
	}
	sequence[512].push([67,1,1]);
	sequence[576].push([67,1,3]);
	sequence[640].push([67,1,0]);
	sequence[640].push([64,1,1]);
	sequence[704].push([64,1,3]);
	sequence[768].push([64,1,0]);
	sequence[768].push([67,1,1]);
	sequence[800].push([67,1,0]);
	sequence[800].push([66,1,1]);
	sequence[832].push([66,1,0]);
	sequence[832].push([64,1,1]);
	sequence[864].push([64,1,0]);
	sequence[864].push([71,1,1]);
	sequence[896].push([71,1,0]);
	sequence[896].push([61,1,1]);
	sequence[960].push([61,1,3]);
	sequence[1024].push([61,1,0]);
	sequence[1024].push([67,1,1]);
	sequence[1088].push([67,1,3]);
	sequence[1152].push([67,1,0]);
	sequence[1152].push([66,1,1]);
	sequence[1216].push([66,1,3]);
	sequence[1280].push([66,1,0]);
	sequence[1280].push([71,1,1]);
	sequence[1312].push([71,1,0]);
	sequence[1312].push([67,1,1]);
	sequence[1344].push([67,1,0]);
	sequence[1344].push([66,1,1]);
	sequence[1376].push([66,1,0]);
	sequence[1376].push([71,1,1]);
	sequence[1408].push([71,1,0]);
	sequence[1408].push([72,1,1]);
	sequence[1472].push([72,1,3]);
	sequence[1536].push([72,1,0]);

	let frameCount = Math.round(bps * length * audioctx.sampleRate);
	let myArrayBuffer = audioctx.createBuffer(channels,frameCount,audioctx.sampleRate);
	let wavetables = [wavetable, wavetable_wobbly];
	/* This is VERY important, basically the track is getting filled
	in a linear fashion but this check must be performed ever 1/32nd
	of a note so the end user has more control over what gets played and stuff*/
	let stepLength = Math.round(audioctx.sampleRate * bps * 0.03125);
	/*Lets begin filling the notes*/
	let keydata = [phases, phases2];
	console.log(keydata);
	let activenotes = [[],[]];
	let amp = [1,0.333333];
	/*Channel Stuff lol*/
	for (let channel = 0; channel < channels; channel++) {
			let position = 0;
			let nowBuffering = myArrayBuffer.getChannelData(channel);
			let totalSteps = length * 44;
			for (let step = 0; step < totalSteps; step++) {
				//time to read in the all important data
				if(typeof(sequence[step]) !== 'undefined') {
					for(let i = 0; i < sequence[step].length; i++) {
						if(sequence[step][i][2] == 0) {
							//Clear Note Data
							keydata[sequence[step][i][1]][sequence[step][i][0]] = 0;
							activenotes[sequence[step][i][1]].splice(activenotes[sequence[step][i][1]].indexOf(activenotes[sequence[step][i][0]]),1);
							console.log(step + " Note: "+sequence[step][i][0] +" Was Cleared");
						} else if(sequence[step][i][2] == 1) {
							//New Note Data
							activenotes[sequence[step][i][1]].push(sequence[step][i][0]);
							console.log(step + " Note: "+sequence[step][i][0] +" Was Added");
						} else if(sequence[step][i][2] == 3) {
							// Reset Note
							keydata[sequence[step][i][1]][sequence[step][i][0]] = 0;
							console.log(step + " Note: "+sequence[step][i][0] +" Was Reset");
						}
					}
				}
				let totalNotes = activenotes[0].length + activenotes[1].length;
				/* Time to actually load the buffer*/
				if(totalNotes == 0) {
					/*Case that there's no notees currently playing */
					for(let i = 0; i < stepLength; i++) {
						nowBuffering[position + i] = 0;
					}
				} else {
					for(let i = 0; i < stepLength; i += totalNotes) {
						let note_place = 0;
						// j represents the different instruments
						for(let j = 0; j < 2; j++) {
							if(activenotes[j].length == 0) {
								continue;
							}
							for(let k = 0; k < activenotes[j].length; k++) {
								let currentNote = keydata[j][activenotes[j][k]];
								currentNote += totalNotes * keyfreqs[activenotes[j][k]];
								if(currentNote > wavetables[j].length) {
									currentNote -= wavetables[j].length;
								}
								nowBuffering[position + i + note_place] =  amp[j] * wavetables[j][Math.floor(currentNote) + note_place];
								keydata[j][activenotes[j][k]] = currentNote;
								note_place++;
							}
						}
					}
				}
				position += stepLength;
			}
	}
	let source = audioctx.createBufferSource();
	source.buffer = myArrayBuffer;
	source.connect(audioctx.destination);
	source.start();
}
