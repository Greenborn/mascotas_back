const CONFIG = require('dotenv').config()
global.CONFIG = CONFIG.parsed

console.log("> .env")
const ENV_REQUIRED = [
    "cors_origin",
    "mysql_host","mysql_port", "mysql_user", "mysql_password", "mysql_database",
    "service_port_admin"
]

let error = false
ENV_REQUIRED.map(variable => {
    if (!process.env[variable]) {
        error = true
        console.error("Revisar: ", variable)
    }
})

if (error) {
    console.log("> Saliendo")
    process.exit(1);
}