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

