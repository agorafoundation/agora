const { Pool, Client } = require('pg');

const connectionString = `postgresql://${process.env.PG_USER}:${process.env.PG_PASSWORD}@${process.env.PG_HOST}:${process.env.PG_PORT}/${process.env.PG_DATABASE}`;
console.log(" Connection string:: " + connectionString);
const pool = new Pool({
  connectionString,
});


exports.insertSponsorRecord = async function(record) {
  let text = 'INSERT INTO cc_sponsors(gh_action, gh_sponsorship_id, gh_sponsorship_created_at, gh_user_login, gh_user_id, gh_user_url, gh_user_type, gh_privacy_level, gh_tier_node_id, gh_tier_created_at, gh_tier_monthly_price_in_cents, gh_tier_monthly_price_in_dollars, gh_tier_name, gh_tier_is_one_time, gh_tier_is_custom_amount, gh_repo_id, gh_repo_name, gh_repo_permissions, gh_repo_created_at, gh_repo_fork)'
    + 'VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)';
  let values = [record.gh_action, record.gh_sponsorship_id, record.gh_sponsorship_created_at, record.gh_user_login, record.gh_user_id, record.gh_user_url, record.gh_user_type, record.gh_privacy_level, record.gh_tier_node_id, record.gh_tier_created_at, record.gh_tier_monthly_price_in_cents, record.gh_tier_monthly_price_in_dollars, record.gh_tier_name, record.gh_tier_is_one_time, record.gh_tier_is_custom_amount, record.gh_repo_id, record.gh_repo_name, record.gh_repo_permissions, record.gh_repo_created_at, record.gh_repo_fork];

  try {
    let response = await pool.query(text, values);
    response.rows[0]

  }
  catch(e) {
    console.log(e.stack)
  }

}
