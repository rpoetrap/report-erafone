const db = require('../db')

function getAllUnit(callback){
    let sql = "SELECT * FROM report_units"
    db.query(sql, (err, data, fields) => {        
        if (err) return callback(err)
        if (data.length == 0) return callback(null, false, {message: "Tidak ada data"})
        return callback(null, data)
    })
}

function newUnit(nama, callback){
    let sql = "INSERT INTO report_units SET ?"
    let post = {unitName: nama}
    db.query(sql, post, (err, results, fields) => {
        if (err) return callback(err)
        return callback(null, results)
    })
}

function deleteUnitById(unitId, callback){
    let sql = "DELETE FROM report_units WHERE unitId = ?"
    db.query(sql, unitId, (err, results, fields) => {
        if (err) return callback(err)
        return callback(null, results)
    })
}

exports.getUnit = (req, res, next) => {
    var unit = new Array

    if(req.isAuthenticated()){
        if(req.user['role'] == 2){
            getAllUnit((err, data, fields) => {
                if(data.length > 0){
                    unit = data
                }

                res.render('unit', {page: 'Kelola Unit', user: req.user, unit: unit, message: req.flash('message')})
            })
        }
        
    } else {
        res.redirect('/login')
    }
}

exports.newUnit = (req, res, next) => {    
    let formData = req.body
    let nama = formData['nama']
    
    if(req.isAuthenticated()){
        if(req.user['role'] == 2){
            newUnit(nama, (err, data, fields) => {
                if(err){
                    req.flash('message', err.message)
                }

                res.redirect('/unit')
            })
        } else {
            res.redirect('/')
        }
        
    } else {
        res.redirect('/login')
    }
}

exports.deleteUnit = (req, res, next) => {    
    let unitId = req.params.id
    
    if(req.isAuthenticated()){
        if(req.user['role'] == 2){
            deleteUnitById(unitId, (err, data, fields) => {
                if(err){
                    req.flash('message', err.message)
                }

                res.redirect('/unit')
            })
        } else {
            res.redirect('/')
        }
        
    } else {
        res.redirect('/login')
    }
}