const express = require('express')
const router = express.Router()
module.exports = router

const bcrypt = require('bcrypt')
const uuid = require("uuid")

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

router.post('/registro', async function (req, res) {
    console.log('[USUARIO][registro] ', req.body)
    
    if (!req.body?.nombre) { console.log('falta nombre')
        return res.status(200).send({ stat: false, data: [], text: 'Error Interno' })
    }

    if (!req.body?.email) { console.log('falta email')
        return res.status(200).send({ stat: false, data: [], text: 'Error Interno' })
    }

    if (!req.body?.descripcion) { console.log('falta descripcion')
        return res.status(200).send({ stat: false, data: [], text: 'Error Interno' })
    }

    if (!req.body?.fecha_nacimiento) { console.log('falta fecha_nacimiento')
        return res.status(200).send({ stat: false, data: [], text: 'Error Interno' })
    }

    if (!req.body?.pass) { console.log('falta pass')
        return res.status(200).send({ stat: false, data: [], text: 'Error Interno' })
    }

    if (!req.body?.repetir_pass) { console.log('falta repetir_pass')
        return res.status(200).send({ stat: false, data: [], text: 'Error Interno' })
    }

    if (req.body.repetir_pass != req.body.pass) { console.log('fLas Contraseña no Coinciden')
        return res.status(200).send({ stat: false, data: [], text: '¡Las Contraseña no Coinciden!' })
    }

    try {
        let usuario_existe = await global.knex("usuario").select().where({ email: req.body.email }).orWhere({ nombre: req.body.nombre }).first()
        if (usuario_existe) {
            return res.status(200).send({ stat: false, data: [], text: '¡Ya existe un usuario con dicho nombre / email!' })
        } else {
            let _insert = {
                id: uuid.v4(),
                nombre: req.body.nombre,
                email: req.body.email,
                descripcion: req.body.descripcion,
                fecha_nacimiento: req.body.fecha_nacimiento,
                fecha_creado: new Date(),
                fecha_modificado: new Date(),
                pass: await bcrypt.hash(req.body.pass, 10),
                verif_code: uuid.v4(),
                fecha_verif_code: new Date(),
            }
            await global.knex("usuario").insert(_insert)
            console.log('Se crea nuevo usuario ', _insert)
            return res.status(200).send({ stat: true, data: [] })
        }
    } catch (error) {
        console.log(error)
        return res.status(200).send({ stat: false, data: [], text: 'Error Interno' })
    }
})

router.post('/verifica_email', async function (req, res) {
    console.log('[USUARIO][verifica_email] ', req.body)
    
    try {
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