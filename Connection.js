const express = require('express');
const cors = require('cors')
const bodyParser = require('body-parser')
const app = express();


app.use(express.json())
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());
app.use('/api', require('./mysql.js'));

app.listen(3001, () =>
    console.log("running on port 3001"));

app.get('/', (_,res) => {
    res.send('Conexión a bases de datos')
});