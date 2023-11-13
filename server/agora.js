/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause
 */

// import and initizialize express
const express = require( "express" );
const app = express();

// config env library setup
require( "dotenv" ).config();

// manage parsing json from body of the request
const bodyParser = require( "body-parser" );

var path = require( "path" );

app.use(
    bodyParser.urlencoded( {
        extended: true,
    } )
);
app.use( bodyParser.json() );


// library that allows us to hook responses in the middleware
const responseHooks = require( "express-response-hooks" );

app.use( responseHooks() );


// cross origin
const cors = require( "cors" );
app.use(
    cors( {
        origin: "*",
        methods: [ "GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH" ],
    } )
);

// get the port from the env file or set 4200 as default
const PORT = process.env.SITE_PORT || 4200;

// set the view engine to ejs
app.set( "view engine", "ejs" );

// get the view path for the front end configured
const viewPath = "../client/" + process.env.FRONT_END_NAME + "/views";
const publicPath = "client/" + process.env.FRONT_END_NAME + "/public";

app.set( "views", path.join( __dirname, viewPath ) );

// open up the resources publically
app.use( express.static( publicPath ) );

// import uuid generator
const { v4: uuidv4 } = require( "uuid" );

// database connection
const db = require( "./db/connection" );

// set up session
let session = require( "express-session" );
const pgSession = require( "connect-pg-simple" )( session );

let sess = {
    store: new pgSession( {
        pool: db.pool(), // Connection pool
        tableName: "session", // Use another table-name than the default "session" one
    // Insert connect-pg-simple options here
    } ),
    genid: function ( req ) {
        return uuidv4(); // use UUIDs for session IDs
    },
    resave: false,
    saveUninitialized: true,
    secret: `${process.env.SESSION_SECRET}`,
    cookie: {
        maxAge: 1000 * 60 * 60 * 6, // 6 hours
        sameSite: "lax",
        secure: false,
    },
};

if ( app.get( "env" ) === "production" ) {
    app.set( "trust proxy", 1 ); // trust first proxy
    sess.cookie.secure = true; // serve secure cookies
}

app.use( session( sess ) );



//check that the user is logged in, if so include user session data in req for view (ejs needs locals)
app.use( function ( req, res, next ) {
    // set the currentUrl so it is available in the esj
    res.locals.currentUrl = encodeURIComponent( req.url );

    // make the auth information available to the locals for ejs
    res.locals.isAuth = req.session.isAuth;
    res.locals.authUser = req.session.authUser;
    next();

} );



/**
 * Auth routes
 */
const authRoutes = require( "./routes/authRoutes" );
app.use( "/", authRoutes );

/**
 * Page routes
 */
const pageRoutes = require( "./routes/pagesRoutes" );
app.use( "/", pageRoutes );

/**
 * User routes
 */
const userRoutes = require( "./routes/userRoutes" );
app.use( "/user", userRoutes );

/**
 * Community routes
 */
const communityRoutes = require( "./routes/communityRoutes" );
app.use( "/community", communityRoutes );

/**
 * Profile routes
 */
const profileRoutes = require( "./routes/profileRoutes" );
app.use( "/profile", profileRoutes );

/**
 * User Dashboard routes
 */
const dashboardRoutes = require( "./routes/dashboardRoutes" );
app.use( "/dashboard", dashboardRoutes );

/**
 * Topic / Main editor routes
 */
const topicRoutes = require( "./routes/topicRoutes" );
app.use( "/topic", topicRoutes );

/**
 * API Routes
 * API master route file, requires each individual API routing file
 */
const apiAuthRoutes = require( "./routes/apiAuthRoutes" );
app.use( "/api/v1/auth", apiAuthRoutes );

/**
 * Un-authorized / un-secure API Routes
 * API master route file for open APIs, requires each individual API routing file
 */
const apiUnauthRoutes = require( "./routes/apiUnauthRoutes" );
const { errorController } = require( "./controller/apis/apiErrorController" );
const ApiMessage = require( "./model/util/ApiMessage" );
app.use( "/api/v1/open", apiUnauthRoutes );


/**
 * OpenAPI / Swagger
 */
const swaggerUi = require( "swagger-ui-express" );
const swaggerJsDoc = require( "swagger-jsdoc" );

// global swagger info (TODO: maybe this should be moved into another file if it is staying?)
const YAML = require( "yamljs" );
const swaggerApiDoc = YAML.load( "./server/agoraApi.yaml" );

// initialize swagger
//const swaggerDocInit = swaggerJsDoc( swaggerGlobal );
app.use( "/api-docs", swaggerUi.serve, swaggerUi.setup( swaggerApiDoc ) );



// // workspace
// let workspaceRoutes = require('./routes/community/workspaceRoutes');
// app.use('/community/workspace', workspaceRoutes);

// // topic
// let topicRoutes = require('./routes/community/topicRoutes');
// app.use('/community/topic', topicRoutes);

// /**
//  * Admin
//  */
// let admin = require('./routes/admin/adminRoutes');
// const { append } = require('express/lib/response');
// app.use('/a', admin);

// github api
if ( process.env.GITHUB_TOGGLE == "true" ) {
    let ghApi = require( "./controller/ghApi" );
    const { hash } = require( "bcrypt" );
    const { getMaxListeners } = require( "process" );

    app.route( "/api/webhook/sponsor" ).post( ghApi.sponsorship );
}

app.use( ( error, req, res, next ) => {
    console.error( error );
    return errorController( ApiMessage.createInternalServerError(), res );
} );

app.listen( PORT, () =>
    console.log(
        "Agora running... {" +
      process.env.SITE_PROTOCOL +
      process.env.SITE_HOST +
      ":" +
      PORT +
      "}"
    )
);
