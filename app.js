//Set config
global.__CONFIG = require(__dirname + '/config.json');

//Module dependencies.
var express = require('express'),
  routes = require('./routes'),
  app = express();

// all environments
app.configure(function() {
  app.set('views', __dirname + __CONFIG.app.viewsLoc);
  app.set('view engine', 'jade');
  app.set('view options', {
    layout: false
  });
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(express.methodOverride());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + __CONFIG.app.publicLoc));
  app.use(app.router);
});

// development only
if ('development' == app.get('env')) {
  //app.use(express.errorHandler());
}

//Routes

app.get('/', routes.renderIndex());

app.get('/getreleaseversions', routes.getReleaseVersions());

app.get('/data', routes.getItems());

app.listen(process.env.PORT || __CONFIG.app.port);