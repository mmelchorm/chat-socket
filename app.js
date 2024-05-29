const express = require('express')
const bodyParser = require('body-parser');
const session = require('express-session');
const authRoutes = require('./routes/auth');


const app = express()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true
}));

const http = require('http')
const { Socket } = require('net')
const server = http.createServer(app)
const path = require('path');

const {Server} = require('socket.io')
const io = new Server(server)

io.on('connection', (socket) => {
    
    socket.on('chat', (codigo, usuario, msg) => {

        let partes = cortarOracionEnPartes(msg, 80)

        partes.forEach((part) =>{
            io.emit('chat', codigo, usuario, part)

        })
    })

    socket.on ('unirse', (usuario) => {
        io.emit('unirse', usuario)
    })
    
})

app.use('/auth', (req, res, next) =>
    {
        req.io = io;
        next();
    }, 
    authRoutes
);


app.use(express.static(path.join(__dirname, 'cliente')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'cliente', 'login.html'));
})

app.get('/registro', (req, res) => {
    res.sendFile(path.join(__dirname, 'cliente', 'registro.html'));
})

app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, 'cliente', 'chat.html'));
})

server.listen(3000, () => {
    console.log("Servidor corriendo en el puerto http://localhost:3000")
})

function cortarOracionEnPartes(oracion, maxLen) {
    const partes = [];
    let inicio = 0;
    
    while (inicio < oracion.length) {
        // Encuentra el límite de corte
        let fin = Math.min(inicio + maxLen, oracion.length);
        
        // Si estamos en el medio de una palabra, retrocede hasta el último espacio
        if (fin < oracion.length && oracion[fin] !== ' ') {
            fin = oracion.lastIndexOf(' ', fin);
            if (fin === -1 || fin < inicio) {
                // Si no se encuentra un espacio, simplemente corta en maxLen
                fin = inicio + maxLen;
            }
        }
        
        // Añade la parte cortada al array
        partes.push(oracion.substring(inicio, fin).trim());
        
        // Avanza el inicio para la siguiente parte
        inicio = fin + 1;
    }
    
    return partes;
}
