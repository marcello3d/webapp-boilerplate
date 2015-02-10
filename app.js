var path = require('path');
var log = require('bookrc');
var express = require('express');
var taters = require('taters');
var enchilada = require('enchilada');
var browserkthx = require('browserkthx');
var hbs = require('hbs');
var stylish = require('stylish');
var serve_favicon = require('serve-favicon');
var serve_static = require('serve-static');
var NotFound = require('httperrors').NotFound;

var PRODUCTION = process.env.NODE_ENV === 'production';

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'html' );
app.set('view options', {
    cache: PRODUCTION
});
app.engine('html', hbs.__express);

app.use(serve_favicon(__dirname + '/static/img/favicon.ico'));

// bypass taters for .map.json files
// otherwise it will 404 when it tries to lookup the response
// because the hash is incorrect (the hash is the hash of the underlying js file)
app.use(function(req, res, next) {
    if (/.map.json$/.test(req.path)) {
        req.url = req.path.replace(/\/static\/[a-f0-9]{6}/, '');
        return next();
    }
    next();
});

taters(app, {
    cache: PRODUCTION
});

app.use(stylish({
    src: path.join(__dirname, '/static'),
    compress: PRODUCTION,
    cache: PRODUCTION,
    setup: function(renderer) {
        renderer
          .set('include css', true);
        return renderer;
    }
}));

// this serves up anything .js after bundling
app.use(enchilada({
    src: __dirname + '/static',
    debug: PRODUCTION,
    compress: PRODUCTION,
    cache: PRODUCTION
}));

// this handles every remaining static resources (images, etc)
app.use(serve_static(__dirname + '/static'));

app.get('/', function(req, res, next) {
    res.render('index');
});

app.get('/404', function(req, res, next) {
    next(NotFound());
});

// 404 handler
app.use(function(req, res, next) {
    return next(NotFound());
});

// error handler
app.use(function(err, req, res, next) {
    log.error(err);
    res.sendStatus(500);
});

module.exports = app;
