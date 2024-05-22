const socket = io('/')
const config = { audio: true, video: true}
const chatBox = document.querySelector('.chat-box')
const messageForm = document.getElementById('messageInputForm')
const videoGrid = document.getElementById('video-grid')

const myVideo = document.createElement('video')
myVideo.muted = true

var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '3000'
})

const peers = {}


// create a peer when create or join a room
peer.on('open', id => {
    socket.emit('joinRoom', { id, myName, ROOM_ID });

    const roomId = document.getElementById('copyRoomId')
    roomId.textContent = ROOM_ID
});

//set name for user
let myName = 'Anonymous';
socket.on('username', username => {
    if (username !== '' && username !== null) {
        myName = username;
    }
});



socket.on('message', message => {
    //console.log(message)
    outputMessage(message)

    //scroll down the chat
    chatBox.scrollTop = chatBox.scrollHeight
})


let myVideoStream
navigator.mediaDevices.getUserMedia(config)
.then(stream => {
    myVideoStream = stream
    addVideoStream(myVideo, myVideoStream)

    peer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
        peers[call.peer] = call
        call.on('close', () => {
            video.remove()
        })
    })

    socket.on('user-connected', userId => {
        setTimeout(() => {
            connectToNewUser(userId, stream)
            console.log('new user connected, id : ' + userId)
        }, 1000)
    })

    socket.on('user-disconnected', userId => {
        if (peers[userId]) {
            peers[userId].close()
            console.log('an user disconnected, id : ' + userId)
        }
    })
})

function connectToNewUser(userId, stream) {
    const call = peer.call(userId, stream)
    console.log('Received stream from user:', call, stream);
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
        console.log('Received stream from user:', call, stream);
    })
    peers[userId] = call
    call.on('close', () => {
        video.remove()
    })
}

function addVideoStream(video, stream){
    console.log('Adding video stream to DOM');
    video.srcObject = stream
    video.setAttribute('data-peer', peer.id)
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}  


messageForm.addEventListener('submit',(e) => {
    e.preventDefault()

    //get message text
    const msg = e.target.elements.inputBox.value.trim()

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



// copy the room id when click on the copy icon
function copyId() {
    var idToCopy = document.getElementById('copyRoomId').innerText;
    var tempText = document.createElement('textarea');
    tempText.value = idToCopy;

    document.body.appendChild(tempText);
    tempText.select();
    document.execCommand("copy");
    document.body.removeChild(tempText);
    
}
