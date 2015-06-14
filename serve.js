#!/usr/bin/env node
var express = require('express')
var livereload = require('livereload')
var nodemon = require('nodemon')
var debug = require('debug')('thrown')

var port = 9000
var buildDir = __dirname + '/build'

//set up web server
var app = express()
app.use(express.static(buildDir))
app.listen(port)

console.log('serving site on port ' + port)

//set up livereload server
var reloadServer = livereload.createServer({
  originalPath : 'http://localhost:'+port
})
reloadServer.watch(buildDir)

console.log('started live-reload server')

//watch src directory for changes and build with metalsmith
var watch = ['src/*','templates/*']
var ignore = [
  'build/*'
]
nodemon({
  exec: './buildBlog.js dev',
  ext: 'js css md jade org',
  watch: watch,
  ignore: ignore
}).on('restart',function(files) {
  debug('App has restarted due to',files)
})

console.log('nodemon watching',watch,'for changes')
