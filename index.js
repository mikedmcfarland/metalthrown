//Metal-smith dependencies
var Metalsmith  = require('metalsmith')
var markdown    = require('metalsmith-markdown')
var templates   = require('metalsmith-templates')
var collections = require('metalsmith-collections')
var permalinks  = require('metalsmith-permalinks')
var drafts      = require('metalsmith-drafts')
var excerpts    = require('metalsmith-excerpts')
var less        = require('metalsmith-less')
var feed        = require('metalsmith-feed')
var watch       = require('metalsmith-watch')
var fileMetaData= require('metalsmith-filemetadata')
var headings    = require('metalsmith-headings')
var ignore      = require('metalsmith-ignore')

var updatePaths = require('./metalsmith/updatePaths')
var manipulate  = require('./metalsmith/manipulate')

var minimist    = require('minimist')
var shelljs     = require('shelljs')
var _           = require('lodash')


var argv = minimist(process.argv.slice(2))
var devMode = argv._.indexOf('dev') !== -1

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

var root = __dirname;
var buildDir = root + '/build'

// //clean it ourselves, since metalsmith blasts away our
// //hidden files
// console.log('cleaning build')

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
  // .use(ignore([
  //   "*.js",
  //   "*.css"
  // ]))
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
  .use(manipulate(function($){
  }))
  .use(permalinks({
    pattern: ':collection/:title'
  }))
  .use(updatePaths)
  .use(templates('jade'))
  .use(feed({
    collection : 'posts'
  }))
// .use(function(files,metalsmith,done){
//     console.log('files',files,'metalsmith',metalsmith)
//     console.log('metalsmith._metadata.posts[0]',metalsmith._metadata.posts[0])
//     console.log('metalsmith._metadata.posts[1]',metalsmith._metadata.posts[1])
//    done()
// })

// if(devMode){
//   metalSmith.use(watch({
//     livereload: true
//   }))
// }
console.log('starting build')
metalSmith
  .build(function(err, files) {
    if(err)
      console.error('error building',err)
    console.log('finished build')
  })
