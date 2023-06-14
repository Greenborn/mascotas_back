//
const Conf       = require('./config.js')
const Session    = require('express-session')
const cors       = require('cors')
const migrations = require('./migrations/migrations.js')
const uuid = require("uuid")

console.log( uuid.v4())
//START EXPRESS
let api    = require('express')();
let server_admin = require('http').Server(api);

//CORS
const corsOptions = {
    credentials: true,
    origin: process.env.cors_origin.split(' ')
}
api.use(cors(corsOptions))

//FILES

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
    client: 'sqlite3',
    connection: {
      filename: process.env.SQLiteDB
    },
    useNullAsDefault: true,
});
global.knex = knex

migrations.do_migrations()

//ROUTER
api.use("/admin", require("./middleware/admin_roles"))

console.log("> puerto: ", process.env.service_port_admin)
server_admin.listen(process.env.service_port_admin)