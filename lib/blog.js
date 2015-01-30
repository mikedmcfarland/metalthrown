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
var manipulate  = require('./manipulate')
var Promise     = require('promise')
var _           = require('lodash')

function build(options){
  var root = options.root
  var buildDir = options.buildDir
  var ignoreList = options.ignoreList


  var postsPattern = 'posts/**/*.{html,md}'
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

  var metalSmith = Metalsmith(root)
    .clean(false)
    .metadata({
      site : {
        title : 'Thrown for a loop',
        url: 'http://thrownforaloop.com',
        author: 'Michael McFarland'
      }
    })
    .destination(buildDir)
    .use(ignore(ignoreList))
    .use(drafts())
    .use(fileMetaData([
      {pattern: postsPattern, preserve: true, metadata: {template:'post.jade'}},
      {pattern: pagesPattern, preserve: true, metadata: {template:'page.jade'}}
    ]))
    .use(collections(collectionsDefs))
    .use(markdown())
    .use(excerpts())
    .use(headings(['h1','h2']))
    .use(manipulate(function($) {
      //wrap some stuff to invert it visually
      $('pre,mxgraph').wrap('<div class="invert"></div>')

      //fix org modes markup so its nicely highlighted by prism
      $('pre.src').wrapInner('<code></code>')
      var mapping = [
        {org:"src-emacs-lisp", prism:"scheme" }
      ]
      $('pre.src').each(function(){
        var el = $(this)

        //find org to prism css class mapping
        var codeType = _.find(mapping,function(e) {
          return el.hasClass(e.org)
        })

        //if one exists, remove the added org classes
        //and add the prism one
        if(codeType !== undefined){
          el.removeClass()
          $('code',el).addClass('language-'+codeType.prism)
        }
      })

    }))
    .use(permalinks({
      pattern: ':collection/:title'
    }))
    .use(updatePaths)
    .use(templates('jade'))
    .use(feed({
      collection : 'posts'
    }))

  return new Promise(function(fulfill,reject){
    metalSmith.build(function(err, files) {
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
