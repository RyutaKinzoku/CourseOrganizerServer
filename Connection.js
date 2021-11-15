const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser')
const app = express();
const mysql = require('mysql')


app.use(express.json())
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());

app.listen(process.env.PORT || 3000, function(){
    console.log(`running on port`, this.address().port, app.settings.env)
});

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

app.get('/obtenerCedula', (req,res) => {
    var sql = "SELECT Docente.cedula FROM Docente INNER JOIN Usuario ON Docente.email = Usuario.email WHERE Docente.email = ?"
    db.query(sql, [req.query.email], (err, result) => {
        if(err){
            res.send(err);
        } else {
            if(result.length > 0){
                res.send(result[0]);
            } else {
                sql = 'SELECT Estudiante.cedula FROM Estudiante INNER JOIN Usuario ON Estudiante.email = Usuario.email WHERE Estudiante.email = ?'
                db.query(sql, [req.query.email], (err, resulta) => {
                    if(err){
                        res.send(err);
                    } else {
                        res.send(resulta[0]);
                    }
                })
            }
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
        if(err){
            res.send(err);
        }

        sql = "INSERT INTO Persona (cedula, nombre, primerApellido, segundoApellido, email) VALUES (?,?,?,?,?);";
        db.query(sql , [cedula, nombre, primerApellido, segundoApellido, email] ,(err, _) => {
            if(err){
                res.send(err);
            }

            sql = "INSERT INTO Docente (cedula, nombre, primerApellido, segundoApellido, email) VALUES (?,?,?,?,?);";
            db.query(sql , [cedula, nombre, primerApellido, segundoApellido, email] ,(err, _) => {
                console.log(err);
                res.send(err);
            })
        })
    })
});

app.post("/borrarDocente", (req,res) =>{
    const cedula = req.body.cedula 
    var email;

    var sql = "select email from Persona where cedula = ?";
    console.log("CEDULAAA: " + cedula);
    db.query(sql , [cedula] ,(err, result) => {
        if(err){
            res.send(err);
        } else {
            email = result[0].email;

            sql = "delete from Docente where cedula = ?";
            db.query(sql , [cedula] ,(err, _) => {
                if(err){
                    res.send(err);
                }

                sql = "delete from Persona where cedula = ?";
                db.query(sql , [cedula] ,(err, _) => {
                    if(err){
                        res.send(err);
                    }
                    console.log("CORRRREOOOOO: "+email);
                    sql = "delete from Usuario where email = ?";
                    db.query(sql , [email] ,(err, _) => {
                        console.log(err);
                        res.send(err);
                    })
                })
            })
        }
    })
});

app.get('/obtenerDocente', (req,res) => {
    var sql = "SELECT d.cedula, d.nombre, d.primerApellido, d.segundoApellido, d.email FROM Docente d WHERE d.cedula = ?"
    db.query(sql, [req.query.cedula], (err, result) => {
        if(err){
            res.send(err);
        }
        sql = 'SELECT AVG(Calificacion.valor) FROM `Calificacion` WHERE Calificacion.cedula_docente = ? GROUP BY Calificacion.cedula_docente'
        db.query(sql, [req.query.cedula], (err, resulta) => {
            if(err){
                res.send(err);
            }
            if(resulta.length > 0){
                res.send([result[0], resulta[0]]);
            } else {
                res.send([result[0], 0]);
            }
        })
    })
});

app.get('/obtenerDocentes', (_,res) => {
    const sql = "select * from Docente"
    db.query(sql, (err, result) => {
        if(err){
            res.send(err);
        }
        res.send(result);
    })
});

app.post("/calificarDocente", (req,res) =>{
    var sql = "select * from Calificacion where cedula_docente = ? and cedula_estudiante = ?";
    db.query(sql , [req.body.cedulaDocente, req.body.cedulaEstudiante] ,(err, result) => {
        if(err){
            res.send(err);
        } else {
            if(result.length <= 0){
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
        }
    })
});

app.put('/actualizarDocente', (req,res) => {
    const nombre = req.body.nombre; 
    const primerApellido = req.body.primerApellido; 
    const segundoApellido = req.body.segundoApellido; 
    const cedula = req.body.cedula;
    var sql = "update Docente set nombre = ?, primerApellido = ?, segundoApellido = ? where cedula = ?;"
    db.query(sql, [nombre, primerApellido, segundoApellido, cedula], (err, _) => {
        if(err){
            res.send(err);
        }
        sql = "update Persona set nombre = ?, primerApellido = ?, segundoApellido = ? where cedula = ?;"
        db.query(sql, [nombre, primerApellido, segundoApellido, cedula], (err, _) => {
            res.send(err);
        })
    })
});

//Estudiante
app.post("/crearEstudiante", (req,res) =>{
    const cedula = req.body.cedula
    const nombre = req.body.nombre
    const primerApellido = req.body.primerApellido
    const segundoApellido = req.body.segundoApellido
    const grado = req.body.grado
    const email = req.body.email
    const contrasena = req.body.contrasena 

    var sql = "insert into Usuario (email, contrasena, rol) values (?, ?, ?)";
    db.query(sql , [email, contrasena, "Estudiante"] ,(err, _) => {
        if(err){
            res.send(err);
        }

        sql = "INSERT INTO Persona (cedula, nombre, primerApellido, segundoApellido, email) VALUES (?,?,?,?,?);";
        db.query(sql , [cedula, nombre, primerApellido, segundoApellido, email] ,(err, _) => {
            if(err){
                res.send(err);
            }

            sql = "INSERT INTO Estudiante (cedula, nombre, primerApellido, segundoApellido, gradoEscolar, email) VALUES (?,?,?,?,?,?);";
            db.query(sql , [cedula, nombre, primerApellido, segundoApellido, grado, email] ,(err, _) => {
                console.log(err);
                res.send(err);
            })
        })
    })
});

app.post("/borrarEstudiante", (req,res) =>{
    const cedula = req.body.cedula 
    var email;

    var sql = "select email from Persona where cedula = ?";
    db.query(sql , [cedula] ,(err, result) => {
        if(err){
            res.send(err);
        } else {
            email = result[0].email;

            sql = "delete from Estudiante where cedula = ?";
            db.query(sql , [cedula] ,(err, _) => {
                if(err){
                    res.send(err);
                }

                sql = "delete from Persona where cedula = ?";
                db.query(sql , [cedula] ,(err, _) => {
                    if(err){
                        res.send(err);
                    }

                    sql = "delete from Usuario where email = ?";
                    db.query(sql , [email] ,(err, _) => {
                        console.log(err);
                        res.send(err);
                    })
                })
            })
        }
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
    var sql = "update Estudiante set nombre = ?, primerApellido = ?, segundoApellido = ?, gradoEscolar = ? where cedula = ?;"
    db.query(sql, [nombre, primerApellido, segundoApellido, grado, cedula], (err, _) => {
        if(err){
            res.send(err);
        }
        sql = "update Persona set nombre = ?, primerApellido = ?, segundoApellido = ? where cedula = ?;"
        db.query(sql, [nombre, primerApellido, segundoApellido, cedula], (err, _) => {
            res.send(err);
        })
    })
});

//Cursos
app.post("/crearCurso", (req,res) =>{
    var sql = "insert into Curso (nombre, gradoEscolar) values (?, ?);";
    db.query(sql , [req.body.nombre, req.body.grado] ,(err, _) => {
        res.send(err);
    })
});

app.post("/borrarCurso", (req,res) =>{
    const idCurso = req.body.idCurso 
    var email;
    var sql = "delete from Tarea where ID_Curso = ?";
    db.query(sql , [idCurso] ,(err, _) => {
        if(err){
            res.send(err);
        }

        sql = "delete from Mensaje where ID_Curso = ?";
        db.query(sql , [idCurso] ,(err, _) => {
            if(err){
                res.send(err);
            }

            sql = "delete from Noticia where ID_Curso = ?";
            db.query(sql , [idCurso] ,(err, _) => {
                if(err){
                    res.send(err);
                }

                sql = "delete from CursoPorDia where ID_Curso = ?";
                db.query(sql , [idCurso] ,(err, _) => {
                    if(err){
                        res.send(err);
                    }

                    sql = "delete from EstudiantePorCurso where ID_Curso = ?";
                    db.query(sql , [idCurso] ,(err, _) => {
                        if(err){
                            res.send(err);
                        }

                        sql = "delete from Curso where id = ?";
                        db.query(sql , [idCurso] ,(err, _) => {
                            res.send(err);
                        })
                    })
                })
            })
        })
    })
});

app.get('/obtenerCurso', (req,res) => {
    var sql = "select * from Curso where id = ?"
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

app.get('/obtenerCursos', (_,res) => {
    var sql = "select * from Curso"
    db.query(sql, (err, result) => {
        if(err){
            res.send(err);
        }
        res.send(result);
    })
});

app.put('/actualizarCurso', (req,res) => {
    const idCurso = req.body.idCurso;
    const nombre = req.body.nombre; 
    const grado = req.body.grado; 
    var sql = "update Curso set nombre = ?, gradoEscolar = ? where id = ?"
    db.query(sql, [nombre, grado, idCurso], (err, _) => {
        res.send(err);
    })
});

app.get('/obtenerNombreDocenteDelCurso', (req,res) => {
    const sql = "select Docente.cedula, Docente.nombre, Docente.primerApellido, Docente.segundoApellido FROM Curso INNER JOIN Docente ON Curso.cedulaDocente = Docente.cedula WHERE Curso.id = ?"
    db.query(sql, [req.query.idCurso], (err, result) => {
        if(err){
            res.send(err);
        } else {
            res.send(result[0]);
        }
    })
});

app.get('/obtenerDocenteDelCurso', (req,res) => {
    const sql = "select d.cedula, d.nombre, d.primerApellido, d.segundoApellido, AVG(ca.valor), d.email FROM Curso cu INNER JOIN Docente d ON cu.cedulaDocente = d.cedula INNER JOIN Calificacion ca ON d.cedula = ca.cedula_docente WHERE cu.id = ? GROUP BY d.cedula"
    db.query(sql, [req.query.idCurso], (err, result) => {
        if(err){
            res.send(err);
        } else {
            res.send(result[0]);
        }
    })
});

app.get('/obtenerEstudiantesDelCurso', (req,res) => {
    const sql = "SELECT Estudiante.cedula, Estudiante.nombre, Estudiante.primerApellido, Estudiante.segundoApellido FROM Curso INNER JOIN EstudiantePorCurso ON Curso.id = EstudiantePorCurso.ID_Curso INNER JOIN Estudiante ON EstudiantePorCurso.cedulaEstudiante = Estudiante.cedula WHERE Curso.id = ?"
    db.query(sql, [req.query.idCurso], (err, result) => {
        if(err){
            res.send(err);
        } else {
            res.send(result);
        }
    })
});

app.get('/obtenerCursosProfesor', (req,res) => {
    const sql = "SELECT Curso.id, Curso.nombre FROM Curso INNER JOIN Docente ON Curso.cedulaDocente = Docente.cedula WHERE Curso.cedulaDocente = ?"
    db.query(sql, [req.query.cedula], (err, result) => {
        if(err){
            res.send(err);
        } else {
            res.send(result);
        }
    })
});

app.get('/obtenerCursosEstudiante', (req,res) => {
    const sql = "SELECT Curso.id, Curso.nombre FROM Curso INNER JOIN EstudiantePorCurso ON Curso.id = EstudiantePorCurso.ID_Curso INNER JOIN Estudiante ON EstudiantePorCurso.cedulaEstudiante = Estudiante.cedula where Estudiante.cedula = ?"
    db.query(sql, [req.query.cedula], (err, result) => {
        if(err){
            res.send(err);
        } else {
            res.send(result);
        }
    })
});

app.put("/asignarDocente", (req,res) =>{
    const sql = "update Curso set cedulaDocente = ? where id = ?";
    db.query(sql , [req.body.cedulaDocente, req.body.idCurso] ,(err, _) => {
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

app.post("/asignarEstudiante", (req,res) =>{
    const sql = "insert into EstudiantePorCurso (ID_Curso, cedulaEstudiante) values (?, ?)";
    db.query(sql , [req.body.idCurso, req.body.cedulaEstudiante] ,(err, _) => {
        console.log(err);
        res.send(err);
    })
});

app.post("/retirarEstudiante", (req,res) =>{
    const sql = "delete from EstudiantePorCurso where cedulaEstudiante = ? AND ID_Curso = ?";
    db.query(sql , [req.body.cedulaEstudiante, req.body.idCurso] ,(err, _) => {
        console.log(err);
        res.send(err);
    })
});

//Noticias
app.post("/crearNoticia", (req,res) =>{
    var sql = "insert into Noticia (mensaje, ID_Curso) values (?, ?)";
    db.query(sql , [req.body.mensaje, req.body.idCurso] ,(err, _) => {
        res.send(err);
    })
});

app.post("/borrarNoticia", (req,res) =>{
    var sql = "delete from Noticia where id = ?";
    db.query(sql , [req.body.idNoticia] ,(err, _) => {
        console.log(err);
        res.send(err);
    })
});

app.get('/obtenerNoticia', (req,res) => {
    const sql = "select * from Noticia where id = ?"
    db.query(sql, [req.query.idNoticia], (err, result) => {
        if(err){
            res.send(err);
        } else {
            res.send(result[0]);
        }
    })
});

app.get('/obtenerNoticias', (req,res) => {
    const sql = "select * from Noticia where ID_Curso = ?"
    db.query(sql, [req.query.idCurso], (err, result) => {
        if(err){
            res.send(err);
        } else {
            res.send(result);
        }
    })
});

app.put('/actualizarNoticia', (req,res) => {
    const sql = "update Noticia set mensaje = ? where id = ?"
    db.query(sql, [req.body.mensaje, req.body.idNoticia], (err, _) => {
        res.send(err);
    })
});

//Mensaje
app.post("/crearMensaje", (req,res) =>{
    var contenido = req.body.contenido;
    var fechaEnvio = req.body.fechaEnvio;
    var idCurso = req.body.idCurso;
    var emisor = req.body.emisor;
    var sql = "insert into Mensaje (contenido, fechaEnvio, ID_Curso, emisor) values (?, ?, ?, ?)";
    db.query(sql , [contenido, fechaEnvio, idCurso, emisor] ,(err, _) => {
        res.send(err);
    })
});

app.get('/obtenerMensajes', (req,res) => {
    const sql = "select * from Mensaje where ID_Curso = ?"
    db.query(sql, [req.query.idCurso], (err, result) => {
        if(err){
            res.send(err);
        } else {
            res.send(result);
        }
    })
});

//Tareas
app.post("/crearTarea", (req,res) =>{
    var descripcion = req.body.descripcion;
    var fechaEntrega = req.body.fechaEntrega;
    var idCurso = req.body.idCurso;
    var titulo = req.body.titulo;
    var sql = "insert into Tarea (descripcion, fechaEntrega, ID_Curso, titulo) values (?, ?, ?, ?)";
    db.query(sql , [descripcion, fechaEntrega, idCurso, titulo] ,(err, _) => {
        res.send(err);
    })
});

app.post("/borrarTarea", (req,res) =>{
    var sql = "delete from Tarea where id = ?";
    db.query(sql , [req.body.idTarea] ,(err, _) => {
        console.log(err);
        res.send(err);
    })
});

app.get('/obtenerTarea', (req,res) => {
    const sql = "select * from Tarea where id = ?"
    db.query(sql, [req.query.idTarea], (err, result) => {
        if(err){
            res.send(err);
        } else {
            res.send(result[0]);
        }
    })
});

app.get('/obtenerTareas', (req,res) => {
    const sql = "select * from Tarea where ID_Curso = ?"
    db.query(sql, [req.query.idCurso], (err, result) => {
        if(err){
            res.send(err);
        } else {
            res.send(result);
        }
    })
});

app.put('/actualizarTarea', (req,res) => {
    const idTarea = req.body.idTarea;
    const descripcion = req.body.descripcion; 
    const fechaEntrega = req.body.fechaEntrega; 
    const titulo = req.body.titulo; 
    const sql = "update Tarea set descripcion = ?, fechaEntrega = ?, titulo = ? where id = ?"
    db.query(sql, [descripcion, fechaEntrega, titulo, idTarea], (err, _) => {
        res.send(err);
    })
});

//Metodos curso
app.get('/obtenerNombreDocenteDelCurso', (req,res) => {
    const sql = "select Docente.nombre, Docente.primerApellido, Docente.segundoApellido FROM Curso INNER JOIN Docente ON Curso.cedulaDocente = Docente.cedula WHERE Curso.id = ?"
    db.query(sql, [req.query.idCurso], (err, result) => {
        if(err){
            res.send(err);
        } else {
            res.send(result[0]);
        }
    })
});

app.get('/obtenerEstudiantesDelCurso', (req,res) => {
    const sql = "SELECT Estudiante.nombre, Estudiante.primerApellido, Estudiante.segundoApellido FROM Curso INNER JOIN EstudiantePorCurso ON Curso.id = EstudiantePorCurso.ID_Curso INNER JOIN Estudiante ON EstudiantePorCurso.cedulaEstudiante = Estudiante.cedula WHERE Curso.id = ?"
    db.query(sql, [req.query.idCurso], (err, result) => {
        if(err){
            res.send(err);
        } else {
            res.send(result);
        }
    })
});

app.get('/obtenerCursosProfesor', (req,res) => {
    const sql = "SELECT Curso.id, Curso.nombre, Curso.gradoEscolar, Curso.cedulaDocente FROM Curso INNER JOIN Docente ON Curso.cedulaDocente = Docente.cedula WHERE Docente.email = ?"
    db.query(sql, [req.query.email], (err, result) => {
        if(err){
            res.send(err);
        } else {
            res.send(result);
        }
    })
});

app.get('/obtenerCursosEstudiante', (req,res) => {
    const sql = "SELECT Curso.id, Curso.nombre, Curso.gradoEscolar, Curso.cedulaDocente FROM Curso INNER JOIN EstudiantePorCurso ON Curso.id = EstudiantePorCurso.ID_Curso INNER JOIN Estudiante ON EstudiantePorCurso.cedulaEstudiante = Estudiante.cedula where Estudiante.email = ?"
    db.query(sql, [req.query.email], (err, result) => {
        if(err){
            res.send(err);
        } else {
            res.send(result);
        }
    })
});

app.get('/obtenerNombreDocenteDelCurso', (req,res) => {
    const sql = "select d.cedula, d.nombre, d.primerApellido, d.segundoApellido, AVG(ca.valor), d.email FROM Curso cu INNER JOIN Docente d ON cu.cedulaDocente = d.cedula INNER JOIN Calificacion ca ON d.cedula = ca.cedula_docente WHERE cu.id = ? GROUP BY d.cedula";
    db.query(sql, [req.query.idCurso], (err, result) => {
        if(err){
            res.send(err);
        } else {
            res.send(result[0]);
        }
    })
});
