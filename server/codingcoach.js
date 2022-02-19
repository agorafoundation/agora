/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

const express = require('express');
const app = express();
require('dotenv').config();

// import UA parsing library
const DeviceDetector = require("device-detector-js");
const deviceDetector = new DeviceDetector();

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

// set the view engine to ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../client/views'));
//app.set('views',[path.join(__dirname, '../client/views'), path.join(__dirname, '../client/views/auth')]);

// open up the resources publically 
app.use(express.static('client/public'));

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
        res.locals.user = req.session.user;
        next();
    }
    
})


app.get('/', function (req, res) {
  res.render('index')
});

app.get('/about', function (req, res) {
  res.render('about')
});

app.get('/sponsor', function (req, res) {
  res.render('sponsor')
});

// TODO: temp test of products this will be moved into it's own controller when dynamic product pages are built out
//let productService = require('./service/productService');
app.get('/codebot', async function (req, res) {
    // temp test of products
    //let product = await productService.getActiveProductWithProductImagesById(1);
    //console.log(product);

    res.render('codebot')
});

app.get('/signIn', (req, res) => {
    // see if a redirect parameter was passed and pass it through to the view to include in the sign in post.
    if(req.query.redirect) {
        res.locals.redirect = req.query.redirect;
    }
    res.render('sign-in', {redirect: req.query.redirect});
});

app.get('/signOut', (req, res) => {

    req.session.destroy((error) => {
        if (error) throw error;
        res.render('sign-in', { message: "You have been signed out!", message2: "Thank you for being a part of our community! Hope to see you again soon." });
    });
});

const nodemailer = require("nodemailer");

app.get('/forgotPass', (req, res) => {
    res.render('user-forgot-password');
});

app.get('/userError', (req, res) => {
    res.render('user-error');
});

// import service
const userService = require("./service/userService");

app.post('/resetPass', async (req, res) => {

    if(req.body.forgotPasswordEmail) {
        // generate and save the token
        let exeration = process.env.PW_TOKEN_EXPIRATION;
        let token = await userService.createPasswordToken(req.body.forgotPasswordEmail);
        if(token) {
            const nodeMailer = require('nodemailer');
            if(process.env.EMAIL_TOGGLE == "true") {
                let secure = (process.env.EMAIL_SECURE === 'true');
                let transporter = nodemailer.createTransport({
                    host: process.env.EMAIL_HOST,
                    secure: secure,
                    port: process.env.EMAIL_PORT,
                    auth: {
                        user: process.env.EMAIL,
                        pass: process.env.EMAIL_PASSWORD,
                    },
                });
    
                const mailOptions = {
                    from: process.env.EMAIL_FROM, // sender address
                    to: req.body.forgotPasswordEmail,
                    subject: "Reset your password", // Subject line
                    html: "<p>Hello, we hope this email finds you well!</p>"
                        + "<p>You can reset your Coding Coach password by clicking on "
                        + "<strong><a href='http://codingcoach.net/resetPass/" + req.body.forgotPasswordEmail + "/" + token + "'>this link!</a></strong></p>"
                        + "<p>This link will expire in 24 hours!</p>"
                        + "<p>Carpe Diem!</p>"
                        + "<p>The Coding Coach Team</p>", // plain text body
                };
    
                await transporter.sendMail(mailOptions, function(err, info) {
                    if (err) {
                        // handle error
                        console.log(err);
                    }
                    //console.log(info);
                });
            }
            else {
                console.log("[WARN] Forgot password email not sent because EMAIL_TOGGLE value set to false (sending emails is turned off!)");
            }
            

            res.render('user-reset-password-sent');
        }
        else {
            res.redirect(303, '/userError');
        }
    }
    else {
        res.redirect(303, '/userError');
    }
});

app.get('/resetPass/:email/:token', async (req, res) => {
        let userEmail = req.params.email;
        let userToken = req.params.token;
        //console.log("user email: " + userEmail + " user Token: " + userToken);
        if(userEmail && userToken) {
            // verify email and token match
            let ready = await userService.verifyEmailTokenResetCombo(userEmail, userToken);
            if(ready) {
                // show reset page
                res.render('user-reset-password', {email: userEmail, token: userToken});
            }
        }
    }
);

app.post('/newPass', async (req, res) => {
    let userEmail = req.body.pwResetEmail;
    let userToken = req.body.pwResetToken;
    let hashedPassword = await userService.passwordHasher(req.body.psw);

    if(userEmail && userToken && hashedPassword) {
        let result = await userService.resetPassword(userEmail, userToken, hashedPassword);
        if(result) {
            res.render('sign-in', { message: "Your Password has been successfully changed!", message2: "You may now sign in." });
        }
        else {
            res.redirect(303, '/userError');
        }
    }
})

app.get('/verifyEmail/:email/:token', async (req, res) => {
    let userEmail = req.params.email;
    let emailToken = req.params.token;
    //console.log("user email: " + userEmail + " email Token: " + emailToken);
    if(userEmail && emailToken) {
        // verify email and token match
        let ready = await userService.verifyEmailTokenVerifyCombo(userEmail, emailToken);
        if(ready) {
            req.session.destroy((error) => {
                if (error) throw error;
                res.render('sign-in', { message: "Your email address has been successfully verified!", message2: "Thank you for verifying your email! Please sign in." });
            });
        }
        else {
            res.redirect(303, '/userError');
        }
    }
    else {
        res.redirect(303, '/userError');
    }
}
);

app.post('/signIn', async (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    
    if(req && req.body) {
        if(req.body.signInEmail || req.body.siPassword) {
            
            let user = await userService.getUserByEmail(req.body.signInEmail);
            
            // decision on email
            if(user) {
                // perform password check
                //let passCheck = await userService.checkPassword(user.email, req.body.siPassword);

                req.session.isAuth = await userService.checkPassword(user.email, req.body.siPassword);

                // decision on password
                if(req.session.isAuth) {
                    // now that we know they have valid password, get the whole user with role and topic data
                    user = await userService.setUserSession(req.body.signInEmail);
                    //console.log("full user output: " + JSON.stringify(user));

                    const uRole = await userService.getActiveRoleByName("User");
                    //console.log("uRole: " + JSON.stringify(uRole));

                    // decision on wether user has an authorized role
                    if(user.roles && user.roles.filter(role => role.id === uRole.id).length > 0) {
                        // assign the user to the session
                        req.session.user = user;
                        
                        // parse the UA data
                        const device = deviceDetector.parse(req.headers['user-agent']);
                        //console.log("device check: " + JSON.stringify(device));

                        var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress 
                        //console.log("ip check: " + ip);

                        // log the data
                        if(user && device) {
                            await userService.logUserSession(user.id, ip, device);

                        }

                        if(req.query.redirect) {
                            res.redirect(303, req.query.redirect);
                        }
                        else if(req.session.user.emailValidated) {
                            res.redirect(303, '/community');
                        }
                        else {
                            res.redirect(303, '/auth');
                        }
                    }
                    else {
                        res.render('sign-in', {
                            redirect: req.query.redirect,
                            passwordMessage: "You are not authorized!"});
                    }

                }
                else {
                    if(req.query.redirect) {
                        res.render('sign-in', {
                            redirect: req.query.redirect,
                            passwordMessage: "Incorrect Username / Password!"});
                    }
                    else {
                        res.render('sign-in', {passwordMessage: "Incorrect Username / Password!"});
                    }
                }
            }
            else {
                if(req.query.redirect) {
                    res.render('sign-in', {
                            redirect: req.query.redirect,
                            passwordMessage: "Incorrect Username / Password!"});
                }
                else {
                    res.render('sign-in', {passwordMessage: "Incorrect Username / Password!"});
                }
            }
        }
    }
});


/**
 * Community routes
 */
// base and sign-up
let communityRoutes = require('./routes/communityRoutes');
app.use('/community', communityRoutes);

// goal
let goalRoutes = require('./routes/community/goalRoutes');
app.use('/community/goal', goalRoutes);

// topic
let topicRoutes = require('./routes/community/topicRoutes');
app.use('/community/topic', topicRoutes);

/**
 * User / Profile routes
 */
let userRoutes = require('./routes/userRoutes');
app.use('/user', userRoutes);

/**
 * Dashboard Routes
 */
let auth = require('./routes/authRoutes');
app.use('/auth', auth);

/**
 * apis
 */
let api = require('./controller/apiController')
app.use('/api', api);

/**
 * Admin
 */
let admin = require('./routes/admin/adminRoutes');
app.use('/a', admin);




// github api
if(process.env.GITHUB_TOGGLE == 'true') {
    let ghApi = require('./controller/ghApi');
    const { hash } = require('bcrypt');
    const { getMaxListeners } = require('process');

    app.route('/api/webhook/sponsor')
    .post(ghApi.sponsorship);

}




app.listen(2633, () => console.log('Coding Coach away... {localhost:2633}'));
