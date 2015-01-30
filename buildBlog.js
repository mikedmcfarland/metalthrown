var minimist    = require('minimist')
var exec        = require('child_process').exec
var Promise     = require('promise')
var blog        = require('./lib/blog')

var argv = minimist(process.argv.slice(2))
var devMode = argv._.indexOf('dev') !== -1

var root = __dirname;
var buildDir = root + '/build'

var cleaned  = execute(root + '/clean')
var builtOrg = execute(root + '/buildOrg')

var buildAll =
  Promise.all([cleaned,builtOrg])
  .then(function(msgs) {
    console.log(msgs.join(''))
    console.log('starting metalsmith build')
    return blog.build({
      root : root,
      buildDir : buildDir,
      ignoreList : [
        '**/*.org',
        '**/package.json',
        '**/node_modules'
      ]
    })
  })
  .done(onComplete,onError)


function execute(cmd) {
  return new Promise(function(fulfill,reject) {
    exec(cmd,function(error,stdout,stderr){
      if(error){
        reject(error + ' : ' + stderr)
      }else{
        fulfill(stdout)
      }
    })
  })
}

function onError(err){
  console.error('error building', err)
}
function onComplete(msg){
  console.log(msg)
  console.log('finished build');
}
