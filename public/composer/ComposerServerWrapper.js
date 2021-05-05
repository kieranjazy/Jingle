const firebase = require("firebase");
import firebaseConfig from "./config.js"
/*
	Composer Server Wrapper
	Version 1
	Created by Daniel Hannon (danielh2942)
*/

function ComposerServerWrapper() {
	console.log("Object Created I guess");
	firebase.initializeApp(firebaseConfig);
}

ComposerServerWrapper.prototype.fetchJSON = function(url, callback) {
	const xhr = new XMLHttpRequest();
	xhr.overrideMimeType("application/json");
	xhr.open("GET", url, true);
	xhr.onreadystatechange = function() {
		if(xhr.readyState == 4 && xobj.status == "200") {
			callback(xhr.responseText);
		}
	}
}

ComposerServerWrapper.prototype.getManifest = function() {
	let storage = firebase.storage();
	const pathRef = storage.ref('/music/manifest.json');
	return pathRef.getDownloadURL().then((url) => {
		return this.fetchJSON(url,function(response){
			return JSON.parse(response);
		});
	});
}

ComposerServerWrapper.prototype.getInstrument = function(instrumentName) {
	console.log("Fetching Instrument "+instrumentName);
	let storage = firebase.storage();
	const pathRef = storage.Ref('/music/'+instrumentName+'.json');
	return pathRef.getDownloadURL().then((url)=>{
		return this.fetchJSON(url, function(response) {
			return JSON.parse(response);
		});
	});
}

ComposerServerWrapper.prototype.loadFile = function(saveFile) {
	console.log("Loading File "+ saveFile);
	let storage = firebase.storage();
	const pathRef = storage.ref(user.uid+'/saves/'+saveFile+'.json');
	return pathRef.getDownloadURL().then((url)=>{
		return this.fetchJSON(url, function(response) {
			return JSON.parse(response);
		});
	});
}

ComposerServerWrapper.prototype.saveFile = function(savefilename, data) {
	const currentUser = firebase.auth().currentUser;
	const storageRef = firebase.storage().ref(currentUser.uid + "/saves/" + savefilename + ".json");
	storageRef.put(data);
	const saveLink = firebase.functions().httpsCallable('addFile');
	saveLink({filename:savefilename})
}

export default ComposerServerWrapper;
