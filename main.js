// list out tv shows in descending order (sort), limit 20
// detailed view upon clicking on the titles.

//in detailed view:
//tv name, rating, image, summary
//link: go to official site [of TV show] (official_site)
//link: back to tv list

//no sensitive information hard coded; all passed through command line or env var.

//load libraries: exp, hbs, mysql2/promise
const express = require('express')
const handlebars = require('express-handlebars')
const mysql = require('mysql2/promise')

//configure port
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000

//create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',   //db4free.net
    port: parseInt(process.eventNames.DB_PORT) || 3306,
    database: process.env.DB_NAME || 'leisure', //alvinwong21
    user: process.env.DB_USER,  //alvinwong
    password: process.env.DB_PASSWORD,  //AlvinWong
    connectionLimit: 4,
    timezone: '+08:00'
})

//load apps
const router = require('./apps')(pool)

//create an instance of express
const app = express()

//configure hbs
app.engine('hbs', handlebars({defaultLayout: 'default.hbs'}))
app.set('view engine', 'hbs')

//mount apps
app.use(router)

app.use(express.static(__dirname + '/static'))

//start application server
pool.getConnection()
    .then(conn => {
        console.info('Pinging database...')
        const p0 = Promise.resolve(conn)
        const p1 = conn.ping()
        return Promise.all([p0, p1])
    })
    .then(results => {
        const conn = results[0]
        conn.release()
        app.listen(PORT, () => {
            console.info(`Application started at port ${PORT} on ${new Date()}`)
        })
    })
    .catch(e => {
        console.error('Cannot start server: ', e)
    })