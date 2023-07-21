const express  = require('express')
const fs       = require('fs')
const router   = express.Router()
module.exports = router

const uuid = require("uuid")

router.post('/agregar_foto', async function (req, res) {
  console.log('[MASCOTAS][agregar_foto] ',req.body)

  try {


    return res.status(200).send({ stat: true, text: 'Foto guardada correctamente'})
  } catch (error) {
    console.log(error)
    return res.status(200).send({ stat: false, text: 'Error interno'})
  }
}) 

router.post('/eliminar_foto', async function (req, res) {
  console.log('[MASCOTAS][eliminar_foto] ',req.body)

  try {


    return res.status(200).send({ stat: true, text: 'Foto eliminada correctamente'})
  } catch (error) {
    console.log(error)
    return res.status(200).send({ stat: false, text: 'Error interno'})
  }
})

router.post('/agregar', async function (req, res) {
  console.log('[MASCOTAS][agregar] ',req.body)

  if (!req.body?.nombre)
    return res.status(200).send({ stat: false, text: 'Es necesario completar el nombre' })

  if (!req.body?.descripcion)
    return res.status(200).send({ stat: false, text: 'Es necesario completar la descripción' })
  
  if (!req.body?.fecha_nacimiento)
    return res.status(200).send({ stat: false, text: 'Es necesario completar la fecha de nacimiento' })

  try {
    var trx = await global.knex.transaction()
  } catch (error) {
    console.log(error)
    return res.status(200).send({ stat: false, text: 'Error interno'})
  }
  
  try { 
    let _insert = {
      id: uuid.v4(), fecha_registro: new Date(), fecha_actualizacion: new Date(),
      id_usuario: req.session.u_data.id,
      nombre: req.body.nombre, descripcion: req.body.descripcion, fecha_nacimiento: req.body.fecha_nacimiento,
      sexo: req.body?.sexo, raza: req.body?.raza
    }

    let imagenes = []
    if (req.body?.imagenes) imagenes = req.body?.imagenes

    for (let c=0; c < imagenes.length; c++){
      let base64Image = String(imagenes[c].base64).split(';base64,').pop();
      let extension = imagenes[c].type.split('age/')[1]
      fs.writeFile('public/img/'+new Date().getTime()+req.session.u_data.id+'.'+extension, base64Image, {encoding: 'base64'}, function(err) {
        console.log('File created');
      });
    }

    await trx('mascotas_registradas').insert(_insert)
    //await trx.commit()
    return res.status(200).send({ stat: true, text: 'Mascota registrada correctamente'})
  } catch (error) {
    trx.rollback()
    console.log(error)
    return res.status(200).send({ stat: false, text: 'Error interno'})
  }
})

router.put('/editar', async function (req, res) {
  console.log('[MASCOTAS][editar] ',req.body)

  res.status(200).send({ stat: false, text: 'Funcionalidad no implementada'})

})

router.get('/get_all', async function (req, res) {
    console.log('[MASCOTAS][get_all] ',req.query)

    try {
      res.status(200).send({ stat: true, data: 
        await global.knex("mascotas_registradas")
                .leftOuterJoin('imagenes_mascotas', 'imagenes_mascotas.id_mascota', 'mascotas_registradas.id')
                .select('mascotas_registradas.*', 'imagenes_mascotas.url as imagen')
      })
    } catch (error) {
      console.log(error)
      return res.status(200).send({ stat: false, text: 'Error interno'})
    }
})

router.get('/get', async function (req, res) {
  console.log('[MASCOTAS][get] ',req.query)

  if (!req.query?.id) 
    return res.status(200).send({ stat: false, data: [] })

  try {
    var mascota = await global.knex("mascotas_registradas")
                  .select().where({ id: req.query.id }).first()
    mascota['imagenes'] = await global.knex("imagenes_mascotas").select().where({ id_mascota: req.query.id })
  } catch (error) {
    console.log(error)
    return res.status(200).send({ stat: false, text: 'Error interno'})
  }
  res.status(200).send({ stat: true, data: mascota })
})