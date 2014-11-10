//Metal-smith dependencies
var Metalsmith  = require('metalsmith')
    markdown    = require('metalsmith-markdown')
    templates   = require('metalsmith-templates')
    collections = require('metalsmith-collections')
    permalinks  = require('metalsmith-permalinks')
    drafts      = require('metalsmith-drafts')
    excerpts    = require('metalsmith-excerpts')
    less        = require('metalsmith-less')
    feed        = require('metalsmith-feed')
    watch       = require('metalsmith-watch')
    fileMetaData= require('metalsmith-filemetadata')
    headings    = require('metalsmith-headings')

var updatePaths = require('./metalsmith/updatePaths')
    wrap        = require('./metalsmith/wrap')

var minimist = require('minimist')

var argv = minimist(process.argv.slice(2))
var devMode = argv._.indexOf('dev') !== -1


//App dependencies

var collectionsDefs = {
    posts: {
        pattern: 'posts/*.md',
        reverse: true
    },
    pages: {
        pattern: 'pages/*.md'
    }
}

var root = __dirname;
var metalSmith = Metalsmith(root)
    .metadata({
        site : {
             title : 'Thrown for a loop',
             url: 'http://thrownforaloop.com',
             author: 'Michael McFarland'
        }
    })
    // .destination(root + '/build')
    .use(drafts())
    .use(fileMetaData([
        {pattern: 'posts/*.md', preserve: true, metadata: {template:'post.jade'}},
        {pattern: 'pages/*.md', preserve: true, metadata: {template:'page.jade'}}
    ]))
    .use(collections(collectionsDefs))
    .use(markdown())
    .use(excerpts())
    .use(headings(['h1','h2']))
    .use(wrap())
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

function convertToSlug(test){
    return test
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-')
}

metalSmith
    .build(function(err, files) {
        if(err)
            console.error('error building',err)
    })

