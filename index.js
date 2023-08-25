//
const Conf       = require('./config.js')
const Session    = require('express-session')
const cors       = require('cors')
const migrations = require('./migrations/migrations.js')
const uuid = require("uuid")
const bcrypt = require('bcrypt')
const express = require("express")
console.log( uuid.v4())
//START EXPRESS
let api    = express();
let server_admin = require('http').Server(api);

//CORS
const corsOptions = {
    credentials: true,
    origin: process.env.cors_origin.split(' ')
}
api.use(cors(corsOptions))

//FILES
api.use("/public", express.static('public'))
//
const bodyParser = require("body-parser")
api.use(bodyParser.json({limit: '5mb', extended: true}))

//SESION
api.use(Session({
    secret: 'admin_session_secret',
    saveUninitialized: false,
    resave: true,
}))

// DATABASE
const knex = require('knex')({
    client: 'mysql2',
    connection: {
        host: process.env.mysql_host,
        port: process.env.mysql_port,
        user: process.env.mysql_user,
        password: process.env.mysql_password,
        database: process.env.mysql_database,
        supportBigNumbers: true,
        bigNumberStrings: true,
        typeCast: function (field, next) {
            //console.log(field.table, field.name, field.type)
            if (field.type == "NEWDECIMAL") {
                //console.log("field", field)
                var value = field.string();
                return (value === null) ? null : Number(value);
            }
            return next();
        }
    },
    useNullAsDefault: true,
});
global.knex = knex

migrations.do_migrations()

//ROUTER
api.use("/", require("./middleware/admin_roles"))
api.listen(process.env.service_port_admin)
console.log("> puerto: ", process.env.service_port_admin)


setTimeout( async ()=> {
    let r = await bcrypt.hash("pass", 10)
if (r){
    console.log(r)
}

}, 10)