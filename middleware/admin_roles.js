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
router.use("/usuario", require("../routes/notificaciones"))    
router.use("/general", require("../routes/general")) 

var paths = [
  
  { path: "/mascotas/perdidas_get_all", permisos: ['PERDIDA_GET_ALL'] },
  { path: "/mascotas/get_all", permisos: ['MASCOTAS_C_USER_ALL'] },
  { path: "/mascotas/get", permisos: ['MASCOTAS_C_USER_ONE'] },
  { path: "/mascotas/agregar", permisos: ['MASCOTAS_C_USER_ALL'] },
  { path: "/mascotas/quitar", permisos: ['MASCOTAS_C_USER_DEL'] },
  { path: "/mascotas/def_foto_principal", permisos: ['MASCO_C_USER_CIMG']  },
  { path: "/mascotas/editar", permisos: ['MASCOTAS_C_USER_EDIT']  },
  { path: "/mascotas/reportar_extravio", permisos: ['MASCO_REP_EXTRAVIO'] },
  { path: "/mascotas/reportar_avistamiento", permisos: ['MASCO_REP_AVISTAMIENTO']  },
  { path: "/mascotas/fue_encontrada", permisos: ['MASCO_MIN']  },
  
  { path: "/usuario/login" },
  { path: "/usuario/logout" },
  { path: "/usuario/registro" },
  { path: "/usuario/verifica_email" },
  { path: "/usuario/actualizar_datos" },
  { path: "/usuario/stat" },

  { path: "/usuario/get_notificaciones", permisos: ['MASCO_MIN'] },
  { path: "/usuario/notificacion_leida", permisos: ['MASCO_MIN'] },
  
  { path: "/general/preguntas_frecuentes"},
  { path: "/general/legal"}
]

