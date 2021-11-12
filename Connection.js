const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser')
const app = express();
const mysql = require('mysql')


app.use(express.json())
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());
app.use('/api', require('./mysql.js'));

const port = process.env.PORT || 3000

app.listen(port, () =>
    console.log(`running on port ${port}`));

const db = mysql.createPool({
    host : "remotemysql.com",
    user : "ufqeeBEoYK",
    password : "GX3ThsauGe",  
    port: 3306,
    database: "ufqeeBEoYK"
});

app.get('/', (_,res) => {
    res.send('Conexión a MySQL')
});

//Usuario
app.get('/iniciarSesion', (req,res) => {
    const sql = "select email, contrasena from Usuario where email = ?"
    db.query(sql, [req.query.correo], async(err, result) => {
        if(err){
            res.send(err);
        } else {
            res.send(result.length > 0 && result[0].contrasena == req.query.contrasena);
        }
    })
});

app.get('/obtenerRol', (req,res) => {
    const sql = "select rol from Usuario where email = ?"
    db.query(sql, [req.query.correo], (err, result) => {
        if(err){
            res.send(err);
        } else {
            res.send(result[0]);
        }
    })
});

app.get('/obtenerUsuario', (req,res) => {
    const sql = "select * from Usuario where email = ?"
    db.query(sql, [req.query.correo], (err, result) => {
        if(err){
            res.send(err);
        } else {
            res.send(result[0]);
        }
    })
});
