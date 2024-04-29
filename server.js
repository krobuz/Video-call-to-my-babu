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
        // Store the username in a session or global variable
        // For simplicity, I'll use a global variable here
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
    console.log(req.params)
})

const users = {}
io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {

        //console.log('User Name: ' + globalUserName)
        const username = global.username
        console.log('User connected:', username);
        socket.emit('username', username);

        socket.join(roomId)
        socket.broadcast.to(roomId).emit('user-connected', userId, username)

        socket.on('message', message => {
            io.to(roomId).emit('createMessage', message)
        })

        socket.on('disconnect', () => {
            socket.broadcast.to(roomId).emit('user-disconnected', userId)
        })
    })
})


server.listen(3000)
