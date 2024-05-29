const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database');
const router = express.Router();


// Ruta de registro
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send('Please provide both username and password');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.query('INSERT INTO usuarios (usu_usuario, usu_password, usu_situacion) VALUES (?, ?, 1)', [username, hashedPassword],
    (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).send('Username already exists');
            }
            return res.status(500).send('Server error');
        }
        res.status(201).redirect('/');
    });
});

// Ruta de login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send(req.body);
    }

    db.query('SELECT * FROM usuarios WHERE usu_situacion = 1 AND usu_usuario = ?', [username], async (err, results) => {
        // console.log(err)
        if (err) return res.status(500).send('Server error');
        if (results.length === 0) return res.status(400).send('El Usuario que buscas puede estar deshabilitado');

        const user = results[0];

        const isMatch = await bcrypt.compare(password, user.usu_password);

        if (!isMatch) return res.status(400).send('Invalid credentials');
        // Iniciar la sesión y guardar datos del usuario
        // req.session.codigo = user.usu_codigo;
        // req.session.usuario = user.usu_usuario;
        //---
        // res.redirect('/chat');
        res.json({ codigo: user.usu_codigo, usuario: user.usu_usuario });
        req.io.emit('unirse', user.usu_usuario);
    });
});


router.post('/mensaje', async (req, res) => {
    const { codigo, mensaje } = req.body;

    // Validar las entradas
    if (!codigo || !mensaje) {
        return res.status(400).send('codigo and mensaje are required');
    }

    // Obtener la fecha y hora actual y formatearlas como YYYY-MM-DD HH:mm:ss
    let now = new Date();
    let fechora = now.getFullYear() + '-' +
                  ('0' + (now.getMonth() + 1)).slice(-2) + '-' +
                  ('0' + now.getDate()).slice(-2) + ' ' +
                  ('0' + now.getHours()).slice(-2) + ':' +
                  ('0' + now.getMinutes()).slice(-2) + ':' +
                  ('0' + now.getSeconds()).slice(-2);

    // Realizar la consulta a la base de datos
    db.query('INSERT INTO mensajes (msg_usuario, msg_mensaje, msg_fechora) VALUES (?, ?, ?)', [codigo, mensaje, fechora],
    (err, result) => {
        if (err) {
            //console.error('Database error:', err); 
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).send('message already exists');
            }
            return res.status(500).send('Server error');
        }
        res.json({ msg: "mensaje guardado"});
    });
});

router.get('/mensajes', async (req, res) => {
    try {
        // Realizar la consulta a la base de datos para obtener todos los mensajes
        db.query('SELECT *, (SELECT usu_usuario FROM usuarios WHERE usu_codigo = msg_usuario) AS msg_nombre FROM mensajes ORDER BY msg_codigo ASC', (err, result) => {
            if (err) {
                console.error('Database error:', err); // Imprimir el error en la consola para depuración
                return res.status(500).send('Server error');
            }
            // Enviar los resultados como respuesta
            res.status(200).json(result);
        });
    } catch (error) {
        console.error('Error:', error); // Imprimir cualquier error que ocurra
        res.status(500).send('Server error');
    }
});

module.exports = router;
