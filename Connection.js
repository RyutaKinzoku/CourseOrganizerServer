const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser')
const app = express();
const mysql = require('mysql')


app.use(express.json())
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());

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
    db.query(sql, [req.query.email], async(err, result) => {
        if(err){
            res.send(err);
        } else {
            res.send(result.length > 0 && result[0].contrasena == req.query.contrasena);
        }
    })
});

app.get('/obtenerRol', (req,res) => {
    const sql = "select rol from Usuario where email = ?"
    db.query(sql, [req.query.email], (err, result) => {
        if(err){
            res.send(err);
        } else {
            res.send(result[0]);
        }
    })
});

app.get('/obtenerUsuario', (req,res) => {
    const sql = "select * from Usuario where email = ?"
    db.query(sql, [req.query.email], (err, result) => {
        if(err){
            res.send(err);
        } else {
            res.send(result[0]);
        }
    })
});

//Docente
app.post("/crearDocente", (req,res) =>{
    const email = req.body.email 
    const contrasena = req.body.contrasena 
    const cedula = req.body.cedula 
    const nombre = req.body.nombre 
    const primerApellido = req.body.primerApellido 
    const segundoApellido = req.body.segundoApellido 

    var sql = "INSERT INTO Usuario (email, contrasena, rol) VALUES (?,?,?);";
    db.query(sql , [email, contrasena, "Docente"] ,(err, _) => {
        console.log(err);
        res.send(err);
    })

    sql = "INSERT INTO Persona (cedula, nombre, primerApellido, segundoApellido, email) VALUES (?,?,?,?,?);";
    db.query(sql , [cedula, nombre, primerApellido, segundoApellido, email] ,(err, _) => {
        console.log(err);
        res.send(err);
    })

    sql = "INSERT INTO Docente (cedula, nombre, primerApellido, segundoApellido, email) VALUES (?,?,?,?,?);";
    db.query(sql , [cedula, nombre, primerApellido, segundoApellido, email] ,(err, _) => {
        console.log(err);
        res.send(err);
    })
});

app.post("/borrarDocente", (req,res) =>{
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
    db.query(sql , [email] ,(err, _) => {
        console.log(err);
        res.send(err);
    })
});

app.put("/asignarDocente", (req,res) =>{
    const sql = "update Curso set cedulaDocente = ? where ID_Curso = ?";
    db.query(sql , [req.body.cedula, req.body.idCurso] ,(err, _) => {
        console.log(err);
        res.send(err);
    })
});

app.put("/retirarDocente", (req,res) =>{
    const sql = "update Curso set cedulaDocente = Null where ID_Curso = ? AND cedulaDocente = ?";
    db.query(sql , [req.body.idCurso, req.body.cedula] ,(err, _) => {
        console.log(err);
        res.send(err);
    })
});

app.get('/obtenerDocente', (req,res) => {
    const sql = "SELECT d.cedula, d.nombre, d.primerApellido, d.segundoApellido, AVG(c.valor), d.email FROM Docente d INNER JOIN Calificacion c ON c.cedula_docente = d.cedula WHERE d.cedula = ?"
    db.query(sql, [req.query.cedula], (err, result) => {
        if(err){
            res.send(err);
        } else {
            res.send(result[0]);
        }
    })
});

app.get('/obtenerDocentes', (req,res) => {
    const sql = "select * from Docente"
    db.query(sql, (err, result) => {
        if(err){
            res.send(err);
        } else {
            res.send(result);
        }
    })
});

app.put("/calificarDocente", (req,res) =>{
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

app.put('/actualizarDocente', (req,res) => {
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

//Estudiante
app.post("/crearEstudiante ", (req,res) =>{
    const cedula = req.body.cedula
    const nombre = req.body.nombre
    const primerApellido = req.body.primerApellido
    const segundoApellido = req.body.segundoApellido
    const grado = req.body.grado
    const email = req.body.email
    const contrasena = req.body.contrasena 

    var sql = "insert into Usuario (email, contrasena, rol) values (?, ?, ?)";
    db.query(sql , [email, contrasena, "Estudiante"] ,(err, _) => {
        console.log(err);
        res.send(err);
    })

    sql = "INSERT INTO Persona (cedula, nombre, primerApellido, segundoApellido, email) VALUES (?,?,?,?,?);";
    db.query(sql , [cedula, nombre, primerApellido, segundoApellido, email] ,(err, _) => {
        console.log(err);
        res.send(err);
    })

    sql = "INSERT INTO Estudiante (cedula, nombre, primerApellido, segundoApellido, gradoEscolar, email) VALUES (?,?,?,?,?,?);";
    db.query(sql , [cedula, nombre, primerApellido, segundoApellido, grado, email] ,(err, _) => {
        console.log(err);
        res.send(err);
    })
});

app.post("/borrarEstudiante", (req,res) =>{
    const cedula = req.body.cedula 
    var email;
    var sql = "delete from Estudiante where cedula = ?";
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
    db.query(sql , [email] ,(err, _) => {
        console.log(err);
        res.send(err);
    })
});

app.post("/asignarEstudiante", (req,res) =>{
    const sql = "insert into EstudiantePorCurso (ID_Curso, cedulaEstudiante) values (?, ?)";
    db.query(sql , [req.body.idCurso, req.body.cedulaEstudiante] ,(err, _) => {
        console.log(err);
        res.send(err);
    })
});

app.put("/retirarEstudiante", (req,res) =>{
    const sql = "delete from EstudiantePorCurso where cedulaEstudiante = ? AND ID_Curso = ?";
    db.query(sql , [req.body.cedulaEstudiante, req.body.idCurso] ,(err, _) => {
        console.log(err);
        res.send(err);
    })
});

app.get('/obtenerEstudiante', (req,res) => {
    const sql = "select * from Estudiante where cedula = ?"
    db.query(sql, [req.query.cedula], (err, result) => {
        if(err){
            res.send(err);
        } else {
            res.send(result[0]);
        }
    })
});

app.get('/obtenerEstudiantes', (req,res) => {
    const sql = "select * from Estudiante"
    db.query(sql, (err, result) => {
        if(err){
            res.send(err);
        } else {
            res.send(result);
        }
    })
});

app.put('/actualizarEstudiante', (req,res) => {
    const cedula = req.body.cedula;
    const nombre = req.body.nombre; 
    const primerApellido = req.body.primerApellido; 
    const segundoApellido = req.body.segundoApellido; 
    const grado = req.body.grado; 
    const email = req.body.email; 
    const sql = "update Estudiante set nombre = ?, primerApellido = ?, segundoApellido = ?, gradoEscolar = ?, email = ? where cedula = ?;"
    db.query(sql, [nombre, primerApellido, segundoApellido, email, grado, cedula], (err, _) => {
        res.send(err);
    })
    sql = "update Persona set nombre = ?, primerApellido = ?, segundoApellido = ? where cedula = ?;"
    db.query(sql, [nombre, primerApellido, segundoApellido, cedula], (err, _) => {
        res.send(err);
    })
});

//Cursos
app.post("/crearCurso ", (req,res) =>{
    var idCurso;
    var sql = "insert into Curso (nombre, gradoEscolar) values (?, ?); SELECT LAST_INSERT_ID()";
    db.query(sql , [req.query.nombre, req.query.grado] ,(err, result) => {
        if(err){
            res.send(err);
        } else {
            idCurso = result;
        }
    })

    sql = "insert into CursoPorDia (ID_Curso, dia, horaInicio, horaFin) values (?, ?, ?, ?)";

    for(const t of req.query.horario){
        var partes = t.split(" ");
        db.query(sql , [idCurso, partes[1], partes[2], partes[3]] ,(err, _) => {
            if(err){
                res.send(err);
            }
        })
    }
});

app.post("/borrarCurso", (req,res) =>{
    const idCurso = req.body.idCurso 
    var email;
    var sql = "delete from Tarea where ID_Curso = ?";
    db.query(sql , [idCurso] ,(err, _) => {
        if(err){
            res.send(err);
        }
    })

    sql = "delete from Mensaje where ID_Curso = ?";
    db.query(sql , [idCurso] ,(err, _) => {
        if(err){
            res.send(err);
        }
    })

    sql = "delete from Noticia where ID_Curso = ?";
    db.query(sql , [idCurso] ,(err, _) => {
        if(err){
            res.send(err);
        }
    })

    sql = "delete from CursoPorDia where ID_Curso = ?";
    db.query(sql , [idCurso] ,(err, _) => {
        console.log(err);
        res.send(err);
    })

    sql = "delete from EstudiantePorCurso where ID_Curso = ?";
    db.query(sql , [idCurso] ,(err, _) => {
        console.log(err);
        res.send(err);
    })

    sql = "delete from Curso where ID_Curso = ?";
    db.query(sql , [idCurso] ,(err, _) => {
        console.log(err);
        res.send(err);
    })
});

app.get('/obtenerCurso', (req,res) => {
    const sql = "select * from Curso where ID_Curso = ?"
    db.query(sql, [req.query.idCurso], (err, result) => {
        if(err){
            res.send(err);
        } else {
            sql = "select * from CursoPorDia where ID_Curso = ?"
            db.query(sql, [req.query.idCurso], (err, resulta) => {
                if(err){
                    res.send(err);
                } else {
                    res.send([result[0], resulta]);
                }
            })
        }
    })
});

app.get('/obtenerCursos', (req,res) => {
    var cursos = [];
    const sql = "select * from Curso"
    db.query(sql, (err, result) => {
        if(err){
            res.send(err);
        } else {
            sql = "select * from CursoPorDia where ID_Curso = ?"
            for(var curso of result){
                db.query(sql, [curso[0]], (err, resulta) => {
                    if(err){
                        res.send(err);
                    } else {
                        cursos.push([curso, resulta]);
                    }
                })
            }
        }
    })
    res.send(cursos);
});

app.put('/actualizarCurso', (req,res) => {
    const idCurso = req.body.idCurso;
    const nombre = req.body.nombre; 
    const grado = req.body.grado; 
    const horario = req.body.horario; 
    const sql = "update Curso set nombre = ?, gradoEscolar = ? where ID_Curso = ?"
    db.query(sql, [nombre, grado, idCurso], (err, _) => {
        if(err){
            res.send(err);
        } else {
            sql = 'update CursoPorDia set dia = ?, horaInicio = ?, horaFin = ? where idCurso = ? and dia = "Martes"'
            for(const t of req.query.horario){
                var partes = t.split(" ");
                db.query(sql , [idCurso, partes[0], partes[1], partes[2]] ,(err, _) => {
                    if(err){
                        res.send(err);
                    }
                })
            }
        }
    })
});