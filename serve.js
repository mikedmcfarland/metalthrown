var express = require('express')

var app = express()
app.use(express.static('./build'))

var port = 9000
app.listen(port)

console.log('serving on port ' + port)
