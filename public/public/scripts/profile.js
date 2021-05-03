// if user is logged in their details will be shown in the profile page

const accountDetails = document.querySelector('#accountDetails');
const profileImgInput = document.querySelector('#profileImgInput');
let cUser = ''
auth.onAuthStateChanged(user => {  
    if (user) {
        cUser= user;
        db.collection('users').doc(user.uid).get().then(doc => {
            const html = `
            <div class="card" style="width: 40%;">
                <div class="card-header">
                    <h2>Account details:</h2>
                </div>
                <ul class="list-group list-group-flush">
                    <li class="list-group-item"><b>Email:</b> ${user.email}</li>
                    <li class="list-group-item"><b>Username:</b> ${doc.data().username}</li>      
                </ul>
            </div>
        `;
        
        accountDetails.innerHTML = html;       
        })      
        
         // load profile image        
         const storage = firebase.storage();          
         const pathReference = storage.ref(user.uid + '/profilePic');
         pathReference.getDownloadURL().then((url) => {
             document.getElementById('profilePicSettings').src = url;
        })
    }
    else {
        accountDetails.innerHTML = '';
    }
});


// get the option to pick a photo when button is clicked
 const uploadButton = document.getElementById('getprofilePicButton');
 uploadButton.addEventListener('click', () => {
     document.getElementById('profilepicfile').click()
 })

 let file = '';
 // set up croppie once photo picked
 document.getElementById('profilepicfile').addEventListener('change', (e) => {
    file = e.target.files[0];    
    let filesrc = URL.createObjectURL(file)
    createCroppie(filesrc)
})
let c = '';
//create the croppie set up:
function createCroppie(file) {
    cropPictureDiv = document.getElementById('cropPictureDiv')
    updateDiv = document.querySelector('.updateProfilePic')
    cropPictureDiv.style.display = 'block';
    updateDiv.style.display = 'none';
     c = new Croppie(document.getElementById('croppiediv'), {
        viewport: { width: 100, height: 100, type: 'circle' },
        boundary: { width: 300, height: 300 },
        showZoomer: true,
        enableOrientation: true,
        
    }); 
    
    c.bind({
        url: file,
        
    });
}

// cancel the croppie
const cancelButton = document.getElementById('cancelCrop')
cancelButton.addEventListener('click', () => {
    c.destroy();
    updateDiv.style.display = 'block';
    cropPictureDiv.style.display = 'none';
    document.getElementById('profilepicfileForm').reset();
})

// save the croppie
const saveButton = document.getElementById('saveCrop')
saveButton.addEventListener('click', () => {
    c.result('base64').then((base64) => {
        const storageRef = firebase.storage().ref(cUser.uid + '/profilePic')
        storageRef.putString(base64 , 'data_url').then(() => {
        location.reload()
    })
    })
    
})