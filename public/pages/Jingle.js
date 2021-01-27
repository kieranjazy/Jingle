let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let oscList = [];
let masterGainNode = null;
let osc = null;

const toneKeys = ["KeyA", "KeyS", "KeyD",
                  "KeyF", "KeyG", "KeyH",
                  "KeyJ", "KeyK", "KeyL"];


window.onclick = function() {
    audioContext.resume().then(() => {
        console.log("Audio context started.");
    }); //Have to do this cause of Chrome autoplay policies
}

window.onload = function() {
    //createWaveTable();
    masterGainNode = audioContext.createGain();
    masterGainNode.gain.value = 0.3;
    masterGainNode.connect(audioContext.destination);
    

    navigator.keyboard.lock(toneKeys);
    document.querySelector(".stop").addEventListener('click', function() {
        osc.stop();
    });

}

window.onkeydown = function(event) {
    if (toneKeys.includes(event.code)) {
        osc = audioContext.createOscillator();
        osc.connect(masterGainNode);

        let type = "sine";
        osc.frequency.value = 440;
        osc.start();
    }
}

function createWaveTable() {
    let noteFreq = [];

    //TODO

    return noteFreq;
}

