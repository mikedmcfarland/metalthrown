//Metal-smith dependencies
var Metalsmith  = require('metalsmith')
var markdown    = require('metalsmith-markdown')
var templates   = require('metalsmith-templates')
var collections = require('metalsmith-collections')
var permalinks  = require('metalsmith-permalinks')
var drafts      = require('metalsmith-drafts')
var excerpts    = require('metalsmith-excerpts')
var feed        = require('metalsmith-feed')
var fileMetaData= require('metalsmith-filemetadata')
var headings    = require('metalsmith-headings')
var ignore      = require('metalsmith-ignore')

var updatePaths = require('./updatePaths')
var Promise     = require('promise')
var _           = require('lodash')
var debug       = require('debug')('thrown')

function build(options){
  var root = options.root
  var buildDir = options.buildDir
  var ignoreList = options.ignoreList

  var postsPattern = 'posts/*/*.{html,md}'
  var pagesPattern = 'pages/**/*.{html,md}'

  var collectionsDefs = {
    posts: {
      pattern: postsPattern,
      reverse: true
    },
    pages: {
      pattern: pagesPattern
    }
  }

  debug('configuring metalsmith')
  var metalSmith = Metalsmith(root)
    .clean(false)
    .metadata({
      site : {
        title : 'Thrown for a loop',
        url: 'http://thrownforaloop.com',
        author: 'Michael McFarland'
      },
      formatDate: function(date) {
        if(!date) return ""

        var components =
          [date.getMonth()+1,
           date.getDate()+1,
           date.getFullYear()]

        return components .join('-')
      }
    })
    .destination(buildDir)
    .use(ignore(ignoreList))

  if(!options.showDrafts){
    metalSmith.use(drafts())
  }

  metalSmith
    .use(fileMetaData([
      {pattern: postsPattern, preserve: true, metadata: {template:'post.jade'}},
      {pattern: pagesPattern, preserve: true, metadata: {template:'page.jade'}}
    ]))
    .use(collections(collectionsDefs))
    .use(markdown())
    .use(excerpts())
    .use(headings(['h1','h2']))
    .use(permalinks({
      pattern: ':collection/:title'
    }))
    .use(updatePaths)
    .use(templates('jade'))
    .use(feed({
      collection : 'posts'
    }))

  return new Promise(function(fulfill,reject){
    debug('invoking metalsmith build')
    metalSmith.build(function(err, files) {
      debug('metalsmith completed')
      if(err){
        reject(err)
      }
      fulfill("finished metalsmith build")
    })
  })
}

module.exports = {
  build:build
}
