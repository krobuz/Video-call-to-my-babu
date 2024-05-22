const express = require('express')
const bodyParser = require('body-parser');
//const path = require('path')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
  debug: true
});
const formatMessage = require('./utils/messagesFormat')
const { userJoin, getCurrentUser } = require('./utils/users')

app.use(express.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs')
app.use(express.static('public'))

app.use('/peerjs', peerServer);

app.get('/', (req, res) => {
    res.render('homepage');
});

app.post('/submit', (req, res) => {
    const username = req.body.username;
    console.log(req.body)
    if (username) {
        global.username = username;
        res.status(200).send('Username submitted successfully');
    } else {
        res.status(400).send('Error: Username is missing');
    }
});

app.post('/createRoom', (req, res) => {
    const roomId = uuidV4();
    res.json({ roomId });
});


app.get('/room/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
    //console.log(req.params)
})

const botName = "🤖 Bot"

io.on('connection', socket => {
    //console.log(`new connection`)
    const username = global.username
    //console.log(username + ` line 55`)
    socket.emit('username', username)

    socket.on('joinRoom', ({id, myName, ROOM_ID }) => {
        console.log(ROOM_ID, id, myName + ` line 60`)
        const user = userJoin(id, myName, ROOM_ID)

        socket.join(ROOM_ID)

        //Welcome a new user
        socket.emit('message', formatMessage(`${botName}`, `Welcome ${user.username} 👋🥰`))

        //Broadcast when a user connect
        socket.broadcast.to(ROOM_ID).emit('message', formatMessage(`${botName}`, `${user.username} has joined`))
        socket.broadcast.to(ROOM_ID).emit('user-connected', user.id)

        //Listen for chat message
        socket.on('chatMessage', (msg) => {
            //console.log(msg)
            io.to(ROOM_ID).emit('message', formatMessage(`${user.username}`, msg))
            //console.log(ROOM_ID + ` line 79`)
        })  

        //When a user disconnect
        socket.on('disconnect', () => {
            io.to(ROOM_ID).emit('message', formatMessage(`${botName}`, `${user.username} has left`))
            socket.broadcast.to(ROOM_ID).emit('user-disconnected', user.id)
            global.username=""
        })
    })
})












// io.on('connection', socket => {
//     socket.on('join-room', (roomId, userId) => {



//         console.log('Room ID: ' + roomId)
//         console.log('User ID: ' + userId)
//         //console.log('User Name: ' + globalUserName)
//         const username = global.username
//         console.log('User connected:', username);
//         socket.emit('username', username);



//         socket.join(roomId)
//         socket.broadcast.to(roomId).emit('user-connected', userId, username)

//         socket.on('message', message => {
//             io.to(roomId).emit('createMessage', message)
//         })

//         socket.on('disconnect', () => {
//             //socket.broadcast.to(roomId).emit('user-disconnected', userId)
//             socket.to(roomId).emit('user-disconnected', userId)
//         })
//     })
// })


server.listen(3000)
