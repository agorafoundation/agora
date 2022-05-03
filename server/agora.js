/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

const express = require('express');
const app = express();
require('dotenv').config();

// required to parse the body of a request (post)
const bodyParser = require('body-parser');
var path = require('path');

app.use(bodyParser.urlencoded({
    extended: true
  }));
app.use(bodyParser.json());

const cors = require('cors');
app.use(cors({
    origin: '*',
    methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH']
}));

// get the port

const PORT = process.env.SITE_PORT;

// set the view engine to ejs
app.set('view engine', 'ejs');

// get the view path for the front end configured
let viewPath = '../client/' + process.env.FRONT_END_NAME + '/views';
let publicPath = 'client/' + process.env.FRONT_END_NAME + '/public';

app.set('views', path.join(__dirname, viewPath));

// open up the resources publically 
app.use(express.static(publicPath));

// import uuid generator
const { v4: uuidv4 } = require('uuid');

// set up session
let session = require('express-session');
const pgSession = require('connect-pg-simple')(session);

// database connection
const db = require('./db/connection');

let sess = {
    store: new pgSession({
        pool : db.pool(),                // Connection pool
        tableName : 'session'   // Use another table-name than the default "session" one
        // Insert connect-pg-simple options here
    }),
    genid: function(req) {
        return uuidv4(); // use UUIDs for session IDs
    },
    resave: false,
    saveUninitialized: true,
    secret: `${process.env.SESSION_SECRET}`,
    cookie: {
        maxAge: 1000 * 60 * 60 * 6, // 6 hours
        sameSite: 'lax',
        secure: false
    }
}

if (app.get('env') === 'production') {
  app.set('trust proxy', 1) // trust first proxy
  sess.cookie.secure = true // serve secure cookies
}

app.use(session(sess));


// check that the user is logged in, if so include user data in req for view
app.use(function (req, res, next) {
    // set the currentUrl so it is available in the esj
    res.locals.currentUrl = encodeURIComponent(req.url);
    
    // if authenticated set the session as a local of the esj
    if(!req.session.isAuth) {
        next();
    }
    else {
        res.locals.authUser = req.session.authUser;
        next();
    }
    
})


/**
 * Page routes
 */
const pageRoutes = require( './routes/pagesRoutes' );
app.use( '/', pageRoutes );

/**
 * Auth routes
 */
const authRoutes = require( './routes/authRoutes' );
app.use( '/', authRoutes );

/**
 * Community routes
 */
const communityRoutes = require( './routes/communityRoutes' );
app.use( '/community', communityRoutes );

/**
 * Profile routes
 */
const profileRoutes = require( './routes/profileRoutes' );
app.use( '/profile', profileRoutes );

/**
 * User Dashboard routes
 */
const dashboardRoutes = require( './routes/dashboardRoutes' );
app.use( '/dashboard', dashboardRoutes );


// // goal
// let goalRoutes = require('./routes/community/goalRoutes');
// app.use('/community/goal', goalRoutes);

// // topic
// let topicRoutes = require('./routes/community/topicRoutes');
// app.use('/community/topic', topicRoutes);








// /**
//  * apis
//  */
// let api = require('./controller/apiController')
// app.use('/api', api);

// /**
//  * Admin
//  */
// let admin = require('./routes/admin/adminRoutes');
// const { append } = require('express/lib/response');
// app.use('/a', admin);




// github api
if(process.env.GITHUB_TOGGLE == 'true') {
    let ghApi = require('./controller/ghApi');
    const { hash } = require('bcrypt');
    const { getMaxListeners } = require('process');

    app.route('/api/webhook/sponsor')
    .post(ghApi.sponsorship);

}




app.listen(PORT, () => console.log('Agora running... {' + process.env.SITE_PROTOCOL + process.env.SITE_HOST + ':' + PORT + '}'));
