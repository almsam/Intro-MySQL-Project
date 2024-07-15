const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session')
const bodyParser  = require('body-parser');
const { getUser } = require('./util.js');

let index = require('./routes/index.js');
let loadData = require('./routes/loaddata.js');
let listOrder = require('./routes/listorder.js');
let listProd = require('./routes/listprod.js');
let addCart = require('./routes/addcart.js');
let showCart = require('./routes/showcart.js');
let checkout = require('./routes/checkout.js');
let order = require('./routes/order.js');
let login = require('./routes/login.js');
let register = require('./routes/register.js');
let validateLogin = require('./routes/validateLogin.js');
let logout = require('./routes/logout.js');
let admin = require('./routes/admin.js');
let product = require('./routes/product.js');
let displayImage = require('./routes/displayImage.js');
let customer = require('./routes/customer.js');
let ship = require('./routes/ship.js');

const app = express();

// Enable parsing of requests for POST requests
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));

// This DB Config is accessible globally
dbConfig = {    
  server: 'cosc304_sqlserver',
  database: 'orders',
  authentication: {
      type: 'default',
      options: {
          userName: 'sa', 
          password: '304#sa#pw'
      }
  },   
  options: {      
    encrypt: false,      
    enableArithAbort:false,
    database: 'orders'
  }
}

const checkUser = (req, res, next) => {
  if (getUser(req) == null) {
    // DEBUG
    //req.session.user = { username: "arnold", isAdmin: true, id: 1 };
    res.redirect('/login');
  }

  next();
};

const checkAdmin = (req, res, next) => {
  if (!getUser(req).isAdmin) {
    res.send("404: Page not found");
  }

  next();
};

// Setting up the session.
// This uses MemoryStorage which is not
// recommended for production use.
app.use(session({
  secret: 'COSC 304 Rules!',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: false,
    secure: false,
    maxAge: 60000,
  }
}))

// Setting up the rendering engine
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

// Setting up where static assets should
// be served from.
app.use(express.static('public'));

// Setting up Express.js routes.
// These present a "route" on the URL of the site.
// Eg: http://127.0.0.1/loaddata
app.use('/login', login);
app.use('/register', register);
app.use('/loaddata', loadData);
app.use('/validateLogin', validateLogin);
app.use('/displayImage', displayImage);
app.use('/ship', ship);

app.use(checkUser);

app.use('/', index);
app.use('/admin', checkAdmin, admin);
app.use('/listorder', listOrder);
app.use('/listprod', listProd);
app.use('/addcart', addCart);
app.use('/showcart', showCart);
app.use('/checkout', checkout);
app.use('/order', order);
app.use('/logout', logout);
app.use('/product', product);
app.use('/customer', customer);

// Starting our Express app
app.listen(3000)
