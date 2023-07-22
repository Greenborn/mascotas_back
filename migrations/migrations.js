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

    if (! await hasTable("imagenes_usuarios")) {
        console.log("Creo tabla imagenes_usuarios")
        await global.knex.schema.createTable('imagenes_usuarios', function (table) {
          table.primary(["id"])
          table.string('id', 36)
          table.string('url',255)
          table.string('id_usuario',36)
        })
    }
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
