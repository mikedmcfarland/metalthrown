var cheerio = require('cheerio')
	extname = require('path').extname
	_	    = require('lodash')


function wrap (options) {
	var settings = _.extend({},{
		selector : 'pre,.mxgraph',
		wrapper : '<div class="invert"></div>',
	},options)

	var selector = settings.selector
	var wrapper  = settings.wrapper

	return function(files,metalSmith,done) {

		Object.keys(files).forEach(function(file) {
			if(!isHtmlFile(file))
				return

			var data = files[file]
		 	var $ = cheerio.load(data.contents.toString())	
		 	var elements = $(selector)

		 	var pairs = _.map(elements,function(e){
		 		return {element: $(e), wrap:$(wrapper) }
		 	})

		 	pairs.forEach(function(p) {
		 		
		 		p.element.replaceWith(p.wrap)
		 		p.wrap.append(p.element)
		 	})

		 	var str = $.html()
		 	data.contents = new Buffer(str)
		})

		done()	
	}
}

function isHtmlFile(file){
  return /\.html?/.test(extname(file));
}

module.exports = wrap