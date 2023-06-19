const express = require('express')
const router = express.Router()
module.exports = router

router.get('/get_all', async function (req, res) {
    console.log('[MASCOTAS][get_all] ',req.body)
    console.log(req.session)
    res.status(200).send({ stat: true, data: 
        await global.knex("mascotas_registradas")
                .join('imagenes_mascotas', 'imagenes_mascotas.id_mascota', 'mascotas_registradas.id')
                .select('mascotas_registradas.*', 'imagenes_mascotas.url as imagen')
    })
  
  })