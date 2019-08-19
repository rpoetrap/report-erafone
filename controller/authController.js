const db = require('../db')
const bcrypt = require('bcrypt')

exports.register = (req, res, next) => {
    let formData = req.body
    let output = {
        status: false,
        message: null
    }
    if(formData["gender"] && formData["nama"] && formData["email"] && formData["username"] && formData["password"] && formData["telp"]){
        bcrypt.hash(formData["password"], 5, (err, hash) => {
            if(!err){
                let sql = "SELECT authId FROM auth WHERE email = ?"
                db.query(sql, [formData["email"]], (err, data, fields) => {
                    if(!err){
                        if(data.length > 0){
                            output.message = "Email sudah digunakan"
                            res.render('register', {page:'Register', result: output})
                        } else {
                            let sql = "SELECT authId FROM auth WHERE username = ?"
                            db.query(sql, [formData["username"]], (err, data, fields) => {
                                if(!err){
                                    if(data.length > 0){
                                        output.message = "Username sudah digunakan"
                                        res.render('register', {page:'Register', result: output})
                                    } else {
                                        let sql = "INSERT INTO users SET ? "
                                        let post = { nama: formData["nama"], gender: formData["gender"], telp: formData["telp"] }
                                        db.query(sql, post, (err, data, fields) => {
                                            if(!err){
                                                let userId = data.insertId
                                                let sql = "INSERT INTO auth SET ? "
                                                let post = {email: formData["email"], password: hash, userId: userId}
                                                db.query(sql, post, (err, data, fields) => {
                                                    if(!err) {
                                                        output.status = true
                                                        output.message = "Akun berhasil didaftarkan"
                                                    } else {
                                                        output.message = err.message
                                                    }
                                                    res.render('register', {page:'Register', result: output})
                                                })
                                            } else {
                                                output.message = err.message
                                                res.render('register', {page:'Register', result: output})
                                            }
                                        })
                                    }
                                }
                            })
                        }
                    } else {
                        output.message = err.message
                        res.render('register', {page:'Register', result: output})
                    }
                })
            } else {
                output.message = err.message
                res.render('register', {page:'Register', result: output})
            }
        })
    } else {
        output.message = "Isi data dengan lengkap"
        res.render('register', {page:'Register', result: output})
    }
}