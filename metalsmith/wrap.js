var extname = require('path').extname
var _	    = require('lodash')
var jquery  = require('jquery')
var jsdom   = require('jsdom')
var Promise = require('promise')

function wrap (options) {
  var settings = _.extend({},{
    selector : 'pre,.mxgraph',
    wrapper : '<div class="invert"></div>'
  },options)

  var selector = settings.selector
  var wrapper  = settings.wrapper

  return function(files,metalSmith,done) {

    var alterations = _(files)
      .keys()
      .filter(isHtmlFile)
      .map(function(file) {
        var data = files[file]
        return makeDom(data.contents.toString())
          .then(doWrap).then(function(html) {
            console.log('got result')
            data.contents = new Buffer(html)
          })
      })
      .value()

    Promise.all(alterations).done(function(r) {
      console.log('d0ne')
      done()
    },console.error)
  }

  function doWrap($){
    $(selector).wrap(wrapper)
    var html = $('body').html()

    return html

    // // console.log("elements = ", elements);
    // var pairs = _.map(elements,function(e){
    //   return {element: e, wrap:$(wrapper) }
    // })
    // console.log("pairs = ", pairs);

    // pairs.forEach(function(p) {
    //   p.element.replaceWith(p.wrap)
    //   p.wrap.append(p.element)
    // })

    // var str = $.html()
    // return str
  }
}

// function makeDom(html){
//   return new Promise(function(fulfill){
//     var window = jsdom.jsdom(html).parentWindow
//     jsdom.jQueryify(window,"http://code.jquery.com/jquery.js",function() {
//       fulfill(window.$)
//     })
//   })
// }

function makeDom(html){
  return new Promise(function(fulfill){
    jsdom.env(
      html,
      ['http://code.jquery.com/jquery.js'],
      function(errors,window) {
        if(errors){
          reject(errors)
        }
        fulfill(window.$)
      }
    )
  })
}


function isHtmlFile(file){
  return /\.html?/.test(extname(file));
}

module.exports = wrap
