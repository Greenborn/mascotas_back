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

router.use("/varios", require("../routes/varios")) //pruebas 

router.use("/mascotas", require("../routes/mascotas"))  
router.use("/usuario", require("../routes/usuarios"))  

var paths = [
  
  { path: "/varios/" },
  { path: "/mascotas/get_all" },

  { path: "/usuario/login" },
]

