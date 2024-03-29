
const composer = new Composer();
const toneKeys = ["KeyA","KeyW","KeyS","KeyE","KeyD","KeyF", "KeyT", "KeyG", "KeyY", "KeyH", "KeyU","KeyJ", "KeyZ","KeyX"];
let octave = 4;
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
					composer.keyboardState = [];
					octave--;
				}
				break;
			case 13:
				if(octave<9) {
					console.log("Octave Up");
					composer.keyboardState = [];
					octave++;
				}
				break;
			default:
				let note = ((octave + 1) * 12) + index;
				if(composer.keyboardState.indexOf(note)==-1) {
					composer.keyboardState.push(note);
					console.log(composer.keyboardState);
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
				let nindex = composer.keyboardState.indexOf(note);
				if(nindex!=-1) {
					composer.keyboardState.splice(nindex,1);
					console.log(composer.keyboardState);
				}
				break;
		}
	}
}

function record(trackNum) {
	console.log("Recording Track: " + trackNum);
	modifyBPM();
	composer.record(trackNum);
}

function modifyBPM() {
	let bpm = Number.parseInt(document.getElementById("bpmval").value);
	composer.setBpm(bpm);
}

function play() {
	let arpToggle = document.getElementById("arptoggle").checked;
	let arpSpeed = document.getElementById("arpspeed");
	let arpSpeedVal = arpSpeed.options[arpSpeed.selectedIndex].value * 1;
	console.log(arpToggle + " " + arpSpeedVal);
	modifyBPM();
	composer.setArpeggioState(0,arpToggle);
	composer.setArpeggioSpeed(0, arpSpeedVal);
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

function clearTrack(trackNum) {
	console.log("Clearing Track: "+trackNum+" !");
	composer.clearTrack(trackNum);
}

function playMetronome() {
	console.log("Commencing Metronome");
	composer.playMetronome();
}

function render() {
	console.log("Rendering Mp3");
	let filename = prompt("Please Enter a name: ");
	composer.renderMp3(filename);
}

let saveData = "";
function saveComposer() {
	saveData = composer.saveData();
}

function loadComposer() {
	composer.loadData(saveData);
}
