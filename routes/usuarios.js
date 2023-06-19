const express = require('express')
const router = express.Router()
module.exports = router

const bcrypt = require('bcrypt')

router.post('/login', async function (req, res) {
    console.log('[USUARIO][login] ',req.body)
    
    if ( req.body?.u == undefined || req.body?.u == ''){
        return res.status(200).send({ stat: false, data: [] })
    }

    if ( req.body?.p == undefined || req.body?.p == ''){
        return res.status(200).send({ stat: false, data: [] })
    }

    try {
        let usuario = await global.knex("usuario").select().where({ email: req.body.u }).first()
        if (usuario){
            let isValid = await bcrypt.compare(req.body.p, usuario.pass)
            if (isValid){
                delete usuario.pass

                req.session.isLogged = true
                req.session.u_data = { ...usuario }
                req.session.save()

                return res.status(200).send({ stat: true, data: usuario })
            } else {
                return res.status(200).send({ stat: false, data: [], text: 'Usuario o contraseñas inválida.' })
            }
            
        } else {
            return res.status(200).send({ stat: false, data: [], text: 'Usuario o contraseñas inválida.' })
        }
    } catch (error) {
        console.log(error)
        return res.status(200).send({ stat: false, data: [], text: 'Usuario o contraseñas inválida.' })
    }
})

router.put('/logout', async function (req, res) {
    console.log('[USUARIO][logout] ')
    
    try {
        req.session.isLogged = false
        req.session.u_data = null
        req.session.save()
        return res.status(200).send({ stat: true, data: [] })
    } catch (error) {
        console.log(error)
        return res.status(200).send({ stat: false, data: [], text: 'Error Interno' })
    }
})

router.get('/stat', async function (req, res) {
    console.log('[USUARIO][stat] ')
    return res.status(200).send({ stat: true, data: req.session })
})