const express = require('express')

const router = express.Router()

router.get('/', function(req, res) {
    res.send('API is working properly')
})

router.post('/register', function(req, res){
    
})
module.exports = router