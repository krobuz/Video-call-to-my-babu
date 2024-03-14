
const socket = io('/')
const config = { audio: true, video: true}
//const userInfo = document.getElementById('userId')
const videoGrid = document.getElementById('video-grid')
const chatBox = document.getElementById('chat-box')



const myVideo = document.createElement('video')
myVideo.muted = true

var peer = new Peer({
    path: '/peerjs',
    host: '/',
    port: '3000'
})

const peers = {}

let myVideoStream
navigator.mediaDevices.getUserMedia(config)
.then(stream => {
    myVideoStream = stream
    addVideoStream(myVideo, stream)

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

    socket.on('user-connected', userId => {
        setTimeout(() => {
            connectToNewUser(userId, stream)
        }, 250)
      })

    socket.on('user-disconnected', userId => {
        if (peers[userId]) peers[userId].close()
    })
    
    socket.on('createMessage', message => {
        const chatMessages = document.getElementById('chatMessages')
        const li = document.createElement('li');
        li.className = "message";
        li.textContent = message;
        chatMessages.appendChild(li);
    })
})


peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
    console.log(ROOM_ID)
    console.log(id)
    const roomId = document.getElementById('copyRoomId')
    roomId.textContent = ROOM_ID

})

function connectToNewUser(userId, stream) {
    const call = peer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    peers[userId] = call 
    call.on('close', () => {
        video.remove()
    })
}

function addVideoStream(video, stream){
    video.srcObject = stream
    video.setAttribute('data-peer', peer.id)
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
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

// function setDefaultName(input) {
//     if (input.value === '') {
//         input.value = 'Anonymous';
//     }
// }