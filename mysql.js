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
    const sql = "select email, contrasena from Usuario where email = ?"
    db.query(sql, [req.query.correo], (err, result) => {
        if(err){
            res.send(err);
        } else {
            res.send(result.length > 0 && result.data[0].contrasena == req.query.contrasena);
        }
    })
});

router.get('/obtenerRol', (req,res) => {
    const sql = "select rol from Usuario where email = ?"
    db.query(sql, [req.query.correo], (err, result) => {
        if(err){
            res.send(err);
        } else {
            res.send(result[0]);
        }
    })
});

router.get('/obtenerUsuario', (req,res) => {
    const sql = "select * from Usuario where email = ?"
    db.query(sql, [req.query.correo], (err, result) => {
        if(err){
            res.send(err);
        } else {
            res.send(result[0]);
        }
    })
});

//Docente
router.post("/crearDocente", (req,res) =>{
    const correo = req.body.correo 
    const contrasena = req.body.contrasena 
    const cedula = req.body.cedula 
    const nombre = req.body.nombre 
    const primerApellido = req.body.primerApellido 
    const segundoApellido = req.body.segundoApellido 

    var sql = "INSERT INTO Usuario (correo, contrasena, rol) VALUES (?,?,?);";
    db.query(sql , [correo, contrasena, "Docente"] ,(err, _) => {
        console.log(err);
        res.send(err);
    })

    sql = "INSERT INTO Persona (cedula, nombre, primerApellido, segundoApellido, correo) VALUES (?,?,?,?,?);";
    db.query(sql , [cedula, nombre, primerApellido, segundoApellido, correo] ,(err, _) => {
        console.log(err);
        res.send(err);
    })

    sql = "INSERT INTO Docente (cedula, nombre, primerApellido, segundoApellido, correo) VALUES (?,?,?,?,?);";
    db.query(sql , [cedula, nombre, primerApellido, segundoApellido, correo] ,(err, _) => {
        console.log(err);
        res.send(err);
    })
});

router.post("/borrarDocente", (req,res) =>{
    const cedula = req.body.cedula 
    var email;
    var sql = "delete from Docente where cedula = ?";
    db.query(sql , [cedula] ,(err, _) => {
        console.log(err);
        res.send(err);
    })

    sql = "select email from Persona where cedula = ?";
    db.query(sql , [cedula] ,(err, result) => {
        if(err){
            res.send(err);
        } else {
            email = result[0];
        }
    })

    sql = "delete from Persona where cedula = ?";
    db.query(sql , [cedula] ,(err, _) => {
        console.log(err);
        res.send(err);
    })

    sql = "delete from Usuario where email = ?";
    db.query(sql , [correo] ,(err, _) => {
        console.log(err);
        res.send(err);
    })
});

router.put("/asignarDocente", (req,res) =>{
    const sql = "update Curso set cedulaDocente = ? where ID_Curso = ?";
    db.query(sql , [req.body.cedula, req.body.idCurso] ,(err, _) => {
        console.log(err);
        res.send(err);
    })
});

router.put("/retirarDocente", (req,res) =>{
    const sql = "update Curso set cedulaDocente = Null where ID_Curso = ? AND cedulaDocente = ?";
    db.query(sql , [req.body.idCurso, req.body.cedula] ,(err, _) => {
        console.log(err);
        res.send(err);
    })
});

router.get('/obtenerDocente', (req,res) => {
    const sql = "SELECT d.cedula, d.nombre, d.primerApellido, d.segundoApellido, AVG(c.valor), d.email FROM Docente d INNER JOIN Calificacion c ON c.cedula_docente = d.cedula WHERE d.cedula = ?"
    db.query(sql, [req.query.cedula], (err, result) => {
        if(err){
            res.send(err);
        } else {
            res.send(result[0]);
        }
    })
});

router.put("/calificarDocente", (req,res) =>{
    var resultados;
    var sql = "select * from Calificacion where cedula_docente = ? and cedula_estudiante = ?";
    db.query(sql , [req.body.cedulaDocente, req.body.cedulaEstudiante] ,(err, result) => {
        if(err){
            res.send(err);
        } else {
            resultados = result;
        }
    })
    if(resultados.length <= 0){
        sql = "insert into Calificacion (valor, cedula_docente, cedula_estudiante) values(?, ?, ?)"
        db.query(sql , [req.body.calificacion, req.body.cedulaDocente, req.body.cedulaEstudiante] ,(err, _) => {
            res.send(err);
        })
    } else {
        sql = "update Calificacion set valor = ? where cedula_docente = ? and cedula_estudiante = ?"
        db.query(sql , [req.body.calificacion, req.body.cedulaDocente, req.body.cedulaEstudiante] ,(err, _) => {
            res.send(err);
        })
    }
});

router.get('/obtenerDocentes', (req,res) => {
    const sql = "select * from Docente"
    db.query(sql, [req.query.cedula], (err, result) => {
        if(err){
            res.send(err);
        } else {
            res.send(result);
        }
    })
});

router.get('/actualizarDocente', (req,res) => {
    const nombre = req.body.nombre; 
    const primerApellido = req.body.primerApellido; 
    const segundoApellido = req.body.segundoApellido; 
    const email = req.body.email; 
    const cedula = req.body.cedula;
    const sql = "update Docente set nombre = ?, primerApellido = ?, segundoApellido = ?, email = ? where cedula = ?;"
    db.query(sql, [nombre, primerApellido, segundoApellido, email, cedula], (err, _) => {
        res.send(err);
    })
    sql = "update Persona set nombre = ?, primerApellido = ?, segundoApellido = ? where cedula = ?;"
    db.query(sql, [nombre, primerApellido, segundoApellido, cedula], (err, _) => {
        res.send(err);
    })
});

module.exports = router;