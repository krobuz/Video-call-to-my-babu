const socket = io('/')
const config = { audio: true, video: true}
//const userInfo = document.getElementById('userId')
const videoGrid = document.getElementById('video-grid')

const myVideo = document.createElement('video')
myVideo.muted = true

var peer = new Peer({
    path: '/peerjs',
    host: '/',
    port: '3000'
})
// var getUserMedia = 
// navigator.getUserMedia || 
// navigator.webkitGetUserMedia || 
// navigator.mozGetUserMedia;

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
    })

        //when an user join
    socket.on('user-connected', userId => {
        //joining
        setTimeout(() => {
            //joined
            connectToNewUser(userId, stream)
        }, 1000)
      })
})

peer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

function connectToNewUser(userId, stream) {
    const call = peer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    // call.on('close', () => {
    //     video.remove()
    // })

    //peers[userId] = call 
}

function addVideoStream(video, stream){
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}  

