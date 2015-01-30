var extname = require('path').extname
var _	    = require('lodash')
var jsdom   = require('jsdom')
var Promise = require('promise')

/*
 * The action provided is given access to a jquery instance, which can
 * manipulate the dom for every HTML file. Kinda hacky at the moment
 * because it expects that this isn't the entire html page (just a
 * fragment). JSDOM makes a html/body/head, So this just rips the body
 * out when the processing is finished. I'm using this with fragments
 * only, so for the moment this makes sense.
 */
function manipulate (action) {

  return function(files,metalSmith,done) {

    var alterations = _(files)
      .keys()
      .filter(isHtmlFile)
      .map(function(file) {
        var data = files[file]
        var html = data.contents.toString()
        return makeDom(html)
          .then(doAction)
          .then(function(newHtml) {
            data.contents = new Buffer(newHtml)
          })
      })
      .value()

    Promise.all(alterations)
      .done(
        function(r) { done() },
        console.error)
  }

  function doAction($){
    action($)
    var html = $('body').html()
    return html
  }
}

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

module.exports = manipulate
