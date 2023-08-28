const uuid = require("uuid")

exports.do_migrations = async function () {
    if (! await hasTable("tipo_mascota")) {
        console.log("Creo tabla tipo_mascota")
        await global.knex.schema.createTable('tipo_mascota', function (table) {
          table.primary(["id"])
          table.string('id', 36)
          table.string('tipo')
        })
    }

    if (! await hasTable("mascotas_registradas")) {
        console.log("Creo tabla mascotas_registradas")
        await global.knex.schema.createTable('mascotas_registradas', function (table) {
          table.primary(["id"])
          table.string('id', 36)
          table.datetime('fecha_registro')
          table.datetime('fecha_actualizacion')
          table.string('id_usuario', 36)
          table.string('tipo', 36)
          table.datetime('fecha_nacimiento')
          table.string('sexo', 36)
          table.string('raza', 36)
          table.string('nombre', 255)
          table.string('id_imagen_principal', 36)
          table.integer('perdida')
          table.string('descripcion', 512)
        })
    }

    if (! await hasTable("imagenes_mascotas")) {
        console.log("Creo tabla imagenes_mascotas")
        await global.knex.schema.createTable('imagenes_mascotas', function (table) {
          table.primary(["id"])
          table.string('id', 36)
          table.string('url',255)
          table.string('id_mascota',36)
        })
    }

    if (! await hasTable("reportes_extravios")) {
      console.log("Creo tabla reportes_extravios")
      await global.knex.schema.createTable('reportes_extravios', function (table) {
        table.primary(["id"])
        table.string('id', 36)
        table.string('comentario',2048)
        table.string('id_mascota',36)
        table.datetime('fecha_registro')
      })
  }

    if (! await hasTable("preguntas_frecuentes")) {
        console.log("Creo tabla preguntas_frecuentes")
        await global.knex.schema.createTable('preguntas_frecuentes', function (table) {
          table.primary(["id"])
          table.string('id', 36)
          table.string('pregunta',255)
          table.string('respuesta',2048)
          table.integer('orden')
        })
    }

    if (! await hasTable("legal")) {
        console.log("Creo tabla legal")
        await global.knex.schema.createTable('legal', function (table) {
          table.primary(["id"])
          table.string('id', 36)
          table.string('texto',4096)
        })
    }

    if (! await hasTable("usuario")) {
        console.log("Creo tabla usuario")
        await global.knex.schema.createTable('usuario', function (table) {
          table.primary(["id"])
          table.string('id', 36)
          table.string('nombre',255)
          table.string('email',255)
          table.string('descripcion',1024)
          table.datetime('fecha_nacimiento')
          table.datetime('fecha_creado')
          table.datetime('fecha_modificado')
          table.string('pass',512)
          table.string('verif_code',36)
          table.datetime('fecha_verif_code')
        })
    }

    if (! await hasTable("permisos")) {
      console.log("Creo tabla permisos")
      await global.knex.schema.createTable('permisos', function (table) {
        table.primary(["id"])
        table.string('id', 36)
        table.string('nombre',255)
        table.string('descripcion',1024)
        table.datetime('fecha_creado')
        table.datetime('fecha_modificado')
      })
    }

    if (! await hasTable("roles")) {
      console.log("Creo tabla roles")
      await global.knex.schema.createTable('roles', function (table) {
        table.primary(["id"])
        table.string('id', 36)
        table.string('nombre',255)
        table.string('descripcion',1024)
        table.datetime('fecha_creado')
        table.datetime('fecha_modificado')
      })
    }

    if (! await hasTable("permisos_roles")) {
      console.log("Creo tabla permisos_roles")
      await global.knex.schema.createTable('permisos_roles', function (table) {
        table.primary(["id"])
        table.string('id', 36)
        table.string('id_permiso',36)
        table.string('id_rol',36)
        table.datetime('fecha_creado')
        table.datetime('fecha_modificado')
      })
    }

    if (! await hasTable("imagenes_usuarios")) {
        console.log("Creo tabla imagenes_usuarios")
        await global.knex.schema.createTable('imagenes_usuarios', function (table) {
          table.primary(["id"])
          table.string('id', 36)
          table.string('url',255)
          table.string('id_usuario',36)
        })
    }

  await addRecordIfNotExist("roles", { id: 'DUENIO_MASCOTA', nombre: 'DUENIO_MASCOTA', descripcion: 'Asignado a dueño mascota', fecha_creado: new Date(), fecha_modificado: new Date() },
    { busqueda_ignorar_campo: ['fecha_creado', 'fecha_modificado'] })
  
  await addRecordIfNotExist("permisos", { id: 'PERDIDA_ALL', nombre: 'PERDIDA_GET_ALL', 
    descripcion: 'Obtener listado Mascotas Perdidas', fecha_creado: new Date(), fecha_modificado: new Date() },
    { busqueda_ignorar_campo: ['fecha_creado', 'fecha_modificado'] })
  await addRecordIfNotExist("permisos_roles", { id: uuid.v4(), id_permiso: 'PERDIDA_ALL', id_rol: 'DUENIO_MASCOTA', fecha_creado: new Date(), fecha_modificado: new Date() },
    { busqueda_ignorar_campo: ['fecha_creado', 'fecha_modificado', 'id'] })

  await addRecordIfNotExist("permisos", { id: 'MASCOTAS_C_USER_ALL', nombre: 'MASCOTAS_C_USER_ALL', 
    descripcion: 'Obtener listado de Mascotas - Usuario Actual', fecha_creado: new Date(), fecha_modificado: new Date() },
    { busqueda_ignorar_campo: ['fecha_creado', 'fecha_modificado'] })
  await addRecordIfNotExist("permisos_roles", { id: uuid.v4(), id_permiso: 'MASCOTAS_C_USER_ALL', id_rol: 'DUENIO_MASCOTA', fecha_creado: new Date(), fecha_modificado: new Date() },
    { busqueda_ignorar_campo: ['fecha_creado', 'fecha_modificado', 'id'] })

  await addRecordIfNotExist("permisos", { id: 'MASCOTAS_C_USER_ONE', nombre: 'MASCOTAS_C_USER_ONE', 
    descripcion: 'Obtener Info de una Mascota - Usuario Actual', fecha_creado: new Date(), fecha_modificado: new Date() },
    { busqueda_ignorar_campo: ['fecha_creado', 'fecha_modificado'] })
  await addRecordIfNotExist("permisos_roles", { id: uuid.v4(), id_permiso: 'MASCOTAS_C_USER_ONE', id_rol: 'DUENIO_MASCOTA', fecha_creado: new Date(), fecha_modificado: new Date() },
    { busqueda_ignorar_campo: ['fecha_creado', 'fecha_modificado', 'id'] })

  await addRecordIfNotExist("permisos", { id: 'MASCOTAS_C_USER_ADD', nombre: 'MASCOTAS_C_USER_ADD', 
    descripcion: 'Agregar Mascota - Usuario Actual', fecha_creado: new Date(), fecha_modificado: new Date() },
    { busqueda_ignorar_campo: ['fecha_creado', 'fecha_modificado'] })
  await addRecordIfNotExist("permisos_roles", { id: uuid.v4(), id_permiso: 'MASCOTAS_C_USER_ADD', id_rol: 'DUENIO_MASCOTA', fecha_creado: new Date(), fecha_modificado: new Date() },
  { busqueda_ignorar_campo: ['fecha_creado', 'fecha_modificado', 'id'] })

  await addRecordIfNotExist("permisos", { id: 'MASCOTAS_C_USER_DEL', nombre: 'MASCOTAS_C_USER_DEL', 
    descripcion: 'Quitar Mascota - Usuario Actual', fecha_creado: new Date(), fecha_modificado: new Date() },
    { busqueda_ignorar_campo: ['fecha_creado', 'fecha_modificado'] })
  await addRecordIfNotExist("permisos_roles", { id: uuid.v4(), id_permiso: 'MASCOTAS_C_USER_DEL', id_rol: 'DUENIO_MASCOTA', fecha_creado: new Date(), fecha_modificado: new Date() },
    { busqueda_ignorar_campo: ['fecha_creado', 'fecha_modificado', 'id'] })

  await addRecordIfNotExist("permisos", { id: 'MASCO_C_USER_CIMG', nombre: 'MASCO_C_USER_CIMG', 
    descripcion: 'Cambiar imagen de perfil de Mascota - Usuario Actual', fecha_creado: new Date(), fecha_modificado: new Date() },
    { busqueda_ignorar_campo: ['fecha_creado', 'fecha_modificado'] })
  await addRecordIfNotExist("permisos_roles", { id: uuid.v4(), id_permiso: 'MASCO_C_USER_CIMG', id_rol: 'DUENIO_MASCOTA', fecha_creado: new Date(), fecha_modificado: new Date() }
  ,{ busqueda_ignorar_campo: ['fecha_creado', 'fecha_modificado', 'id'] })

  await addRecordIfNotExist("permisos", { id: 'MASCOTAS_C_USER_EDIT', nombre: 'MASCOTAS_C_USER_EDIT', 
    descripcion: 'Editar Mascota - Usuario Actual', fecha_creado: new Date(), fecha_modificado: new Date() },
    { busqueda_ignorar_campo: ['fecha_creado', 'fecha_modificado'] })
  await addRecordIfNotExist("permisos_roles", 
    { id: uuid.v4(), id_permiso: 'MASCOTAS_C_USER_EDIT', id_rol: 'DUENIO_MASCOTA', fecha_creado: new Date(), fecha_modificado: new Date() }
    ,{ busqueda_ignorar_campo: ['fecha_creado', 'fecha_modificado', 'id'] })

  if (! await hasTable("usuarios_roles")) {
    console.log("Creo tabla usuarios_roles")
    await global.knex.schema.createTable('usuarios_roles', function (table) {
      table.primary(["id"])
      table.string('id', 36)
      table.string('id_usuario',36)
      table.string('id_rol',36)
      table.datetime('fecha_creado')
      table.datetime('fecha_modificado')
    })
  }

  if (! await hasTable("resportes_avistamiento")) {
    console.log("Creo tabla resportes_avistamiento")
    await global.knex.schema.createTable('resportes_avistamiento', function (table) {
      table.primary(["id"])
      table.string('id', 36)
      table.string('id_usuario',36)
      table.string('id_mascota',36)
      table.string('id_reporte',36)
      table.string('descripcion',1024)
      table.string('ubicacion',255)
      table.datetime('fecha_creado')
    })
  }

  if (! await hasTable("resportes_avistamiento_imagenes")) {
    console.log("Creo tabla resportes_avistamiento_imagenes")
    await global.knex.schema.createTable('resportes_avistamiento_imagenes', function (table) {
      table.primary(["id"])
      table.string('id', 36)
      table.string('id_reporte',36)
      table.string('id_avistamiento',36)
      table.string('path',512)
      table.string('mime_type',255)
      table.datetime('fecha_creado')
    })
  }

  await addRecordIfNotExist("permisos", { id: 'MASCO_REP_AVISTAMIENTO', nombre: 'MASCO_REP_AVISTAMIENTO', 
    descripcion: 'Reportar avistamiento - Usuario Actual', fecha_creado: new Date(), fecha_modificado: new Date() },
    { busqueda_ignorar_campo: ['fecha_creado', 'fecha_modificado'] })
  await addRecordIfNotExist("permisos_roles", { id: uuid.v4(), id_permiso: 'MASCO_REP_AVISTAMIENTO', id_rol: 'DUENIO_MASCOTA', fecha_creado: new Date(), fecha_modificado: new Date() }
  ,{ busqueda_ignorar_campo: ['fecha_creado', 'fecha_modificado', 'id'] })
}

async function hasColumn(table_name, column) {
    return new Promise(async (resolve, reject) => {
        global.global.knex.schema.hasColumn(table_name, column).then(exists => {
        resolve(exists)
        })

    })
}


async function hasTable(table_name) {
    return new Promise(async (resolve, reject) => {
        global.global.knex.schema.hasTable(table_name).then(exists => {
        resolve(exists)
        })

    })
}

async function addRecordIfNotExist(table_name, record, options = {}) {
  let record_f = { ...record }
  if (options.busqueda_ignorar_campo) {
    for (let c = 0; c < options.busqueda_ignorar_campo.length; c++) {
      delete record_f[options.busqueda_ignorar_campo[c]]
    }
  }

  if (! await hasRecords(table_name, record_f)) {
    await knex(table_name).insert(record)
    console.log('Agregando registro - tabla ' + table_name, record)
  }
}

async function hasRecords(table_name, where_cond) {
  return new Promise(async (resolve, reject) => {
    let regs = await knex(table_name).select().where(where_cond)
    resolve(regs.length > 0)
  })
}