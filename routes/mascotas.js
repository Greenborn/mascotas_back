const express  = require('express')
const fs       = require('fs')
const router   = express.Router()
module.exports = router

const uuid = require("uuid")


router.post('/reportar_extravio', async function (req, res) {
  console.log('[MASCOTAS][reportar_extravio] ',req.body)

  if (!req.body?.datos_busqueda)
    return res.status(200).send({ stat: false, text: 'Es necesario completar los Datos de Búsqueda' })
  
  if (!req.body?.id_mascota)
    return res.status(200).send({ stat: false, text: 'Es necesario seleccionar una mascota' })

  try {
    let trx_0 = await global.knex.transaction()

    const id_user = req.session.u_data.id
    let existe = await global.knex('mascotas_registradas').select().where({ 'id': req.body.id_mascota, id_usuario: id_user }).first()
    if (!existe) {
      trx_0.rollback()
      return res.status(200).send({ stat: false, text: 'Ocurrió un error interno' })
    } else {
      await trx_0('reportes_extravios').insert({
        id: uuid.v4(),
        comentario: req.body?.datos_busqueda,
        id_mascota: req.body?.id_mascota,
        fecha_registro: new Date()
      })
      await trx_0("mascotas_registradas").update({
        perdida: 1
      }).where({ id: req.body?.id_mascota })
      await trx_0.commit()
      return res.status(200).send({ stat: true, text: 'Extravío reportado' })
    }
  } catch (error) {
    console.log(error)
    return res.status(200).send({ stat: false, text: 'Ocurrió un error interno' })
  }
})

const CARACTERES_COD = ['0','1','2','3','4','5','6','7','8','9','0','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z']
function get_codigo(numero){
  let salida = ''
  let cant_ch = CARACTERES_COD.length
  let terminar = false
  while (!terminar){
    let resto = numero % cant_ch
    numero    = Math.floor(numero / cant_ch)
    salida   += String(CARACTERES_COD[resto])
    if (numero == 0)
      terminar = true
  }
  return salida;
}

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
    let nro_mascota = 0
    //buscamos el ultimo numero de mascota para la generacion del QR
    let config = await global.knex('configuraciones').select().where({ 'id': 'nro_mascota' }).first()
    if (!config){
      nro_mascota = Number(1)
    } else {
      nro_mascota = Number(config.valor) + 1
    }

    const ID_MASCOTA = uuid.v4()
    let proms_arr = []
    let _insert = {
      id: ID_MASCOTA, fecha_registro: new Date(), fecha_actualizacion: new Date(),
      id_usuario: req.session.u_data.id, tipo: req.body.tipo, perdida: 0,
      nombre: req.body.nombre, descripcion: req.body.descripcion, fecha_nacimiento: new Date(req.body.fecha_nacimiento),
      sexo: req.body?.sexo, raza: req.body?.raza, numero: nro_mascota, codigo: get_codigo(nro_mascota)
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
        'id': uuid.v4(), 'url': ruta, 'id_mascota': ID_MASCOTA
      }
      lst_imgs.push(_i_i)
      proms_arr.push( trx('imagenes_mascotas').insert(_i_i) )
    }

    if (lst_imgs.length > 0)
      _insert['id_imagen_principal'] = lst_imgs[0].id

    proms_arr.push( trx('mascotas_registradas').insert(_insert) )
    proms_arr.push( trx('configuraciones').update({ 'valor': nro_mascota }).where({'id': 'nro_mascota'}) )

    let res_proms = await Promise.all( proms_arr )
    if (res_proms){
      await trx.commit()
      return res.status(200).send({ stat: true, text: 'Mascota registrada correctamente'})
    } else {
      trx.rollback()
      return res.status(200).send({ stat: false, text: 'Error interno'})
    }
    
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
          'id': uuid.v4(), 'url': ruta, 'id_mascota': req.body.id
        }
        lst_imgs.push(_i_i)
        proms_imgs.push( trx('imagenes_mascotas').insert(_i_i) )
      }
    }
    await Promise.all( proms_imgs )

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
                .select()
                .where({ 'id_usuario': id_user }),
        imagenes: await global.knex("imagenes_mascotas")
                  .select(['imagenes_mascotas.*', 'mascotas_registradas.id_usuario'])
                  .leftOuterJoin('mascotas_registradas', 'mascotas_registradas.id', 'imagenes_mascotas.id_mascota')
                  .where({ 'mascotas_registradas.id_usuario': id_user })
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

router.get('/get_qr', async function (req, res) {
  console.log('[MASCOTAS][get_qr] ',req.query)

  if (!req.query?.cod) 
    return res.status(200).send({ stat: false, data: [] })

  try {
    var mascota = await global.knex("mascotas_registradas")
                  .select().where({ codigo: req.query.cod }).first()
    if (mascota){
      mascota['imagenes'] = await global.knex("imagenes_mascotas").select().where({ id_mascota: mascota.id })
      
      res.status(200).send({ stat: true, data: mascota })
    } else {
      return res.status(200).send({ stat: false, text: 'Error interno'})
    }
    
  } catch (error) {
    console.log(error)
    return res.status(200).send({ stat: false, text: 'Error interno'})
  }
  
})