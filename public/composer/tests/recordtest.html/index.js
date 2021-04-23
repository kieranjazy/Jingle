
const composer = new Composer();
const toneKeys = ["KeyA","KeyW","KeyS","KeyE","KeyD","KeyF", "KeyT", "KeyG", "KeyY", "KeyH", "KeyU","KeyJ", "KeyZ","KeyX"];
let octave = 4;
let activeNotes = [];
window.onload = function() {
	navigator.keyboard.lock(toneKeys);
}

window.onkeydown = function(event) {
	if (toneKeys.includes(event.code)) {
		let index = toneKeys.indexOf(event.code);
		switch(index) {
			case 12:
				if(octave>0) {
					console.log("Octave Down");
					activeNotes = [];
					octave--;
				}
				break;
			case 13:
				if(octave<9) {
					console.log("Octave Up");
					activeNotes = [];
					octave++;
				}
				break;
			default:
				let note = ((octave + 1) * 12) + index;
				if(activeNotes.indexOf(note)==-1) {
					activeNotes.push(note);
					console.log(activeNotes);
				}
				break;
		}
	}
}

window.onkeyup = function(event) {
	if(toneKeys.includes(event.code)) {
		let index = toneKeys.indexOf(event.code);
		switch(index) {
			case 12:
			case 13:
				break;
			default:
				let note = ((octave + 1) * 12) + index;
				let nindex = activeNotes.indexOf(note);
				if(nindex!=-1) {
					activeNotes.splice(nindex,1);
					console.log(activeNotes);
				}
				break;
		}
	}
}

function record() {
	console.log("Record");
	composer.record(0);
}

function modifyBPM() {
	let bpm = Number.parseInt(document.getElementById("bpmval").value);
	composer.setBpm(bpm);
}

function dumpRecording() {
	composer.saveData();
}

function play() {
	composer.play();
}

function stop() {
	composer.stop();
}

function pause() {
	composer.pause();
}

function demo() {
	composer.loadTestData();
}
