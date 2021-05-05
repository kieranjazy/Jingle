
const loggedInDiv = document.querySelector('.loggedIn');
const notLoggedInDiv = document.querySelector('.notLoggedIn');
const emailNotVerifiedDiv = document.querySelector('.emailNotVerified');
const loginPopUp = document.querySelector('.login-box')
const registerPopUp = document.querySelector('.register-box')

let usersArr = [];


db.collection("users").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        usersArr.push(doc);

    });
});

// register
const registerForm = document.querySelector('#registerForm');
registerForm.addEventListener('submit', RegisterUser);

function RegisterUser(e) {
    e.preventDefault();
    // get user info.
    const uname = registerForm['registerUsername'].value;
    const email = registerForm['registerEmail'].value;
    const password = registerForm['registerPassword'].value;

    let uniqueUsername = true;

    if (uname.length < 4 || uname.length > 12) {
        Swal.fire({
            icon: 'error',
            title: 'Please enter a username between 4 and 12 characters',
        })
        uniqueUsername = false;
        registerForm['registerPassword'].value = '';
    }
    usersArr.forEach(doc => {
        if (doc.data().username == uname) {
            Swal.fire({
                icon: 'error',
                title: 'Username already taken',
            })
            uniqueUsername = false;
            registerForm['registerPassword'].value = ''
            return;
        }

    });


    if (uniqueUsername) {
        registerForm.reset()
        // sign up the user
        console.log("dont return")
        auth.createUserWithEmailAndPassword(email, password).then(cred => {
            db.collection('users').doc(cred.user.uid).set({
                username: uname,
                likedPosts: [],
                comments: [],
								saveFiles: []
            })
            cred.user.updateProfile({
                displayName: uname
            })

            const storageRef = firebase.storage().ref(cred.user.uid + '/profilePic')
            storageRef.putString('data:image/jpeg;base64,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', 'data_url')

            var user = firebase.auth().currentUser;

            user.sendEmailVerification();
            Swal.fire({
                icon: 'success',
                title: 'Registration complete!',
                text: 'Verfiy your email address to start making music.',
                imageUrl: 'data:image/jpeg;base64,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',
                imageWidth: 400,
                imageHeight: 200,
                imageAlt: 'Custom image',
            })
        })
        .catch((e) => {
            registerForm['registerUsername'].value = uname;
            registerForm['registerEmail'].value = email;
            console.log(e.code)
            let errorMessage = '';
            if(e.code.substring(5) == "invalid-email") {
                errorMessage = "Please enter a valid email"
            }
            else if (e.code.substring(5) == "email-already-in-use") {
                errorMessage = "Email address already in use"
            }
            else if (e.code.substring(5) == "weak-password") {
                errorMessage = "Password not strong enough"
            }

            Swal.fire({
                icon: 'error',
                title: errorMessage,
            })
        })
    }
}

const logOutButton = document.querySelector('#logOutButton');
logOutButton.addEventListener('click', (e) => {
    e.preventDefault();
    auth.signOut();
})


// Log user in
const loginForm = document.querySelector('#loginForm');

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // get user info
    const email = loginForm['loginEmail'].value;
    const password = loginForm['loginPassword'].value;

    auth.signInWithEmailAndPassword(email, password).catch((e) => {
        if (e.code === "auth/user-not-found") {
            Swal.fire({
                icon: 'error',
                title: 'User not found with that email',
            })
        }
        else if (e.code === "auth/invalid-email") {
            Swal.fire({
                icon: 'error',
                title: 'Invalid email',
            })
        }
        else if(e.code === "auth/wrong-password") {
            Swal.fire({
                icon: 'error',
                title: 'Wrong password',
            })

        }
    });
    //loginForm.reset();
})

// send password reset
const resetPasswordForm = document.getElementById('resetPasswordForm')

resetPasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = resetPasswordForm['resetPasswordEmail'].value;
    auth.sendPasswordResetEmail(email).then(function() {
        Swal.fire({
            icon: 'success',
            title: 'Password recovery email sent',
        })
        openLogin();
      }).catch(function(error) {
        Swal.fire({
            icon: 'error',
            title: 'Email not registered',
        })
      });

})



// listen for auth status changes
auth.onAuthStateChanged(user => {
    if (user) {
        console.log("user logged in");
        console.log(user);
        if (user.emailVerified) {
            loggedInDiv.style.display = 'block';
            notLoggedInDiv.style.display = 'none';
            emailNotVerifiedDiv.style.display = 'none';

            const profileImg = document.querySelector('.profileImg')
            const storage = firebase.storage();
            const pathReference = storage.ref(user.uid + '/profilePic');
            pathReference.getDownloadURL().then((url) => {
                profileImg.src = url;
            })
        }

        else {
            loggedInDiv.style.display = 'none';
            notLoggedInDiv.style.display = 'none';
            emailNotVerifiedDiv.style.display = 'block';
            auth.signOut();
        }

    }
    else {
        if (emailNotVerifiedDiv.style.display == 'block') {
            return
        }
        else {
            console.log("user logged out");
            loggedInDiv.style.display = 'none';
            notLoggedInDiv.style.display = 'block';
            loginPopUp.style.display = 'block';
            registerPopUp.style.display = 'none';
            emailNotVerifiedDiv.style.display = 'none';
        }

    }

})

function backToLogin() {
    loggedInDiv.style.display = 'none';
    notLoggedInDiv.style.display = 'block';
    loginPopUp.style.display = 'block';
    registerPopUp.style.display = 'none';
    emailNotVerifiedDiv.style.display = 'none';
}


// ________________________________________________________________________//
