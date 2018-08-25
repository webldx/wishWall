// 第一步 引入http模块
const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');
const mime = require('mime');
const mysql = require('mysql');
const handlebars = require('handlebars');
const querystring = require('querystring');
const moment = require('moment');


// 创建数据库连接
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    databasse: 'vish'
})


// 创建 web服务器
const server = http.createServer();

// 设置魔板路径
const viewsPath = path.join(__dirname, 'views');

// 当客户端发送请求的时候执行的回调函数
server.on('request', (req, res) => {
    // 获取地址栏中的路径
    let { pathname } = url.parse(req.url);
    console.log(pathname);

    // 创建路由
    if (pathname == '/index' && req.method.() == 'get') {

        // 展示首页
        fs.readFile(path.join(viewsPath, 'index.html'), 'utf8', (err, result) => {

            console.log(result)
                // 从list表中将所有的数据查询出来
            let sql = 'select * from vish';

            // 执行sql语句
            connection.query(sql, (err, rows) => {
                // 此时 查询出来的数据是数组
                console.log(rows);
                // 获取模板拼接函数
                let template = handlebars.compile(result);
                // 调用模板拼接函数 将数据和模板进行拼接
                let str = template({ rows });
                // 将处理结果响应给客户端
                res.end(str);
            });

        });

    } else {
        // 读取文件的真实路径(绝对路径)
        let realPath = path.join(__dirname, 'public', pathname);
        console.log(realPath);

        // 根据文件的真实路径来读取文件 如果读取失败 result 就是undefined 就会报错
        fs.readFile(realPath, (err, result) => {


            if (err == null) {

                // 成功读取问成功之后 设置响应头
                res.writeHead(200, {
                    'Content-Type': mime.getType(realPath)
                });
                res.end(result);
            } else {

                res.writeHead(404);
                res.end();
            }
        })
    }
})



server.listen(1000, (err) => {
    if (!err) {
        console.log('启动服务器成功,监听1000端口');
    } else {
        console.log(err);
    }
});


handlebars.registerHelper('formatTime', data => {

    // 处理时间
    return moment(data).format('YYYY年MM月DD日');
});