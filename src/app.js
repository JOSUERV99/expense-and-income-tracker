const express = require('express');
const morgan = require('morgan');
const expressHandleBars = require('express-handlebars');
const path = require('path');
require('dotenv').config();

const app = express();

// settings
app.set('port', process.env.PORT || 5000);
app.set('views', path.join(__dirname, 'views'));
app.engine('hbs', expressHandleBars({
    defaultLayout: 'main',
    extname : '.hbs'
}));
app.set('view engine', '.hbs');

// middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));

// routes
app.use(require('./routes/index'));

// static files
app.use(express.static(path.join(__dirname, 'public')));

module.exports = app;