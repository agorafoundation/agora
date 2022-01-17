const { Pool, Client } = require('pg');

const connectionString = `postgresql://${process.env.PG_USER}:${process.env.PG_PASSWORD}@${process.env.PG_HOST}:${process.env.PG_PORT}/${process.env.PG_DATABASE}`;
console.log(" Connection string:: " + connectionString);
//const pool = 

//module.exports = connectionString;
module.exports = () => new Pool({
    connectionString,
});