const socket = io()
const config = { audio: true, video: true}
const chatBox = document.querySelector('.chat-box')
const messageForm = document.getElementById('messageInputForm')
const videoGrid = document.getElementById('video-grid')

const myVideo = document.createElement('video')
myVideo.muted = true
const myUserName = document.createElement('span')



var peer = new Peer({
    path: '/peerjs',
    host: '/',
    port: '3000'
})

const peers = {}
socket.on('username', username => {
    const userName = username
    socket.emit('joinRoom', {userName, ROOM_ID})
    console.log(userName, ROOM_ID)
})


socket.on('message', message => {
    console.log(message)
    outputMessage(message)

    //scroll down the chat
    chatBox.scrollTop = chatBox.scrollHeight
})


messageForm.addEventListener('submit',(e) => {
    e.preventDefault()

    //get message text
    const msg = e.target.elements.inputBox.value.trim()
    //console.log(msg)
    //console.log(typeof msg)

    //Emit chat message to server
    if(msg !== ''){
        socket.emit('chatMessage', msg) 
    }

    e.target.elements.inputBox.value = ''
    e.target.elements.inputBox.focus()

})







//output message to DOM 
function outputMessage(message) {
    const div = document.createElement('div')
    div.classList.add('message')
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span> </p>
    <p class="text"> ${message.text} </p>`
    document.querySelector('.chat-box').appendChild(div)

}



























// let myVideoStream
// navigator.mediaDevices.getUserMedia(config)
// .then(stream => {
//     myVideoStream = stream
//     addVideoStream(myVideo, stream, myUserName.textContent)

//     peer.on('call', call => {
//         call.answer(stream)
//         const video = document.createElement('video')
//         call.on('stream', userVideoStream => {
//           addVideoStream(video, userVideoStream)
//         })
//         peers[call.peer] = call;
//         call.on('close', () => {
//             video.remove()
//         });
//     })

//     socket.on('user-connected', (userId, username) => {
//         setTimeout(() => {
//             connectToNewUser(userId, stream, username)
//             console.log(`${username} connected`)
//         }, 1000)
//       })

//     socket.on('user-disconnected', userId => {
//         if (peers[userId]) {
//             peers[userId].close();
    
//             // Find the video element associated with the disconnected user
//             const videoElement = document.querySelector(`video[data-peer="${userId}"]`);
//             console.log('Video element:', videoElement);
            
//             // Find the nearest user container element containing the video
//             const userContainer = videoElement.closest('.user-container');
//             console.log('User container:', userContainer);
            
//             // Remove the user container from the DOM
//             if (userContainer) {
//                 userContainer.remove();
//                 console.log('User container removed');
//             } else {
//                 console.log('User container not found');
//             }
//         }
//     });
    
    
    
    
//     socket.on('createMessage', message => {
//         const chatMessages = document.getElementById('chatMessages');
//         const liName = document.createElement('li');
//         const liMess = document.createElement('li');
//         liName.textContent = myUserName.textContent;
//         liName.className = "userName"
//         liMess.className = "message";
//         liMess.textContent = message;
//         chatMessages.appendChild(liName);
//         chatMessages.appendChild(liMess);
//     })
// })


// peer.on('open', id => {
//     socket.emit('join-room', ROOM_ID, id)
//     console.log('room: ' + ROOM_ID)
//     console.log('id: ' + id)
//    // console.log('user name: ' + username)
//     const roomId = document.getElementById('copyRoomId')
//     roomId.textContent = ROOM_ID

// })

// function connectToNewUser(userId, stream, username) {
//     const call = peer.call(userId, stream)
//     const video = document.createElement('video')
//     call.on('stream', userVideoStream => {
//         addVideoStream(video, userVideoStream, username)
//     })
//     peers[userId] = call 
//     call.on('close', () => {
//         video.remove()
//     })
// }

// function addVideoStream(video, stream, username){
//     video.srcObject = stream
//     video.setAttribute('data-peer', peer.id)
//     video.addEventListener('loadedmetadata', () => {
//         video.play()
//     })
//     videoGrid.append(video)
//     videoGrid.append(username)
// }  

// function addVideoStream(video, stream, username) {
//     video.srcObject = stream;
//     video.setAttribute('data-peer', peer.id); // Assuming userId is passed as an argument
//     video.addEventListener('loadedmetadata', () => {
//         video.play();
//     });

//     const userContainer = document.createElement('div');
//     userContainer.classList.add('user-container');

//     const userNameElem = document.createElement('div');
//     userNameElem.textContent = username;
//     userNameElem.classList.add('username');

//     userContainer.appendChild(video);
//     userContainer.appendChild(userNameElem);

//     videoGrid.appendChild(userContainer);
// }


// function sendMessage(text) {
//     if(text.length !== 0){
//         socket.emit('message', text)
//     }
// }

// function handleKeyPress(event) {
//     if (event.key === 'Enter') {
//         let text = document.getElementById('inputText').value;
//         sendMessage(text);
//     }
// }


function copyId() {
    var idToCopy = document.getElementById('copyRoomId').innerText;
    var tempText = document.createElement('textarea');
    tempText.value = idToCopy;

    document.body.appendChild(tempText);
    tempText.select();
    document.execCommand("copy");
    document.body.removeChild(tempText);
    
}
