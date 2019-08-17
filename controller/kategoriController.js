const db = require('../db')

function getAllKategori(callback){
    let sql = "SELECT * FROM report_categories"
    db.query(sql, (err, data, fields) => {
        if (err) return callback(err)
        if (data.length == 0) return callback(null, false, {message: "Tidak ada data"})
        return callback(null, data)
    })
}

function newKategori(nama, callback){
    let sql = "INSERT INTO report_categories SET ?"
    let post = {categoryName: nama}
    db.query(sql, post, (err, results, fields) => {
        if (err) return callback(err)
        return callback(null, results)
    })
}

function deleteKategoriById(catId, callback){
    let sql = "DELETE FROM report_categories WHERE categoryId = ?"
    db.query(sql, catId, (err, results, fields) => {
        if (err) return callback(err)
        return callback(null, results)
    })
}

exports.getKategori = (req, res, next) => {
    var kategori = new Array

    if(req.isAuthenticated()){
        if(req.user['role'] == 2){
            getAllKategori((err, data, fields) => {
                if(data.length > 0){
                    kategori = data
                }

                res.render('kategori', {page: 'Kelola Kategori', user: req.user, kategori: kategori, message: req.flash('message')})
            })
        }
        
    } else {
        res.redirect('/login')
    }
}

exports.newKategori = (req, res, next) => {    
    let formData = req.body
    let nama = formData['nama']
    
    if(req.isAuthenticated()){
        if(req.user['role'] == 2){
            newKategori(nama, (err, data, fields) => {
                if(err){
                    req.flash('message', err.message)
                }

                res.redirect('/kategori')
            })
        } else {
            res.redirect('/')
        }
        
    } else {
        res.redirect('/login')
    }
}

exports.deleteKategori = (req, res, next) => {    
    let catId = req.params.id
    
    if(req.isAuthenticated()){
        if(req.user['role'] == 2){
            deleteKategoriById(catId, (err, data, fields) => {
                if(err){
                    req.flash('message', err.message)
                }

                res.redirect('/kategori')
            })
        } else {
            res.redirect('/')
        }
        
    } else {
        res.redirect('/login')
    }
}