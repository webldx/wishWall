const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');
const mime = require('mime');
const mysql = require('mysql');
const handlebars = require('handlebars');
const querystring = require('querystring');
const moment = require('moment');


const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'vish'
});

// 创建web服务器
const server = http.createServer();

// 设置魔板路径
const viewspath = path.join(__dirname, 'views');

server.on('request', (req, res) => {

    // 获取客户端的请求路径
    let { pathname } = url.parse(req.url);

    // 设计路由
    if (pathname == '/index' && req.method.toLowerCase() == 'get') {
        fs.readFile(path.join(viewspath, 'index.html'), 'utf8', (err, result) => {
            // console.log(result);

            let sql = 'select * from wish';
            connection.query(sql, (err, rows) => {
                let template = handlebars.compile(result);
                // console.log(template);
                let str = template({ rows: rows });
                // console.log(str)
                res.end(str);
            })
        });
    } else if (pathname == '/add' && req.method.toLowerCase() == 'post') {
        let formData = '';

        req.on('data', data => {
            formData += data;
        });
        console.log(formData);

        req.on('end', () => {
            formData = querystring.parse(formData);
            console.log(formData)

            formData.data = new Date();

            let sql = 'insert into wish set ?';

            connection.query(sql, formData, (err) => {
                res.writeHead(200, {
                    'content-type': 'application/json'
                });

                if (err == null) {
                    res.end(JSON.stringify({ success: true, message: '愿望添加成功' }));
                } else {
                    // 愿望添加失败
                    res.end(JSON.stringify({ success: false, message: '愿望添加失败' }));
                }
            })
        })
    } else {
        // 读取文件的真实路径
        let realPaht = path.join(__dirname, 'public', pathname);

        fs.readFile(realPaht, (err, result) => {
            if (err == null) {
                res.writeHead(200, {
                    'Content-Type': mime.getType(realPaht)
                });
                res.end(result);
            } else {
                res.writeHead(404);
                res.end();
            }
        })
    }

})



server.listen(3000, (err) => {
    if (!err) {
        console.log('服务器启动成功');
    } else [
        console.log(err)
    ]
});

handlebars.registerHelper('formatTime', data => {

    // 处理时间
    return moment(data).format('YYYY年MM月DD日');
});