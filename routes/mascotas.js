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
    const id_mascota = uuid.v4()
    let _insert = {
      id: id_mascota, fecha_registro: new Date(), fecha_actualizacion: new Date(),
      id_usuario: req.session.u_data.id, tipo: req.body.tipo,
      nombre: req.body.nombre, descripcion: req.body.descripcion, fecha_nacimiento: req.body.fecha_nacimiento,
      sexo: req.body?.sexo, raza: req.body?.raza
    }

    let imagenes = []
    if (req.body?.imagenes) imagenes = req.body?.imagenes

    for (let c=0; c < imagenes.length; c++){
      let base64Image = String(imagenes[c].base64).split(';base64,').pop();
      let extension = imagenes[c].type.split('age/')[1]

      const ruta = 'public/img/'+new Date().getTime()+req.session.u_data.id+'.'+extension
      fs.writeFile(ruta, base64Image, {encoding: 'base64'}, function(err) {
        console.log('File created');
      });

      await trx('imagenes_mascotas').insert({
        'id': uuid.v4(), 'url': ruta, 'id_mascota': id_mascota
      })
    }

    await trx('mascotas_registradas').insert(_insert)
    await trx.commit()
    return res.status(200).send({ stat: true, text: 'Mascota registrada correctamente'})
  } catch (error) {
    trx.rollback()
    console.log(error)
    return res.status(200).send({ stat: false, text: 'Error interno'})
  }
})

router.put('/editar', async function (req, res) {
  console.log('[MASCOTAS][editar] ',req.body)

  if (!req.body?.id)
    return res.status(200).send({ stat: false, text: 'Error interno' })

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
    let _edit = {
      fecha_actualizacion: new Date(),
      id_usuario: req.session.u_data.id, tipo: req.body.tipo,
      nombre: req.body.nombre, descripcion: req.body.descripcion, fecha_nacimiento: req.body.fecha_nacimiento,
      sexo: req.body?.sexo, raza: req.body?.raza
    }
    
    await trx('mascotas_registradas').update(_edit).where({ 'id': req.body.id })
    await trx.commit()
    return res.status(200).send({ stat: true, text: 'Mascota Editada correctamente'})

  } catch (error) {
    trx.rollback()
    console.log(error)
    return res.status(200).send({ stat: false, text: 'Error interno'})
  }

})

router.delete('/quitar', async function (req, res) {
  console.log('[MASCOTAS][quitar] ',req.body)

  if (!req.body?.id)
    return res.status(200).send({ stat: false, text: 'Error interno' })

  try {
    var trx = await global.knex.transaction()
  } catch (error) {
    console.log(error)
    return res.status(200).send({ stat: false, text: 'Error interno'})
  }

  try {
    let del_masco     = await trx('mascotas_registradas').delete().where({ 'id': req.body.id })
    let del_img_masco = await trx("imagenes_mascotas").delete().where({ 'id_mascota': req.body.id })
    
    if ( del_masco && del_img_masco ) {
      await trx.commit()
      return res.status(200).send({ stat: true, text: 'Mascota Eliminada correctamente'})
    } else {
      trx.rollback()
      console.log( del_masco && del_img_masco )
      return res.status(200).send({ stat: true, text: 'No se pudo eliminar'})
    }
  } catch (error) {
    trx.rollback()
    console.log(error)
    return res.status(200).send({ stat: false, text: 'Error interno'})
  }

})

router.put('/def_foto_principal', async function (req, res) {
  console.log('[MASCOTAS][def_foto_principal] ',req.body)

  if (!req.body?.id_mascota)
    return res.status(200).send({ stat: false, text: 'Error interno' })

  if (!req.body?.id_imagen)
    return res.status(200).send({ stat: false, text: 'Error interno' })

  
  try {
    let img_perfil_existe = await global.knex("imagenes_mascotas").select().where({
      'id': req.body.id_imagen, 'id_mascota': req.body.id_mascota
    }).first()

    if (!img_perfil_existe) {
      console.log('Imagen no encontrada')
      return res.status(200).send({ stat: false, text: 'Error interno'})
    } else {
      console.log(666,img_perfil_existe)
      await global.knex("mascotas_registradas").update({ 'id_imagen_principal': req.body.id_imagen, fecha_actualizacion: new Date() }).where({ 'id': req.body.id_mascota })
      return res.status(200).send({ stat: true, text: 'Imagen de perfil definida correctamente'})
    }

  } catch (error) {
    console.log(error)
    return res.status(200).send({ stat: false, text: 'Error interno'})
  }

})

router.get('/get_all', async function (req, res) {
    console.log('[MASCOTAS][get_all] ',req.query)

    try {
      const id_user = req.session.u_data.id

      res.status(200).send({ stat: true, 
        data: await global.knex("mascotas_registradas")
                .leftOuterJoin('imagenes_mascotas', 'imagenes_mascotas.id_mascota', 'mascotas_registradas.id')
                .select('mascotas_registradas.*', 'imagenes_mascotas.url as imagen')
                .where({ 'id_usuario': id_user }),
        imagenes: await global.knex("imagenes_mascotas")
                  .leftOuterJoin('mascotas_registradas', 'mascotas_registradas.id', 'imagenes_mascotas.id_mascota')
                  .select(['imagenes_mascotas.*', 'mascotas_registradas.id_usuario'])
                  .where({ 'id_usuario': id_user })
      })
    } catch (error) {
      console.log(error)
      return res.status(200).send({ stat: false, text: 'Error interno'})
    }
})

router.get('/perdidas_get_all', async function (req, res) {
  console.log('[MASCOTAS][perdidas_get_all] ',req.query)

  try {
    res.status(200).send({ stat: true, 
      data: await global.knex("mascotas_registradas")
              .leftOuterJoin('imagenes_mascotas', 'imagenes_mascotas.id_mascota', 'mascotas_registradas.id')
              .select('mascotas_registradas.*', 'imagenes_mascotas.url as imagen')
              .where({ 'perdida': 1 }),
      imagenes: await global.knex("imagenes_mascotas")
                .leftOuterJoin('mascotas_registradas', 'mascotas_registradas.id', 'imagenes_mascotas.id_mascota')
                .select(['imagenes_mascotas.*', 'mascotas_registradas.id_usuario'])
                .where({ 'perdida': 1 }),
      registro_perdida: await global.knex("reportes_extravios").select()
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