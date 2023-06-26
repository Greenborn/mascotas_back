const express = require('express')
const _ = require("lodash")
const router = express.Router()
const { check_roles } = require("./check_roles")
module.exports = router

router.use(function (request, response, next) {
  console.log(request.session)
  console.log("admin middleware path ", request.path)
  check_roles(request, response, next, paths)
})

router.use("/mascotas", require("../routes/mascotas"))  
router.use("/usuario", require("../routes/usuarios"))  
router.use("/general", require("../routes/general"))  

var paths = [
  
  { path: "/mascotas/get_all" },
  { path: "/mascotas/get" },

  { path: "/usuario/login" },
  { path: "/usuario/logout" },
  { path: "/usuario/registro" },
  { path: "/usuario/verifica_email" },
  { path: "/usuario/stat" },
  
  { path: "/general/preguntas_frecuentes"}
]

