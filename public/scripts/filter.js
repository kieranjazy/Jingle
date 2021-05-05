// Script file for the filters in the feed page


const newestFilter = document.getElementById("newestFilter");
const oldestFilter = document.getElementById("oldestFilter");
const mostLikedFilter = document.getElementById("mostLikedFilter");
const leastLikedFilter = document.getElementById("leastLikedFilter");
const filterDiv = document.getElementById("radio-filters");



let postArr = [];


db.collection("posts").get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
        postArr.push(doc);
        
    });
});



function updateUi(Arr) {
    
    let usersArray = [];

    for (let i=0; i<Arr.length; i++) {
        let doc = Arr[i];

        updateLikeUi(doc, firebase.auth().currentUser)
        
        const comments = doc.data().comments;       
        
        
        newArr = comments.slice(-3)
        
        for (let i=0; i<newArr.length; i++) {
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
    }
}




// newest filter:
let html = ''
newestFilter.addEventListener('change', () => {
    let newestFirstArr = newestFirst(postArr);
    document.getElementById('orderSelector').value = '1';
    html = ''; 
    for (i=0; i<newestFirstArr.length; i++) {  
            
        const doc = newestFirstArr[i];
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
    
    document.querySelector('#postList').innerHTML = '';
    document.querySelector('#postList').innerHTML = html;
    updateUi(newestFirstArr)
})

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

//oldest first filter

oldestFilter.addEventListener('change', () => {
    let oldestFirstArr = oldestFirst(postArr);
    document.getElementById('orderSelector').value = '2';
    html = ''; 
    for (i=0; i<oldestFirstArr.length; i++) {       
        const doc = oldestFirstArr[i];
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
    
    document.querySelector('#postList').innerHTML = html;
    updateUi(oldestFirstArr);
})

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


// most liked filter:
mostLikedFilter.addEventListener('change', () => {
    
    let mostLikedFirstArr = mostLikedFirst(postArr);
    document.getElementById('orderSelector').value = '3';
    html = ''; 
    for (i=0; i<mostLikedFirstArr.length; i++) {       
        const doc = mostLikedFirstArr[i];
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
    
    document.querySelector('#postList').innerHTML = html;
    updateUi(mostLikedFirstArr);
})


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




// least liked filter:
leastLikedFilter.addEventListener('change', () => {
    let leastLikedFirstArr = leastLikedFirst(postArr);
    document.getElementById('orderSelector').value = '4';
    html = ''; 
    for (i=0; i<leastLikedFirstArr.length; i++) {       
        const doc = leastLikedFirstArr[i];
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
    
    document.querySelector('#postList').innerHTML = html;
    updateUi(leastLikedFirstArr);
})


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

//___________________________________________________________________________//
// ______________________  Search filter _______________________________//
// __________________________________________________________________________//

const searchInput = document.getElementById('search-input')
searchInput.addEventListener('input', searchAndMatch)

function searchAndMatch(e) {    
    let value = e.target.value;
    //if (value.length != 0) {        
        let searchArr = searchArray(value, postArr);
        if (document.getElementById('orderSelector').value == '1') {
            searchArr = newestFirst(searchArr)
        }
        else if (document.getElementById('orderSelector').value == '2') {
            searchArr = oldestFirst(searchArr)
        }
        else if (document.getElementById('orderSelector').value == '3') {
            searchArr = mostLikedFirst(searchArr)
        }
        else  {
            searchArr = leastLikedFirst(searchArr)
        }
        generateHTML(searchArr);
        highlightSearch(value)
    //}
}

function searchArray(search, postArr) {
    console.log("INSIDE THRR")
    if (search.length == 0) {
        return postArr;
    }
    let searchArr = [];
    for (i=0; i<postArr.length; i++) {
        const docData = postArr[i].data();  

        if (docData.title.includes(search) || docData.description.includes(search)) {
            searchArr.push(postArr[i])
        }
            
        
    }
    return searchArr;
}

function generateHTML(Arr) {
    html = ''; 
    for (i=0; i<Arr.length; i++) {       
        const doc = Arr[i];
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
    
    document.querySelector('#postList').innerHTML = html;
    console.log("done1")
    updateUi(Arr);
}

function highlightSearch(search) {
    const word = search.trim()
    const regexp = new RegExp(word, 'g')

    let titles = document.querySelectorAll('.card-title')
    titles.forEach(title => {
        let ogTitle = title.innerHTML
        title.innerHTML = ogTitle.replace(regexp, `<span id="highlight">${word}</span>`);
    })

    let descriptions = document.querySelectorAll('.card-text')
    descriptions.forEach(description => {
        let ogDescription = description.innerHTML
        description.innerHTML = ogDescription.replace(regexp, `<span id="highlight">${word}</span>`);
    })
}