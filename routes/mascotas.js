const express  = require('express')
const fs       = require('fs')
const router   = express.Router()
module.exports = router

const uuid = require("uuid")

router.post('/reportar_avistamiento', async function (req, res) {
  console.log('[MASCOTAS][reportar_avistamiento] ',req.body)

  if (!req.body?.descripcion)
    return res.status(200).send({ stat: false, text: 'Es necesario completar la descripción' })

  if (!req.body?.id)
    return res.status(200).send({ stat: false, text: 'Es necesario completar la id_reporte' })

  try {
    var trx_ra = await global.knex.transaction()
  } catch (error) {
    console.log(error)
    return res.status(200).send({ stat: false, text: 'Error interno'})
  }

  try {
    const id_user = req.session.u_data.id

    let busqueda_reporte = await global.knex('reportes_extravios').select().where({ 'id': req.body?.id }).first()
    if (!busqueda_reporte){
      trx_ra.rollback()
      console.log('reporte no encontrado')
      return res.status(200).send({ stat: false, text: 'Ocurrió un error interno' })
    } else {
      let busqueda_mascota = await global.knex('mascotas_registradas').select().where({ 'id': busqueda_reporte.id_mascota }).first()
      if (!busqueda_mascota){
        trx_ra.rollback()
        console.log('reporte no encontrado')
        return res.status(200).send({ stat: false, text: 'Mascota no encontrada' })
      } else {
        const rep_avistamiento = {
          id: uuid.v4(),
          descripcion: req.body?.descripcion,
          id_reporte: req.body?.id,
          fecha_creado: new Date(),
          ubicacion: '',
          id_mascota: busqueda_reporte.id_mascota,
          id_usuario: id_user,
        }
        let insert = await trx_ra('resportes_avistamiento').insert(rep_avistamiento)
        await trx_ra('notificaciones').insert({
          id: uuid.v4(),
          id_usuario: busqueda_mascota.id_usuario,
          leida: 0,
          archivada:0,
          titulo: 'Reporte de Aparición',
          contenido: req.body?.descripcion,
          meta_data: JSON.stringify({ pet: busqueda_mascota, rep: rep_avistamiento }),
          fecha_creado: new Date()
        })
        if (insert){
          await trx_ra.commit()
          return res.status(200).send({ stat: true, text: 'Reporte de avistamiento registrado correctamente.' })
        } else {
          trx_ra.rollback()
          return res.status(200).send({ stat: false, text: 'No se pudo ingresar reporte de avistamiento.' })
        }
      }
      
    }

  } catch (error) {
    console.log(error)
    trx_ra.rollback()
    return res.status(200).send({ stat: false, text: 'Ocurrió un error interno' })
  }

  return res.status(200).send({ stat: false, text: 'Funcionalidad aún no implementada' })
})

router.post('/reportar_extravio', async function (req, res) {
  console.log('[MASCOTAS][reportar_extravio] ',req.body)

  if (!req.body?.datos_busqueda)
    return res.status(200).send({ stat: false, text: 'Es necesario completar los Datos de Búsqueda' })
  
  if (!req.body?.id_mascota)
    return res.status(200).send({ stat: false, text: 'Es necesario seleccionar una mascota' })
  
  try {
    let db_trx = await global.knex.transaction()

    const id_user = req.session.u_data.id
    let existe = await global.knex('mascotas_registradas').select().where({ 'id': req.body.id_mascota, id_usuario: id_user }).first()
    if (!existe)
      return res.status(200).send({ stat: false, text: 'Ocurrió un error interno' })
    else {
      let insert = await db_trx('reportes_extravios').insert({
        id: uuid.v4(),
        comentario: req.body?.datos_busqueda,
        id_mascota: req.body?.id_mascota,
        fecha_registro: new Date()
      })
      let update = await db_trx('mascotas_registradas').update({ perdida: 1 }).where({ 'id': req.body.id_mascota, id_usuario: id_user })
      if (insert && update ){
        await db_trx.commit()
        return res.status(200).send({ stat: true, text: 'Extravío reportado' })
      } else {
        db_trx.rollback()
        return res.status(200).send({ stat: false, text: 'Ocurrió un error interno' })
      }
      
    }
  } catch (error) {
    console.log(error)
    return res.status(200).send({ stat: false, text: 'Ocurrió un error interno' })
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
      nombre: req.body.nombre, descripcion: req.body.descripcion, fecha_nacimiento: new Date(req.body.fecha_nacimiento),
      sexo: req.body?.sexo, raza: req.body?.raza
    }

    let imagenes = []
    if (req.body?.imagenes) imagenes = req.body?.imagenes

    let lst_imgs = []
    for (let c=0; c < imagenes.length; c++){
      let base64Image = String(imagenes[c].base64).split(';base64,').pop();
      let extension = imagenes[c].type.split('age/')[1]

      const ruta = 'public/img/'+new Date().getTime()+req.session.u_data.id+'.'+extension
      fs.writeFile(ruta, base64Image, {encoding: 'base64'}, function(err) {
        console.log('File created');
      });

      const _i_i = {
        'id': uuid.v4(), 'url': ruta, 'id_mascota': id_mascota, 'id_usuario': req.session.u_data.id
      }
      lst_imgs.push(_i_i)
      await trx('imagenes_mascotas').insert(_i_i)
    }

    if (lst_imgs.length > 0)
      _insert['id_imagen_principal'] = lst_imgs[0].id

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

    let imagenes = []
    if (req.body?.imagenes) imagenes = req.body?.imagenes

    let lst_imgs = []
    let proms_imgs = []
    for (let c=0; c < imagenes.length; c++){
      if (imagenes[c]?.base64 != undefined){
        let base64Image = String(imagenes[c].base64).split(';base64,').pop();
        let extension = imagenes[c].type.split('age/')[1]

        const ruta = 'public/img/'+new Date().getTime()+req.session.u_data.id+'.'+extension
        fs.writeFile(ruta, base64Image, {encoding: 'base64'}, function(err) {
          console.log('File created');
        });

        const _i_i = {
          'id': uuid.v4(), 'url': ruta, 'id_mascota': req.body.id, 'id_usuario': req.session.u_data.id
        }
        lst_imgs.push(_i_i)
        proms_imgs.push( trx('imagenes_mascotas').insert(_i_i) )
      }
    }
    await Promise.all( proms_imgs )

    await trx('mascotas_registradas').update(_edit).where({ 'id': req.body.id, 'id_usuario': req.session.u_data.id })
    await trx.commit()
    return res.status(200).send({ stat: true, text: 'Mascota Editada correctamente'})

  } catch (error) {
    trx.rollback()
    console.log(error)
    return res.status(200).send({ stat: false, text: 'Error interno'})
  }

})

router.put('/fue_encontrada', async function (req, res) {
  console.log('[MASCOTAS][editar] ',req.body)

  if (!req.body?.id)
    return res.status(200).send({ stat: false, text: 'Error interno' })

  try {
    var trx = await global.knex.transaction()
  } catch (error) {
    console.log(error)
    return res.status(200).send({ stat: false, text: 'Error interno'})
  }

  try {
    let _edit = {
      perdida: 0
    }

    await trx('mascotas_registradas').update(_edit).where({ 'id': req.body.id, 'id_usuario': req.session.u_data.id })
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
    let del_masco     = await trx('mascotas_registradas').delete().where({ 'id': req.body.id, 'id_usuario': req.session.u_data.id })
    let del_img_masco = await trx("imagenes_mascotas").delete().where({ 'id_mascota': req.body.id, 'id_usuario': req.session.u_data.id })
    
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
      'id': req.body.id_imagen, 'id_mascota': req.body.id_mascota, 'id_usuario': req.session.u_data.id
    }).first()

    if (!img_perfil_existe) {
      console.log('Imagen no encontrada')
      return res.status(200).send({ stat: false, text: 'Error interno'})
    } else {
      console.log(666,img_perfil_existe)
      await global.knex("mascotas_registradas").update({ 'id_imagen_principal': req.body.id_imagen, fecha_actualizacion: new Date() })
        .where({ 'id': req.body.id_mascota, 'id_usuario': req.session.u_data.id })
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
                .select()
                .where({ 'id_usuario': id_user }),
        imagenes: await global.knex("imagenes_mascotas")
                  .leftOuterJoin('mascotas_registradas', 'mascotas_registradas.id', 'imagenes_mascotas.id_mascota')
                  .select(['imagenes_mascotas.*', 'mascotas_registradas.id_usuario'])
                  .where({ 'imagenes_mascotas.id_usuario': id_user })
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
    mascota['imagenes'] = await global.knex("imagenes_mascotas").select().where({ id_mascota: req.query.id, 'id_usuario': req.session.u_data.id })
  } catch (error) {
    console.log(error)
    return res.status(200).send({ stat: false, text: 'Error interno'})
  }
  res.status(200).send({ stat: true, data: mascota })
})