const socket = io('/')
const config = { audio: true, video: true}
//const userInfo = document.getElementById('userId')
const chatBox = document.getElementById('chat-box')
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

socket.on('username', (username) => {
    // Display the username in the room call
    console.log('Received username:', username);
    myUserName.textContent = username
    myUserName.id = "userNameVideo"
});
    
let myVideoStream
navigator.mediaDevices.getUserMedia(config)
.then(stream => {
    myVideoStream = stream
    addVideoStream(myVideo, stream, myUserName)

    peer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
          addVideoStream(video, userVideoStream)
        })
        peers[call.peer] = call;
        call.on('close', () => {
            video.remove()
        });
    })

    socket.on('user-connected', (userId, username) => {
        setTimeout(() => {
            connectToNewUser(userId, stream, username)
        }, 1000)
      })

    socket.on('user-disconnected', userId => {
        if (peers[userId]) peers[userId].close()
    })
    
    socket.on('createMessage', message => {
        const chatMessages = document.getElementById('chatMessages');
        const liName = document.createElement('li');
        const liMess = document.createElement('li');
        liName.textContent = myUserName.textContent;
        liName.className = "userName"
        liMess.className = "message";
        liMess.textContent = message;
        chatMessages.appendChild(liName);
        chatMessages.appendChild(liMess);
    })
})


peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
    console.log('room: ' + ROOM_ID)
    console.log('id: ' + id)
   // console.log('user name: ' + username)
    const roomId = document.getElementById('copyRoomId')
    roomId.textContent = ROOM_ID

})

function connectToNewUser(userId, stream, username) {
    const call = peer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream, username)
    })
    peers[userId] = call 
    call.on('close', () => {
        video.remove()
    })
}

function addVideoStream(video, stream, username){
    video.srcObject = stream
    video.setAttribute('data-peer', peer.id)
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
    videoGrid.append(username)
}  

function sendMessage(text) {
    if(text.length !== 0){
        socket.emit('message', text)
    }
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        let text = document.getElementById('inputText').value;
        sendMessage(text);
    }
}


function copyId() {
    var idToCopy = document.getElementById('copyRoomId').innerText;
    var tempText = document.createElement('textarea');
    tempText.value = idToCopy;

    document.body.appendChild(tempText);
    tempText.select();
    document.execCommand("copy");
    document.body.removeChild(tempText);
    
}
