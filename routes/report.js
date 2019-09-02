const express = require('express')
const db = require('../db')
const Controller = require('../controller')

const router = express.Router()

router.post('/', function(req, res) {
    let formData = req.body
    let output = {
        status: false,
        message: null
    }
    if(req.isAuthenticated()){
        let userId = req.user.userId
        if(formData["kategori"] && formData["unit"] && formData["keterangan"] && formData["gender"] && formData["nama"] && formData["email"] && formData["telp"]){
            let sql = "INSERT INTO reports SET ?"
            let post ={userId: userId, masalah: formData["keterangan"], kategori: formData["kategori"], unit: formData["unit"], tanggal: new Date(), contact_gender: formData["gender"], contact_name: formData["nama"], contact_email: formData["email"], contact_telp: formData["telp"]}
            db.query(sql, post, (err, data, fields) => {
                if (!err){
                    output.status = true
                } else {
                    output.message = err.message
                }
                req.flash('message', output.message)
                res.redirect('/')
            })
        } else {
            req.flash('message', 'Isi form dengan lengkap')
            res.redirect('/')
        }
        
    } else {
        res.redirect('/login')
    }
})

router.get('/open', Controller.report.getOpen)

router.get('/close', Controller.report.getClose)

router.get('/:id', Controller.report.getById)

router.post('/:id', Controller.report.updateStatusById)

module.exports = router