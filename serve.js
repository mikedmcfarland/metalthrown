var express = require('express')
var livereload = require('livereload')
var nodemon = require('nodemon')

var port = 9000
var buildDir = __dirname + '/build'

//set up web server
var app = express()
app.use(express.static(buildDir))
app.listen(port)

console.log('serving site on port ' + port)

//set up livereload server
var reloadServer = livereload.createServer({
  originalPath : 'http://localhost:9000'
})
reloadServer.watch(buildDir)

console.log('started live-reload server')

//watch src directory for changes and build with metalsmith
var watch = ['src/*','templates/*']
nodemon({
  script: 'buildBlog.js',
  ext: 'js css md jade org',
  watch: watch
})

console.log('nodemon watching',watch,'for changes')
