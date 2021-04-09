

// register
const registerForm = document.querySelector('#registerForm');
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // get user info
    const username = registerForm['registerUsername'].value;
    const email = registerForm['registerEmail'].value;
    const password = registerForm['registerPassword'].value;
    registerForm.reset(); 
    // sign up the user
    auth.createUserWithEmailAndPassword(email, password);
})

// Log user out
const logOutButton = document.querySelector('#logOutButton');
logOutButton.addEventListener('click', (e) => {
    e.preventDefault();
    auth.signOut();
})

// Log user in
const loginForm = document.querySelector('#loginForm')
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // get user info
    const email = loginForm['loginEmail'].value;
    const password = loginForm['loginPassword'].value;
    loginForm.reset();
    auth.signInWithEmailAndPassword(email, password);
})

// listen for auth status changes
auth.onAuthStateChanged(user => {
    if (user) {
        console.log("user logged in");
        loggedInDiv.style.display = 'unset';
        notLoggedInDiv.style.display = 'none';
        alert('You are now logged in!')
    }
    else {
        console.log("user logged out");
        loggedInDiv.style.display = 'none';
        notLoggedInDiv.style.display = 'unset';
        loginPopUp.style.display = 'unset';
        registerPopUp.style.display = 'none';
        alert('You are now logged out');
    }
})