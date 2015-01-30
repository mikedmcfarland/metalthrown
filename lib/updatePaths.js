var basename = require('path').basename

function updatePaths(files, metalsmith, done){
    for(var key in files){
        var base = basename(key)
        files[key].path = (base.indexOf('index.html') !== -1) ? 
            key.replace('index.html','') : 
            key;
    }
    done();
}

module.exports = updatePaths;