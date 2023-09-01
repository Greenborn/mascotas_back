const express = require('express')
const router = express.Router()
module.exports = router

const bcrypt = require('bcrypt')
const uuid = require("uuid")

router.get('/get_notificaciones', async function (req, res) {
    console.log('[USUARIO][get_notificaciones] ')
    const id_user = req.session.u_data.id
    try {
        let notificaciones = await global.knex("notificaciones")
                .select()
                .where({ 'id_usuario': id_user })
                .orderBy('fecha_creado', 'desc')
        return res.status(200).send({ stat: true, data: notificaciones })
    } catch (error) {
        console.log(error)
        return res.status(200).send({ stat: false, data: [], text: 'Error Interno' })
    }
    
})
