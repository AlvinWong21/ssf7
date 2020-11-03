//load express
const express = require("express");

//SQL statements
SQL_TV_SHOW_COUNT = 'select count(*) as show_count from tv_shows';
const SQL_TV_SHOW_LIST = 'select * from tv_shows limit ? offset ?';
const SQL_TV_SHOW_ID = 'select * from tv_shows where tvid = ?';

//applications

module.exports = function(p) {
    const router = express.Router()
    const pool = p

    router.get('/', async (req, resp) => {

        const conn = await pool.getConnection()
        const offset = parseInt(req.query['offset']) || 0
        const limit = 20
        const listCount = await conn.query(SQL_TV_SHOW_COUNT)
        const pageTotal = listCount[0][0].show_count / limit
        try {
            const tvList = await conn.query(SQL_TV_SHOW_LIST, [limit, offset])
            console.info(tvList[0])
            console.info(listCount[0][0].show_count)
            console.info(pageTotal)
            resp.render('index', {
                tvList: tvList[0], 
                pageTotal, 
                pageNum: Math.max(1, (offset/limit) + 1),
                // hasMore: tvList.length > limit,
                prevOffset: Math.max(0, offset - limit),
                nextOffset: offset + limit,
                hasMore: (listCount - offset) > limit
            })
        } catch(e) {
            resp.status(500)
            resp.type('text/html')
            resp.send(JSON.stringify(e))
        } finally {
            conn.release()
        }

    })
    
    router.get('/show/:tvid', async (req, resp) => {
        
        const tv_Id = req.params['tvid']
        const conn = await pool.getConnection()
    
        try {
            const results = await conn.query(SQL_TV_SHOW_ID, [tv_Id])
            const tvshow = results[0]
            console.log(tvshow) //prints an array of 1 element
            console.info(tvshow[0]) //prints the only element in the array
            resp.status(200)
            resp.type('text/html')
            resp.render('show', {tvshow: tvshow[0]}) //tvshow[0] passes the only element
        } catch(e) {
            resp.status(500)
            resp.type('text/html')
            resp.send(JSON.stringify(e))
        } finally {
            conn.release()
        }
    })

return router
}