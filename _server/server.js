/**
 * Windows Up-to-Date 服务端脚本
 * @author crrashh1542
 * @version 1.0
 */

const fs = require('fs')
const http = require('http')
const querystring = require('querystring')
const url = require('url')

const port = 14725
const server = http.createServer((req, res) => {
    let reqUrl = url.parse(req.url)
    let reqPath = reqUrl.pathname
    // 打印该路径，仅调试时使用，生产环境下会去除
    console.log('[Info] 收到请求路径为：' + req.url)
    // (1) /favivon.ico → 站点图标
    if (reqPath == '/favicon.ico'){
        fs.readFile('./favicon.ico', (isErr, data) => {
            res.statusCode = 200
            res.setHeader('Content-Type', 'image/x-icon')
            res.end(data)
        })
    }
    // (2) / → 欢迎
    else if (reqPath == '/'){
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json;charset=utf-8')
        res.end('{"code":200,"message":"Service is available!"}')
    }
    // (3) /latestVersions → 最新版本
    else if (reqPath == '/latestVersions'){
        fs.readFile('../latest-versions.json', (isErr, data) => {
            handleJson(res, data)
        })
    }
    // (4) /category → 版本列表
    else if (reqPath == '/category'){
        let reqQuery = querystring.parse(reqUrl.query)
        if (reqQuery.platform == undefined){
            errParam(res)
        } else {
            fs.readFile('../category/' + reqQuery.platform + '.json', (isErr, data) => {
                if (isErr){
                    errValue(res)
                } else {
                    handleJson(res, data)
                }
            })
        }
    }
    // (5) /detail → 详细信息
    else if (reqPath == '/detail'){
        let reqQuery = querystring.parse(reqUrl.query)
        if (reqQuery.platform == undefined || reqQuery.build == undefined){
            errParam(res)
        } else {
            fs.readFile('../detail/' + reqQuery.platform + '/' + reqQuery.build + '.json', (isErr, data) => {
                if (isErr){ errValue(res) }
                else { handleJson(res, data) }
            })
        }
    }
    // (i) 404
    else {
        res.statusCode = 404
        res.setHeader('Content-Type', 'application/json;charset=utf-8')
        res.end('{"code":404,"message":"Interface is not found!"}')
    }

}).listen(port, () => {
    console.log('服务运行于 http://127.0.0.1:' + port + '/')
})

// 常见返回值汇总
const handleJsonPrefix = '{"code":400,"message":"Successfully requested data!","content":'
function handleJson(serverRes, sourceJson){
    serverRes.statusCode = 200
    serverRes.setHeader('Content-Type', 'application/json;charset=utf-8')
    serverRes.end(handleJsonPrefix + JSON.stringify(JSON.parse(sourceJson.toString('utf-8'))) + '}')
}
function errParam(serverRes){
    serverRes.statusCode = 400
    serverRes.setHeader('Content-Type', 'application/json;charset=utf-8')
    serverRes.end('{"code":400,"message":"Parameter is invalid!"}')
}
function errValue(serverRes){
    serverRes.statusCode = 404
    serverRes.setHeader('Content-Type', 'application/json;charset=utf-8')
    serverRes.end('{"code":404,"message":"Corresponding data of the value is not found!"}')
}