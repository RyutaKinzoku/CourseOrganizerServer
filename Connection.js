const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser')
const app = express();
const mysql = require('mysql')


app.use(express.json())
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());
app.use('/api', require('./mysql.js'));

app.listen(3001, () =>
    console.log("running on port 3001"));

app.get('/', (_,res) => {
    res.send('Conexión a bases de datos')
});

const db = mysql.createPool({
    host : "remotemysql.com",
    user : "ufqeeBEoYK",
    password : "GX3ThsauGe",  
    port: 3306,
    database: "ufqeeBEoYK"
});

app.get('/iniciarSesion', (req,res) => {
    const sql = "select * from Usuario where email = ?"
    db.query(sql, [req.query.correo], (err, result) => {
        if(err){
            res.send(err);
        } else {
            res.send(result);
        }
    })
});