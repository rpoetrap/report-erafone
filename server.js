require('dotenv').config()
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt')
const flash = require('connect-flash');
const session = require('express-session')

const db = require('./db')

const Router = require('./routes/index')
const Controller = require('./controller')

passport.use(new Strategy(
    {
        passReqToCallback: true
    },
    function(req, username, password, done) {
        let formData = req.body
        let sql = "SELECT password, auth.userId FROM auth JOIN users ON users.userId = auth.userId WHERE auth.username = ? AND users.role = ? LIMIT 1"
        db.query(sql, [username, formData['role']], (err, user, fields) => {
            if(err) return done(err)
            if(user.length == 0) return done(null, false, req.flash('message', "User belum terdaftar"))
            
            bcrypt.compare(password, user[0]["password"], (err, isMatch) => {
                if(err) return done(err)
                if(isMatch) return done(null, user[0])
                else return done(null, false, req.flash('message', "Password tidak sesuai"))
            })
        })
    }
));

passport.serializeUser(function(user, done) {    
    done(null, user.userId)
});

passport.deserializeUser(function(id, done) {
    let sql = "SELECT users.*, auth.email FROM users JOIN auth ON auth.userId = users.userId WHERE users.userId = ? LIMIT 1"
    db.query(sql, [id], (err, data, fields) => {
        if(err) return done(err)
        if(data.length == 0) return done(null, false, {message: "User tidak ditemukan"})
        done(null, data[0])
    })
    
  });

const app = express()
const port = process.env.PORT || 3000

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(session({
    secret: 'blabla',
    saveUninitialized: false,
    resave: false
}))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())

app.use('/static', express.static(path.join(__dirname, 'public')))
// app.use('/api', Router.api)
app.get('/', Controller.home)
app.get('/register', (req, res) => {
    if(req.isAuthenticated()){
        res.redirect('/')
    } else {
        res.render('register', {page:'Register'})
    }
    
})
app.post('/register', Controller.auth.register)
app.get('/login', (req, res) => {
    if(req.isAuthenticated()){
        res.redirect('/')
    } else {
        res.render('login', {page:'Login', message: req.flash('message')})
    }
    
})
app.post('/login', 
    passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),(req, res) => {
        res.redirect('/');
    }
);
app.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/')
})
app.use('/report', Router.report)
app.get('/kategori', Controller.kategori.getKategori)
app.post('/kategori', Controller.kategori.newKategori)
app.get('/kategori/:id/delete', Controller.kategori.deleteKategori)
app.get('/unit', Controller.unit.getUnit)
app.post('/unit', Controller.unit.newUnit)
app.get('/unit/:id/delete', Controller.unit.deleteUnit)

app.listen(port, () => console.log(`Listening on port ${port}!`))