var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var routes = require('./routes/index');
var users = require('./routes/users');
var agencies = require('./routes/agencies');
var sales = require('./routes/sales');
var rents = require('./routes/rents');
var frontusers = require('./routes/frontusers');

var app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/agencies', agencies);
app.use('/sales', sales);
app.use('/rents', rents);
app.use('/frontusers', frontusers);

// mongoose
mongoose.connect('mongodb://sdwimmobackend:j;OnCH.1nh$0ZcwOXiuVeX8/RbIz@ds019654.mlab.com:19654/sdwimmobackendprod', function(err) {
    if (err) return console.log(err)
});

app.set('secretKey', 'ilovescotchyscotch');

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500).json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500).json({
    message: err.message,
    error: {}
  });
});

module.exports = app;
