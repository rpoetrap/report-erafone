const db = require('../db')
const dateFormat = require('dateformat')

function getAllOpenReports(page, callback){
    let sql = "SELECT * FROM reports WHERE status = 1 ORDER BY tanggal ASC LIMIT 10 OFFSET ?"
    db.query(sql, [(page-1)*10], (err, data, fields) => {
        if (err) return callback(err)
        if (data.length == 0) return callback(null, false, {message: "Tidak ada data"})
        return callback(null, data)
    })
    
}

function getAllCloseReports(page, callback){
    let sql = "SELECT * FROM reports WHERE status = 0 ORDER BY tanggal DESC LIMIT 10 OFFSET ?"
    db.query(sql, [(page-1)*10], (err, data, fields) => {
        if (err) return callback(err)
        if (data.length == 0) return callback(null, false, {message: "Tidak ada data"})
        return callback(null, data)
    })
    
}

function getReportById(reportId, callback){
    let sql = "SELECT reports.*, report_categories.categoryName, report_units.unitName FROM reports JOIN report_categories ON reports.kategori = report_categories.categoryId JOIN report_units ON reports.unit = report_units.unitId WHERE reportId = ?"
    db.query(sql, reportId, (err, data, fields) => {
        if (err) return callback(err)
        if (data.length == 0) return callback(null, false, {message: "Tidak ada data"})
        return callback(null, data)
    })
    
}

function updateStatusById(reportId, status, callback){
    let sql = "UPDATE reports SET status = ? WHERE reportId = ?"
    db.query(sql, [status, reportId], (err, data, fields) => {
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

function countAllCloseReports(callback){
    let sql = "SELECT COUNT(*) jumlah FROM reports WHERE status = 0"
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

exports.getOpen = (req, res, next) => {
    var reports = new Array
    var reportsCount = 0
    if(req.isAuthenticated()){
        let page = (req.query.page > 0) ? req.query.page : 1 || 1
        if(req.user['role'] != 0){
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
                    
                    res.render('reports', {page: 'Keluhan Terbuka', user: req.user, reports: reports, message: req.flash('message'), pagination: {current: page, total: reportsCount, pages: pages}})
                })
            })
        } else {
            res.redirect('/')
        }
    } else {
        res.redirect('/')
    }
}

exports.getClose = (req, res, next) => {
    var reports = new Array
    var reportsCount = 0
    if(req.isAuthenticated()){
        let page = (req.query.page > 0) ? req.query.page : 1 || 1
        if(req.user['role'] != 0){
            getAllCloseReports(page, (err, data, fields) => {
                if(data.length > 0){
                    reports = data
                } else {
                    if(page > 1) return res.redirect('/')
                }

                reports.forEach((item) => {
                    item['tanggal'] = dateFormat(item['tanggal'], 'dd-mm-yyyy')
                })

                countAllCloseReports((err, data, fields) => {
                    if (data.length > 0){
                        reportsCount = data[0].jumlah
                    }
                    let pages = pagination(Math.ceil(reportsCount/10), page)
                    
                    res.render('reports', {page: 'Keluhan Selesai', user: req.user, reports: reports, message: req.flash('message'), pagination: {current: page, total: reportsCount, pages: pages}})
                })
            })
        } else {
            res.redirect('/')
        }
    } else {
        res.redirect('/')
    }
}

exports.getById = (req, res, next) => {
    let reportId = req.params.id
    if(req.isAuthenticated()){
        getReportById(reportId, (err, data, fields) => {
            if(data.length > 0 && (req.user['role'] != 0 || req.user['userId'] == data[0].userId)){
                let reports = data
                reports.forEach((item) => {
                    item['tanggal'] = dateFormat(item['tanggal'], 'dd-mm-yyyy')
                })
                res.render('report', {page: 'Keluhan', user: req.user, reports: reports[0], message: req.flash('message')})
            } else {
                res.redirect('/')
            }
        })
    } else {
        res.redirect('/')
    }
}

exports.updateStatusById = (req, res, next) => {
    let reportId = req.params.id
    let formData = req.body
    let status = (formData.status == 1) ? 0 : 1
    if(req.isAuthenticated()){
        if(req.user['role'] == 1){
            updateStatusById(reportId, status, (err, data, fields) => {
                if(err) req.flash('message', err.message)
                res.redirect('/report/'+reportId)
            })
        } else {
            res.redirect('/')
        }
    } else {
        res.redirect('/')
    }
}