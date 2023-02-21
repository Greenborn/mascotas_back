const uuid = require("uuid")

exports.do_migrations = async function () {
    if (! await hasTable("form")) {
        console.log("Creo tabla form")
        await global.knex.schema.createTable('form', function (table) {
          table.primary(["id"])
          table.string('id', 36)
          table.json('definition')
        })
    }

    if (! await hasTable("form_response")) {
        console.log("Creo tabla form_response")
        await global.knex.schema.createTable('form_response', function (table) {
          table.primary(["id", "id_form"])
          table.string('id', 36)
          table.string('id_form', 36)
          table.string('cuil', 12)
          table.json('response')
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
