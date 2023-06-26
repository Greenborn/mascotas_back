const express = require('express')
const router = express.Router()
module.exports = router

router.get('/preguntas_frecuentes', async function (req, res) {
    console.log('[GENERAL][preguntas_frecuentes] ',req.body)

    res.status(200).send({ stat: true, data: 
        await global.knex("preguntas_frecuentes")
                .select()
    })
  
})