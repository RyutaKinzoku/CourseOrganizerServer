const express = require('express')
const router = express.Router();
const mysql = require('mysql')
const cors = require('cors')
const bodyParser = require('body-parser')
const { query, request} = require('express')

const db = mysql.createPool({
    host : "remotemysql.com",
    user : "ufqeeBEoYK",
    password : "GX3ThsauGe",  
    port: 3306,
    database: "ufqeeBEoYK"
});

router.use(cors());
router.use(express.json())
router.use(bodyParser.urlencoded({extended: true}));

//Usuario
router.get('/iniciarSesion', (req,res) => {
    const sqlSelect = "select email, contrasena from Usuario where email = ?"
    db.query(sqlSelect, [req.query.correo, req.query.contrasena], (err, result) => {
        if(err){
            res.send(err)
        } else {
            res.send(result.length > 0 && result.first[1] == req.query.contrasena);
        }
    })
});

router.get('/obtenerRol', (req,res) => {
    const sqlSelect = "select rol from Usuario where email = ?"
    db.query(sqlSelect, [req.query.correo], (err, result) => {
        if(err){
            res.send(err)
        } else {
            res.send(result[0]);
        }
    })
});

router.get('/obtenerUsuario', (req,res) => {
    const sqlSelect = "select * from Usuario where email = ?"
    db.query(sqlSelect, [req.query.correo], (err, result) => {
        if(err){
            res.send(err)
        } else {
            res.send(result[0]);
        }
    })
});