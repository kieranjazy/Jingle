let commentBoxOpen = false;
let TheDocId = ''
const orderSelector = document.getElementById('orderSelector')

// functions that order the posts
function newestFirst(array){

    var done = false;
    while(!done){
        done = true;
        for(var i = 1; i< array.length; i++){
            if(array[i -1].data().timePosted <= array[i].data().timePosted){
                done = false;
                var tmp = array[i-1];
                array[i-1] = array[i];
                array[i] = tmp;
            }
        }
    }
    return array;
}

function oldestFirst(array){

    var done = false;
    while(!done){
        done = true;
        for(var i = 1; i< array.length; i++){
            if(array[i -1].data().timePosted > array[i].data().timePosted){
                done = false;
                var tmp = array[i-1];
                array[i-1] = array[i];
                array[i] = tmp;
            }
        }
    }
    return array;
}

function mostLikedFirst(array){

    var done = false;
    while(!done){
        done = true;
        for(var i = 1; i< array.length; i++){
            if(array[i -1].data().likes < array[i].data().likes){
                done = false;
                var tmp = array[i-1];
                array[i-1] = array[i];
                array[i] = tmp;
            }
        }
    }
    return array;
}

function leastLikedFirst(array){

    var done = false;
    while(!done){
        done = true;
        for(var i = 1; i< array.length; i++){
            if(array[i -1].data().likes > array[i].data().likes){
                done = false;
                var tmp = array[i-1];
                array[i-1] = array[i];
                array[i] = tmp;
            }
        }
    }
    return array;
}





// get all the posts from firestore database
db.collection('posts').onSnapshot(snapshot => {
    setUpPosts(snapshot.docs);
}) 

const postList = document.querySelector('#postList');


// set up the posts
const setUpPosts = (data) => {

    let html = '';    
    let arr1 = [];
    let orderedArr=[];

    data.forEach(doc => {
        arr1.push(doc)
    })
    
    let arr = searchArray(document.getElementById('search-input').value, arr1)
    console.log(arr)

    console.log("arr2:" + arr)
    if (orderSelector.value == '1') {
        orderedArr = newestFirst(arr)
    }

    else if (orderSelector.value == '2') {
        orderedArr = oldestFirst(arr)
    }

    else if (orderSelector.value == '3') {
        orderedArr = mostLikedFirst(arr)
    }

    else {
        orderedArr = leastLikedFirst(arr)
    }
    
    
    
    if (commentBoxOpen) {
        openAllComments(TheDocId)
    }

  
    for (i=0; i<orderedArr.length; i++) {       
        const doc = orderedArr[i];
        const postData = doc.data();        
        const postDiv = `        
                        
            <div class="col-12 individualPost">
                <div class="card text-center">
                    <div class="card-header">
                        <div class="row justify-content-start">
                        <div class="col-4" id="img-div">
                            <img class="profilePicPost profile${postData.userId}">
                        </div>
                        <div class="col-8 align-self-center" style="text-align: left;">
                            <h3>${postData.user}</h3>
                        </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${postData.title}</h5>
                        <p class="card-text">${postData.description}</p>
                        <div class="row">                                
                        <div class="col-12">
                            <div class="mediaplayer">
                                <audio controls preload="none" controlsList="nodownload" id="audio${doc.id}">
                                    <source src="music.mp3" type="audio/mpeg" />
                                    
                                    <p>You need a modern Browser or install the Flash Plugin or simply download the video (<a href="http://corrupt-system.de/assets/media/sintel/sintel-trailer.m4v">mp4</a>, <a href="http://corrupt-system.de/assets/media/sintel/sintel-trailer.webm">webm</a>)</p>
                                </audio>
                                <div class="mediacontrols" style="display:none;">
                                    <input type="range" value="0" step="any" class="seekbar" disabled="" />
                                </div>
                            </div>
                        </div>
                        
                        </div>
                    </div>
                    <div class="card-footer">
                        <div class="socialIcons">
                            <img style="height: 40px;" src="heart.png" class="likeButton" id="likeButton${doc.id}" onclick="toggleLikes(event);">
                            <img style="height: 40px;" src="speech-bubble.png" class="commentButton" id="commentButton${doc.id}" onclick="openAllComments('${doc.id}')">
                            <img style="height: 40px;" src="send.png">
                        </div>                                  
                        <p style="text-align: left;">${postData.likes} likes</p>
                        <div class="comments">                                        
                            <div class="generalCommentSection">
                                <div class="divWithAllComments" id="commentSection${doc.id}">
                
                                </div>
                            </div>
                            <p class="openCommentLink" id="openCommentLink${doc.id}" onclick="openAllComments('${doc.id}')">See all ${postData.comments.length} comments</p>
                        </div>
                        <div style="display: flex; align-items: flex-start;">
                            <p id="timePosted${doc.id}"></p>
                        </div>
                        
                        <hr>                            
                            <div class="input-group mb-3">
                                <input type="text" class="form-control" id="inputComment${doc.id}" placeholder="Add a comment..." aria-label="Recipient's username" aria-describedby="basic-addon2">
                                <div class="input-group-append">
                                    <button class="btn btn-outline-secondary" id="postCommentButton${doc.id}" type="button" onClick='postCommentFromInput("inputComment${doc.id}", "${doc.id}")'>Post</button>
                                </div>
                            </div>                            
                        </div>  
                    </div>                   
                </div>`;              
                         
                  
        html += postDiv;  
                          
    }
    
    postList.innerHTML = html;
    updateUi(orderedArr)
    /*
    let usersArray = [];
    data.forEach(doc => {
        
        updateLikeUi(doc, firebase.auth().currentUser)
        
        const comments = doc.data().comments;       
        let i=0;
        
        newArr = comments.slice(-3)
        for (i=0; i<newArr.length; i++) {
            document.getElementById("commentSection" + doc.id).innerHTML += `
            <div class="comment">
                <p class="individualComment"><b>${newArr[i].Uname}</b> ${newArr[i].comment}</p>
            </div>`;
        }

        const classname = "profile" + doc.data().userId;
        if (!usersArray.includes(classname)) {
            console.log("got here")
            usersArray.push(classname)
            const storage = firebase.storage();          
            const pathReference = storage.ref(doc.data().userId + '/profilePic');            
            pathReference.getDownloadURL().then((url) => {
               document.querySelectorAll('.' + classname).forEach((img) => {
                   img.src = url;
               })
            })
        }

        const storage = firebase.storage();
          
        const audio = document.querySelector('#audio' + doc.id)   
        const pathReference = storage.ref(doc.data().userId + '/posts/' + doc.id);
        
        pathReference.getDownloadURL().then((url) => {
            
            
            audio.src = url;
        })

        const timePostedId = "timePosted" + doc.id;
        const timePosted = doc.data().timePosted;
        timeP = document.getElementById(timePostedId)
        var d = new Date();
        var t = d.getTime();
        const timePassed = (t - timePosted)*0.001;
        if (timePassed < 60) {
            timeP.innerHTML = "Posted " + Math.round(timePassed) + " seconds ago";
        } 
        else if (timePassed < 3600) {
            timeP.innerHTML = "Posted " + Math.round(timePassed/60) + " minutes ago";
        }
        // less than a day
        else if (timePassed < 86400) {
            timeP.innerHTML = "Posted " + Math.round(timePassed/3600) + " hours ago";
        }
        // less than a month
        else if (timePassed < 2,678,400) {
            timeP.innerHTML = "Posted " + Math.round(timePassed/86400) + " days ago";
        }
        // less than a year
        else if (timePassed < 32,140,800) {
            timeP.innerHTML = "Posted " + Math.round(timePassed/2,678,400) + " months ago";
        } 
        // year or more
        else {
            timeP.innerHTML = "Posted " + Math.round(timePassed/32,140,800) + " years ago";
        }

        
        
    })    
        */
}


    

function toggleLikes(e) {
       
    const id = e.target.id.substring(10);
    console.log(id)
    const like = firebase.functions().httpsCallable('like')
    like({ id })
        .catch(error => {
            console.log(error.message);
        })
}
const createCommentDiv = document.querySelector('.createComment')
const commentCancelButton = document.getElementById('commentCancelButton');
const postCommentButton = document.getElementById('postCommentButton');
const commentForm = document.getElementById('commentForm')
let currentCommentId = 'dummywords';




commentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const comment = commentForm['commentInput'].value;    
    createCommentDiv.style.display = 'none';

    const commentFunction = firebase.functions().httpsCallable('comment')
    commentFunction({id: currentCommentId, comment: comment })
        .catch(error => {
            console.log(error.message);
        })
    commentForm.reset();
})

// Audio JS
(function () {
    //simple feature test
    if (!document.createElement('video').canPlayType) {
        return;
    }


    //the mediaplayer is the wrapper for all controls
    function createPlayer(mediaplayer) {
        var video = mediaplayer.querySelector('video');
        var seekBar = mediaplayer.querySelector('.seekbar');

        if (seekBar) {
            createSeekBar(video, seekBar);
        }
    }

    function createRangeInputChangeHelper(range, inputFn, changeFn) {
        var inputTimer, releaseTimer, isActive;

        var destroyRelease = function () {
            clearTimeout(releaseTimer);
            range.removeEventListener('blur', releaseRange, false);
            document.removeEventListener('mouseup', releaseRange, false);
        };
        var setupRelease = function () {
            if (!isActive) {
                destroyRelease();
                isActive = true;
                range.addEventListener('blur', releaseRange, false);
                document.addEventListener('mouseup', releaseRange, true);
            }
        };
        var _releaseRange = function () {
            if (isActive) {
                destroyRelease();
                isActive = false;
                if (changeFn) {
                    changeFn();
                }
            }
        };
        var releaseRange = function () {
            setTimeout(_releaseRange, 9);
        };
        var onInput = function () {
            if (inputFn) {
                clearTimeout(inputTimer);
                inputTimer = setTimeout(inputFn);
            }
            clearTimeout(releaseTimer);
            releaseTimer = setTimeout(releaseRange, 999);
            if (!isActive) {
                setupRelease();
            }
        };

        range.addEventListener('input', onInput, false);
        range.addEventListener('change', onInput, false);
    }

    function createSeekBar(video, seekBar) {
        var duration, videoWasPaused;
        var blockSeek = false;



        function enableDisableSeekBar() {
            duration = video.duration;
            if (duration && !isNaN(duration)) {
                seekBar.max = duration;
                seekBar.disabled = false;
            } else {
                seekBar.disabled = true;
            }
        }

        function onSeek() {
            if (!blockSeek) {
                blockSeek = true;
                videoWasPaused = video.paused;
                video.pause();
            }
            video.currentTime = seekBar.value;
        }

        function onSeekRelease() {
            if (!videoWasPaused) {
                console.log('change')
                video.play();
            }
            blockSeek = false;
        }

        function onTimeupdate() {
            if (!blockSeek) {
                seekBar.value = video.currentTime;
            }
        }



        //or durationchange
        video.addEventListener('loadedmetadata', enableDisableSeekBar, false);
        video.addEventListener('emptied', enableDisableSeekBar, false);
        video.addEventListener('timeupdate', onTimeupdate, false);

        createRangeInputChangeHelper(seekBar, onSeek, onSeekRelease);

        enableDisableSeekBar();
        onTimeupdate();
    }

    Array.prototype.forEach.call(document.querySelectorAll('.mediaplayer'), createPlayer);
})();

// end of audio JS

// changes colour of like button depending if liked or not
function updateLikeUi(postDoc, user) {
    var docRef = db.collection("users").doc(user.uid);
    
    docRef.get().then((doc) => { 
        const likedPosts = doc.data().likedPosts
        if (likedPosts.includes(postDoc.id)) {
            const likeBtn = document.getElementById('likeButton' + postDoc.id)
            
            likeBtn.src = 'black-heart.png'
        }
        
    })
}

//posts a comment and clears input field
function postCommentFromInput(id, postId) {
    console.log("Got into send comment function.... document ID: " + id + " Post ID: " + postId)
    const input = document.getElementById(id)
    console.log("Input value: " + input.value)
    if (input.value.length == 0) {
        return;
    }
    else {
         const commentFunction = firebase.functions().httpsCallable('comment')
         var user = firebase.auth().currentUser;
        commentFunction({id: postId, comment: input.value, username: user.displayName})
            .catch(error => {
                console.log(error.message);
            })
            
        input.value = "Add a comment..."
    }
}


// function that opens all the comments out:
function openAllComments(id) {
    let html = '';
    
    commentBoxOpen = true;
    TheDocId = id;
    var docRef = db.collection("posts").doc(id);    
    docRef.get().then((doc) => { 
        
        const comments = doc.data().comments

        
        for(i=0; i<comments.length; i++) {
            
            let id = comments[i].Uid;
            const commentDic = comments[i];
            let storage = firebase.storage()
            const pathReference = storage.ref(id + '/profilePic');
            pathReference.getDownloadURL().then((url) => {
                
                //profileImg.src = url;
                console.log(commentDic)
                html+= `<div class="comment">
                        <div class="profile">
                            <img id="smallProfilePic" src="${url}">
                        </div>
                        <div class="nameAndComment">
                            <div class="name">
                                <b>${commentDic.Uname}</b>
                            </div>
                            <div class="comment">
                                ${commentDic.comment}
                            </div>
                        </div>        
                    </div>
                    <hr>`
                
                if (i == comments.length) {
                    renderHtml(html)
                }
            })
            
        }
        
        function renderHtml(html) {
            const commentBox = document.querySelector('.card-body69')
            document.getElementById('bigCommentSectionTitle').innerHTML = doc.data().title
            
            var src1 = document.querySelector('.profile' + doc.data().userId).src;
            document.getElementById('bigProfilePic').src = src1;
            commentBox.innerHTML = html;
            
            document.querySelector('.bigCommentSection').style.display = 'block';
            document.getElementById('blackBackground').style.display = 'block';
            
            document.getElementById('footerOfCommentcard').innerHTML = 
            `<div class="input-group mb-3">
                <input type="text" id="InputComment" class="form-control" placeholder="Add a comment..." aria-label="Recipient's username" aria-describedby="basic-addon2">
                <div class="input-group-append">
                    <button id="postCommentbtn" onclick="postCommentFromInput('InputComment', '${doc.id}')" class="btn btn-outline-secondary"  type="button" >Post</button>
                </div>
            </div> `;
        }
        
    })
    
}

const exitImg = document.getElementById('exitImg')

function closeCommentSection() {
    console.log('clicked420')
    commentBoxOpen = false;
    document.querySelector('.bigCommentSection').style.display = 'none';
    document.getElementById('blackBackground').style.display = 'none';

}


