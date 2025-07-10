// var dotenv=require('dotenv');
// var mongoose=require('mongoose');

// dotenv.config();

// mongoose.connect(process.env.MONGODB_URI);

// const methodOverride = require('method-override');



// var createError = require('http-errors');
// var express = require('express');
// var path = require('path');
// var cookieParser = require('cookie-parser');
// var logger = require('morgan');
// const session=require('express-session');
// const flash   = require('connect-flash');

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
// const passport=require('passport');

// var app = express();

// // view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');

// app.use(flash());

// app.use(session({
//   resave: false,
//   saveUninitialized: false,
//   secret: process.env.SESSION_SECRET
// }))



// app.use(passport.initialize());
// app.use(passport.session());

// passport.serializeUser(usersRouter.serializeUser());
// passport.deserializeUser(usersRouter.deserializeUser());

// app.use(methodOverride('_method'));

// app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });






// module.exports = app;

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const apiRouter = require('./src/routes/apiRouter');
const app = express();
const cors = require('cors');
const swaggerUi  = require('swagger-ui-express');
const swaggerSpec = require('./swagger'); 

// CORS config
const corsOptions = {
  origin: '*',  // Allow Vite dev server
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']                   // Allow cookies/auth headers
};

     // adjust path if you put it elsewhere



app.use(cors(corsOptions));


app.use(express.json());
app.use('/uploads', express.static('uploads')); // serve static images

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(console.error);

app.use('/api/v1', apiRouter); // Mount the REST routes

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message });
});

module.exports = app;

