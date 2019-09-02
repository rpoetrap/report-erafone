const db = require('../db')
const dateFormat = require('dateformat')

const bulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]

function getAllKategori(callback){
    let sql = "SELECT * FROM report_categories"
    db.query(sql, (err, data, fields) => {
        if (err) return callback(err)
        if (data.length == 0) return callback(null, false, {message: "Tidak ada data"})
        return callback(null, data)
    })
}

function getAllUnit(callback){
    let sql = "SELECT * FROM report_units"
    db.query(sql, (err, data, fields) => {
        if (err) return callback(err)
        if (data.length == 0) return callback(null, false, {message: "Tidak ada data"})
        return callback(null, data)
    })
}

function getAllOpenReports(page, callback){
    let sql = "SELECT * FROM reports WHERE status = 1 ORDER BY status DESC, tanggal DESC LIMIT 10 OFFSET ?"
    db.query(sql, [(page-1)*10], (err, data, fields) => {
        if (err) return callback(err)
        if (data.length == 0) return callback(null, false, {message: "Tidak ada data"})
        return callback(null, data)
    })
    
}

function getAllReportsByUserId(userId, page, callback){
    let sql = "SELECT * FROM reports WHERE userId = ? ORDER BY status DESC, tanggal DESC LIMIT 10 OFFSET ?"
    db.query(sql, [userId, (page-1)*10], (err, data, fields) => {
        if (err) return callback(err)
        if (data.length == 0) return callback(null, false, {message: "Tidak ada data"})
        return callback(null, data)
    })
    
}

function countAllOpenReports(callback){
    let sql = "SELECT COUNT(*) jumlah FROM reports WHERE status = 1"
    db.query(sql, (err, data, fields) => {
        if (err) return callback(err)
        if (data.length == 0) return callback(null, false, {message: "Tidak ada data"})
        return callback(null, data)
    })
}

function countAllReportsByUserId(userId, callback){
    let sql = "SELECT COUNT(*) jumlah FROM reports WHERE userId = ?"
    db.query(sql, userId, (err, data, fields) => {
        if (err) return callback(err)
        if (data.length == 0) return callback(null, false, {message: "Tidak ada data"})
        return callback(null, data)
    })   
}

function getAllReportsDetail(callback){
    let sql = "SELECT reports.*, report_categories.categoryName, report_units.unitName, users.nama, users.gender, auth.email FROM reports JOIN report_categories ON reports.kategori = report_categories.categoryId JOIN report_units ON reports.unit = report_units.unitId JOIN users ON reports.userId = users.userId JOIN auth ON auth.userId = reports.userId"
    db.query(sql, (err, data, fields) => {
        if (err) return callback(err)
        if (data.length == 0) return callback(null, false, {message: "Tidak ada data"})
        return callback(null, data)
    })
}

function pagination(total, current){
	var output = new Array;
	if(total < 6){
		for(var i = 1; i <= total; i++){
			output.push(i);
		}
	} else {
		if(current <= 3){
			for(var i = 1; i <= 4; i++){
				output.push(i);
			}
			output.push(total);
		} else if (current >= (total - 2)){
			output.push(1);
			for(var i = (total - 3); i <= total; i++){
				output.push(i);
			}
		} else {
			output.push(1);
			for(var i = (current - 1); i <= (current + 1); i++){
				output.push(i);
			}
			output.push(total);
		}
	}
	return output;
}

module.exports = (req, res, next) => {
    var kategori = new Array
    var unit = new Array
    var reports = new Array
    var reportsCount = 0
    if(req.isAuthenticated()){
        let page = (req.query.page > 0) ? req.query.page : 1 || 1
        let userId = req.user.userId
        
        getAllKategori((err, data, fields) => {
            if(data.length > 0){
                kategori = data
            }
            getAllUnit((err, data, fields) => {
                if(data.length > 0){
                    unit = data
                }

                if(req.user['role'] == 2){
                    getAllReportsDetail((err, data, fields) => {
                        if(data.length > 0){
                            reports = data
                        }
                        reports.forEach((item) => {
                            let bulanId = new Date(item["tanggal"]).getMonth()
                            item['tanggal'] = dateFormat(item['tanggal'], 'dd-mm-yyyy')
                            item['bulan'] = bulan[bulanId]
                            
                        })
                        res.render('index', {page: 'Home', user: req.user, reports: reports, kategori: kategori, unit: unit, message: req.flash('message')})
                    })
                } else if(req.user['role'] == 1){
                    getAllOpenReports(page, (err, data, fields) => {
                        if(data.length > 0){
                            reports = data
                        } else {
                            if(page > 1) return res.redirect('/')
                        }
    
                        reports.forEach((item) => {
                            item['tanggal'] = dateFormat(item['tanggal'], 'dd-mm-yyyy')
                        })

                        countAllOpenReports((err, data, fields) => {
                            if (data.length > 0){
                                reportsCount = data[0].jumlah
                            }
                            let pages = pagination(Math.ceil(reportsCount/10), page)
                            
                            res.render('index', {page: 'Home', user: req.user, reports: reports, kategori: kategori, unit: unit, message: req.flash('message'), pagination: {current: page, total: reportsCount, pages: pages}})
                        })
                    })
                } else {
                    getAllReportsByUserId(userId, page, (err, data, fields) => {
                        if(data.length > 0){
                            reports = data
                        } else {
                            if(page > 1) return res.redirect('/')
                        }
    
                        reports.forEach((item) => {
                            item['tanggal'] = dateFormat(item['tanggal'], 'dd-mm-yyyy')
                        })

                        countAllReportsByUserId(userId, (err, data, fields) => {
                            if (data.length > 0){
                                reportsCount = data[0].jumlah
                            }
                            let pages = pagination(Math.ceil(reportsCount/10), page)
                            
                            res.render('index', {page: 'Home', user: req.user, reports: reports, kategori: kategori, unit: unit, message: req.flash('message'), pagination: {current: page, total: reportsCount, pages: pages}})
                        })
                    })
                }
            })
        })
    } else {
        res.redirect('/login')
    }
}