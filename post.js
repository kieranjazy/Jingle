// making a post if logged in

const postFormButton = document.querySelector('#postFormButton');
postFormButton.addEventListener('click', postPopUp);

const postFormDiv = document.querySelector('.postFormDiv');

const postForm = document.getElementById('postForm'); 

function postPopUp() {
    postFormButton.style.display = 'none';
    postFormDiv.style.display = 'block';
}

let file;
const uploadInput = document.getElementById('uploadMp3')
console.log(uploadInput)
uploadInput.addEventListener('change', (e) => {
     file = e.target.files[0];
     console.log(file.name)
})


// ------------------------------------ POST MP3 FUNCTION ---------------------------
const postFormPostButton = document.getElementById('postFormPostButton');
postFormPostButton.addEventListener('click', (e) => {
    e.preventDefault();
    
    const currentUser = firebase.auth().currentUser;
               
    var d = new Date();
    var t = d.getTime();
        
    console.log(currentUser);
    db.collection('posts').add({
        user: currentUser.displayName, 
        title: postForm['postTitle'].value,
        description: postForm['postDescription'].value,
        comments: [],
        likes: 0,
        userId: currentUser.uid,
        timePosted: t,
            
        }).then((docRef) => {
            
            uploadMp3(docRef.id)
            resetPostForm(e);
        })          
            
    
       
    
})

function uploadMp3(postid) {
    if (file.name.indexOf(".mp3") == file.name.length - 4) {        
        const currentUser = firebase.auth().currentUser;
        

        const storageRef = firebase.storage().ref(currentUser.uid + '/posts/' + postid)
        storageRef.put(file)
    }
    else {
        console.log("please enter an mp3!")
    }
}

// -------------------------- END OF POST MP£ FUNCTION ---------------------

const postFormCancelButton = document.getElementById('postFormCancelButton');
postFormCancelButton.addEventListener('click', resetPostForm)

function resetPostForm(e) {
    e.preventDefault();    
    postFormButton.style.display = 'block';
    postFormDiv.style.display = 'none';
    postForm.reset();
}




