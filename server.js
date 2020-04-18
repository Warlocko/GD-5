// Imports
const express = require('express');
const webRoutes = require('./routes/web');

// Express app creation
const app = express();

// Connect socket io
const server = require('http').Server(app);
const io = require('socket.io')(server);

// Configurations
const appConfig = require('./configs/app');

// View engine configs
const exphbs = require('express-handlebars');
const hbshelpers = require("handlebars-helpers");
const multihelpers = hbshelpers();
const extNameHbs = 'hbs';
const hbs = exphbs.create({
  extname: extNameHbs,
  helpers: multihelpers
});
app.engine(extNameHbs, hbs.engine);
app.set('view engine', extNameHbs);

// Receive parameters from the Form requests
app.use(express.urlencoded({ extended: true }));

app.use('/', express.static(__dirname + '/public'));

// Routes
app.use('/', webRoutes);

const categorias = ["Nombre", "Color", "Fruto"];
const letras = [...Array(26)].map((val,i) => String.fromCharCode(i+65));
let jugadores = {};
let nombres = [];
let conexiones = []
let basted = false;

let salaDeEspera = {};
let juegoEnCurso = false;
let nombreLength = 0, i = 0;
let nombre ="";
let respuestas = [];


io.on('connection', (socket) => {
  nombreLength = Math.floor(Math.random()*8) + 1;
  nombre="";
  i=0;
  while(i<nombreLength){
    nombre += letras[Math.floor(Math.random()*26)];
    i++;
  }
  if(!juegoEnCurso) {
      jugadores[socket.id] = {nombre: nombre, socket: socket.id};
      nombres.push(nombre);
      conexiones.push(socket);
      socket.emit("Entrando", jugadores[socket.id]);
      socket.emit("asignarNombre", {miNombre:jugadores[socket.id].nombre});
      io.emit("agregarJugador", {jugadores: nombres});
    } else{
      salaDeEspera[socket.id] = {nombre: nombre, socket: socket.id};
      socket.emit("Entrando", salaDeEspera[socket.id]);
  }
  
  if(conexiones.length >= 2 && !juegoEnCurso){
    comenzarJuego();
  }

  socket.on('yaBastaFrizer', function () {
    if(!basted){
      io.emit('GOKUUU')
      basted=true
    }else{
      socket.emit('toast', {message: 'Papi, ¿qué pasó? Ya le diste basta'})
    }
  })

  socket.on('endgame', function (data) {
    respuestas.push(data)
    io.emit('respuestas', {respuestas})
  })

});

comenzarJuego = () => {
  io.emit("Comenzamos");
  setTimeout(function () {
    letra = letras[Math.floor(Math.random()*26)];
    console.log(letra);
    io.emit("Inicio", {jugadores, letra, categorias});
    juegoEnCurso = true;
  }, 3000)
  
};


// App init
server.listen(appConfig.expressPort, () => {
  console.log(`Server is listenning on ${appConfig.expressPort}! (http://localhost:${appConfig.expressPort})`);
});