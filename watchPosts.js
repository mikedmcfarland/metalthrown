var Gaze = require('gaze').Gaze
var exec = require('child_process').exec
var path = require('path')
var Promise = require('promise')
var _ = require('lodash')

var gaze = new Gaze('src/posts/**/*.org')
//on startup, tangle and test all org files
gaze.on('ready',function(watcher) {
  getFiles(watcher,'.org')
    .done(function(paths) {
      paths.forEach(tangleAndTest)
    })
})
//on changes, tangle and test
gaze.on('all',function(type,path){
  if(type !== 'deleted')
    tangleAndTest(path)
})

gaze.on('changed',tangleAndTest)
function tangleAndTest(filepath){
  console.log('tangling and testing', filepath)
  var directory = path.dirname(filepath)

  execute('./tangleOrg ' + filepath)
    .then(function(output) {
      var config = getConfig(directory)
      //no config? we're done
      if(config === undefined){
        return output
      }
      return execute('npm test',{
        cwd: directory
      })
    })
    .done(console.log,console.err)
}


function getConfig(directory){
  var config;
  try {
    var package = directory + "/package.json"
    config = require(package)
  }catch(e){
  }
  return config
}

function execute(cmd,options) {
  return new Promise(function(fulfill,reject) {
    var callback = function(error,stdout,stderr){
      if(error){
        reject(error + ' : ' + stderr)
      }else{
        fulfill(stdout)
      }
    }
    var args = options === undefined ?
      [cmd,callback] :
      [cmd,options,callback]
    exec.apply(null,args)
  })
}

function getFiles(watcher,ext){
  return new Promise(function(fulfill,reject){
    watcher.watched(function(err,watched) {
      if(err){
        reject(err)
      }

      var paths = _(watched)
        .values()
        .flatten()
        .filter(function(s) {
          return s.indexOf(ext) !== -1
        })
        .value()

      fulfill(paths)
    })
  })
}
