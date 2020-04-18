function makeToastMessage(message) {
  $.toast({
    text: message,
    position: 'top-right'
  });
}

miNombre = "";
miLetra = "";
window.socket = null;
function connectToSocketIo() {
  let server = window.location.protocol + "//" + window.location.host;
  window.socket = io.connect(server);
  // Recibe un mensaje de tipo toast
  window.socket.on('toast', function (data) {
    // Muestra el mensaje
    makeToastMessage(data.message);
  });

  window.socket.on('Entrando', function (data){
    makeToastMessage(`Bienvenido, ${data.nombre}`);
  });

  window.socket.on('Comenzamos', function (data){
    avisarInicio();
  });

  window.socket.on('Inicio', function (configuracion) {
    iniciarJuego(configuracion);
  })

  window.socket.on('asignarNombre', function (nombre) {
    miNombre = nombre.miNombre;
    console.log("mi nombre es "+miNombre);
  })

  window.socket.on('GOKUUU', function () {
    let episodios = 10
    let frizer = setInterval(function () {
      makeToastMessage("BASTA " + (10 - episodios));
      console.log(episodios)
      episodios--;
      if (episodios < 0) {
        clearInterval(frizer);
        sendAnswers()
      }
    }, 1000);
  })

  window.socket.on('respuestas', function (data) {
    $('#tablaJuego').hide();
    $('#tablaResultados').empty();
    $('#tablaResultados').append(`
      <tr>
      <th class="quarter center">ID</th>
      <th class="quarter center">Nombre</th>
      <th class="quarter center">Color</th>
      <th class="quarter center">Fruto</th>
      </tr>
    `)
    for(let respuesta of data.respuestas){
      $('#tablaResultados').append(`
          <tr style="height: 55px";>
          <td class="quarter center">${respuesta.jugador}</td>
          <td class="quarter center">${respuesta.nombre}</td>
          <td class="quarter center">${respuesta.color}</td>
          <td class="quarter center">${respuesta.fruto}</td>
          </tr>
       `);
    }
  })

  window.socket.on('agregarJugador',function(data) {
    jugadores = data.jugadores;
    $('#tablaJuego').empty();
    $('#tablaJuego').append(`
      <tr>
      <th class="quarter center">ID</th>
      <th class="quarter center">Nombre</th>
      <th class="quarter center">Color</th>
      <th class="quarter center">Fruto</th>
      </tr>
    `)
    for(let jugador of jugadores){
      if (miNombre == jugador){
        $('#tablaJuego').append(`
          <tr style="height: 55px";>
          <td class="quarter center">${jugador}</td>
          <td class="quarter center"><input id="Nombre" value="" placeholder="Nombre"></td>
          <td class="quarter center"><input id="Color" value="" placeholder="Color"></td>
          <td class="quarter center"><input id="Fruto" value="" placeholder="Fruto"></td>
          </tr>
       `);
      } else {
        $('#tablaJuego').append(`
        <tr>
          <td class="center" style="width: 100%;">${jugador}</td>
        </tr>
    `)
    }
  }
  $('#submitBasta').show()
})
}

function bastaHandler(){
  let nombre = $('#Nombre').val().toLowerCase()
  let color = $('#Color').val().toLowerCase()
  let fruto = $('#Fruto').val().toLowerCase()
  if(nombre[0]==miLetra && color[0]==miLetra && fruto[0]==miLetra){
    window.socket.emit('yaBastaFrizer')
  }else{
    makeToastMessage(`Papi, ¿hablo en chino o qué? La letra es ${miLetra}`)
  }
}

async function avisarInicio() {
  makeToastMessage(`Preparen sus motores y alisten sus teclados, el juego va a comenzar.`);
  for(let i = 3; i>0; i--){
    makeToastMessage(`${i} segundos para empezar.`);
    await sleep(1000);
  }
}

function yaBastaFrizer(){
  let episodios = 10
  let frizer = setInterval(function () {
    makeToastMessage("Basta " + (10 - episodios));
    episodios--;
    if (episodios < 0) {
      clearInterval(frizer);
      sendAnswers()
    }
  }, 1000);
}

function iniciarJuego(configuracion) {
  miLetra = configuracion.letra.toLowerCase();
  makeToastMessage(`La letra es ${configuracion.letra}`);
}

function sendAnswers(){
  let nombre = $('#Nombre').val().toLowerCase()
  let color = $('#Color').val().toLowerCase()
  let fruto = $('#Fruto').val().toLowerCase()
  window.socket.emit('endgame', {nombre,color,fruto, jugador: miNombre})
}

function emitEventToSocketIo() {
  let text = $('#messageToServer').val();
  window.socket.emit('messageToServer', { text: text });
}

sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};


$(function () {
  connectToSocketIo();
});
