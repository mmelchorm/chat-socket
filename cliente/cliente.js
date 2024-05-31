let socket = io()

// Configurar el manejador del evento 'chat' una sola vez, cuando la página se carga
socket.on('chat', (codigo, usuario, msg) => {
    //
    const codigoLogeado = sessionStorage.getItem('codigo');
    tipo = (codigo == codigoLogeado)?'sent':'received';
    pintarHTML(tipo, usuario, msg);
   
});

socket.on('unirse', (usuario) => {
    pintarIngreso(usuario);
})

function grabar() {
    let mensaje = document.getElementById("mensaje");
    const codigo = sessionStorage.getItem('codigo');
    const usuario = sessionStorage.getItem('usuario');
    // console.log(codigo+'-'+usuario)
    if (mensaje.value != "") {
        socket.emit('chat', codigo, usuario, mensaje.value);
        mensaje.value = "";
        grabarMensaje(codigo,  mensaje.value);
    }
}

async function login() {
    let usuario = document.getElementById("username");
    let contra = document.getElementById("password");
    if(usuario.value !== "" && contra.value !== ""){

        const formData = new URLSearchParams();
        formData.append('username', usuario.value);
        formData.append('password', contra.value);

        try {
            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString()
            });

            const result = await response.json();

            sessionStorage.setItem('codigo', result.codigo);
            sessionStorage.setItem('usuario', result.usuario);

            if (response.ok) {
                Swal.fire('Success', 'Login successful', 'success').then(() => {
                    window.location.href = '/chat'; // Cambia esto a la ruta que desees después del login

                    // socket.emit('unirse', result.usuario)
                });
            } else {
                Swal.fire('Error', result.message || result, 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'An error occurred', 'error');
        }      
    } else {
        Swal.fire('Error', 'Datos vacios', 'warning');
    }
}

function pintarHTML(tipo, usuario, msg) {
     // Crear el HTML del mensaje utilizando template literals
     const messageHTML = `
     <div class="message ${tipo}">
         <small>${usuario}</small>
         <div class="message-content">
             ${msg}
         </div>
     </div>
 `;
 // Convertir el HTML string en un elemento DOM
 const contenedorMensajes = document.getElementById('contenedor_mensajes');
 contenedorMensajes.insertAdjacentHTML('beforeend', messageHTML);
 // Scroll para mostrar el último mensaje
 contenedorMensajes.scrollTop = contenedorMensajes.scrollHeight;
}

function pintarIngreso(usuario) {
   // grabarMensaje(0,  mensaje.value);
    // Crear el HTML del mensaje utilizando template literals
    const messageHTML = `
    <div class="text-center">
        <spamn>${usuario} se ha unido al chat</spamn>
    </div>
`;
// Convertir el HTML string en un elemento DOM
const contenedorMensajes = document.getElementById('contenedor_mensajes');
contenedorMensajes.insertAdjacentHTML('beforeend', messageHTML);
// Scroll para mostrar el último mensaje
contenedorMensajes.scrollTop = contenedorMensajes.scrollHeight;
}

async function grabarMensaje(usuario, mensaje) {
    if(usuario !== "" && mensaje !== ""){
        const formData = new URLSearchParams();
        formData.append('codigo', usuario);
        formData.append('mensaje', mensaje);

        try {
            const response = await fetch('/auth/mensaje', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString()
            });

            const result = await response.json();
            if (response.ok) {
                console.log(result.msg)
            } else {
                console.log(result.msg)
            }
        } catch (error) {
            console.log(error.msg);
            // Swal.fire('Error', error.text, 'error');
        }      
    } else {
        Swal.fire('Error', 'Datos vacios', 'warning');
    }
}

async function resultMensajes() {
    try {
        // Realizar la solicitud GET a la ruta /mensajes
        const response = await fetch('/auth/mensajes');
        const data = await response.json(); // Convertir la respuesta a JSON
        const codigoLogeado = sessionStorage.getItem('codigo');
        // Procesar cada mensaje obtenido
        data.forEach(mensaje => {
            if (mensaje.msg_usuario == 0) {
                pintarIngreso(mensaje.msg_nombre);
            }else{
                tipo = (mensaje.msg_usuario == codigoLogeado)?'sent':'received';
                pintarHTML(tipo, mensaje.msg_nombre, mensaje.msg_mensaje); // Llamar a la función pintarHTML para cada mensaje
            }
        });
    } catch (error) {
        console.error('Error:', error); // Imprimir cualquier error que ocurra
    }
}

function logout(){
    sessionStorage.clear();
    window.location.href = 'login.html'
}

async function registrarse() {
    let usuario = document.getElementById("username");
    let contra = document.getElementById("password");
    if(usuario.value !== "" && contra.value !== ""){

        const formData = new URLSearchParams();
        formData.append('username', usuario.value);
        formData.append('password', contra.value);

        try {
            const response = await fetch('/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formData.toString()
            });

            const result = await response.json();
            if (response.ok) {
                Swal.fire('Success', 'Login successful', 'success').then(() => {
                    window.location.href = '/'; // Cambia esto a la ruta que desees después del login

                    // socket.emit('unirse', result.usuario)
                });
            } else {
                Swal.fire('Error', result.message || result, 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'An error occurred '+error, 'error');
        }      
    } else {
        Swal.fire('Error', 'Datos vacios', 'warning');
    }
}