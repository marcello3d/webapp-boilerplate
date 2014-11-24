// Verify dependencies
try {
    require('safestart');
} catch (e) {
    console.error('Dependency error: '+e);
    process.exit(-1);
}

var http = require('http');
var express = require('express');
var taters = require('taters');
var enchilada = require('enchilada');
var browserkthx = require('browserkthx');
var hbs = require('hbs');
var serve_favicon = require('serve-favicon');
var serve_static = require('serve-static');

// we set certain settings based on production or not
var kProduction = process.env.NODE_ENV === 'production';

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'html' );
app.set('view options', {
    cache: kProduction
});
app.engine('html', hbs.__express);

// serve the favicon from memory
app.use(serve_favicon(__dirname + '/static/img/favicon.ico'));

// inform older browser users that their experience will be degraded
app.use(browserkthx({
    ie: '< 9'
}));

// this does fingerprinting by rewriting html
app.use(taters({
    cache: kProduction
}));

// this serves up anything .js after bundling
app.use(enchilada({
    src: __dirname + '/static/',
    compress: kProduction,
    cache: kProduction
}));

// this handles every remaining static resources (images, etc)
app.use(serve_static(__dirname + '/static'));

/// other routes I put here or in separate files
/// see http://shtylman.com/post/expressjs-re-routing/

app.get('/', function(req, res, next) {
    res.render('index');
});

// 404 handler
app.use(function(req, res, next) {
    res.render('404', {
        url:req.url
    });
});

// error handler
app.use(function(err, req, res, next) {
});


var server = http.createServer(app);
server.listen(3400, function() {
    var address = server.address();
    console.log("Listening on http://"+address.address+":"+address.port+"/ ...")
});
