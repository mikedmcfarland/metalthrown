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

var updatePaths = require('./metalsmith/updatePaths')
var wrap        = require('./metalsmith/wrap')

var minimist    = require('minimist')
var shelljs     = require('shelljs')


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

//clean it ourselves, since metalsmith blasts away our
//hidden files
shelljs.rm('-rf',buildDir + '/*')

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
  .use(drafts())
  .use(fileMetaData([
    {pattern: postsPattern, preserve: true, metadata: {template:'post.jade'}},
    {pattern: pagesPattern, preserve: true, metadata: {template:'page.jade'}}
  ]))
  .use(collections(collectionsDefs))
  .use(markdown())
  .use(excerpts())
  .use(headings(['h1','h2']))
  .use(wrap())
  // .use(wrap({
  //   selector: 'pre.src'
  // }))
// .use(less())
  .use(permalinks({
    pattern: ':collection/:title'
  }))
  .use(updatePaths)
  .use(templates('jade'))
  .use( feed({
    collection : 'posts'
  }))
// .use(function(files,metalsmith,done){
//     console.log('files',files,'metalsmith',metalsmith)
//     console.log('metalsmith._metadata.posts[0]',metalsmith._metadata.posts[0])
//     console.log('metalsmith._metadata.posts[1]',metalsmith._metadata.posts[1])
//    done()
// })

if(devMode){
  metalSmith.use(watch({
    livereload: true
  }))
}

metalSmith
  .build(function(err, files) {
    if(err)
      console.error('error building',err)
  })
