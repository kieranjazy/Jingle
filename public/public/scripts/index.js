function toggleNavbar() {
    var logo = document.querySelector('.logo');
    var x = document.getElementById("myTopnav");
    if (x.className === "topnav") {
      x.className += " responsive";
      logo.style.display = 'none';
    } else {
      x.className = "topnav";
      logo.style.display = 'unset';
    }
}

function switchToRegister() {
  loginPopUp.style.display = 'none';
  registerPopUp.style.display = 'unset';
  
}

function switchToLogin() {
  loginPopUp.style.display = 'unset';
  registerPopUp.style.display = 'none';
  
}
  

var loginPopUp = document.querySelector('.login');
var registerPopUp = document.querySelector('.register');
registerPopUp.style.display = 'none';

var registerButton = document.querySelector('.registerButton');
var loginButton = document.querySelector('.loginButton');
registerButton.addEventListener('click', switchToRegister);
loginButton.addEventListener('click', switchToLogin);

var notLoggedInDiv = document.querySelector('.notLoggedIn');
var loggedInDiv = document.querySelector('.loggedIn');
loggedInDiv.style.display = 'none'; 