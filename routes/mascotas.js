const express = require('express')
const router = express.Router()
module.exports = router

router.get('/get_all', async function (req, res) {
    console.log('[MASCOTAS][get_all] ',req.body)

    res.status(200).send({ stat: true, data: 
        await global.knex("mascotas_registradas")
                .join('imagenes_mascotas', 'imagenes_mascotas.id_mascota', 'mascotas_registradas.id')
                .select('mascotas_registradas.*', 'imagenes_mascotas.url as imagen')
    })
  
})

router.get('/get', async function (req, res) {
  console.log('[MASCOTAS][get] ',req.query)

  if (!req.query?.id) 
    return res.status(200).send({ stat: false, data: [] })

  let mascota = await global.knex("mascotas_registradas")
                  .select('mascotas_registradas.*', 'imagenes_mascotas.url as imagen').where({ id: req.query.id }).first()
  mascota['imagenes'] = await global.knex("imagenes_mascotas").select().where({ id_mascota: req.query.id })

  res.status(200).send({ stat: true, data: mascota })

})