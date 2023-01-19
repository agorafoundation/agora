/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

function sponsor( gh_action, gh_sponsorship_id, gh_sponsorship_created_at, gh_user_login, gh_user_id, gh_user_url, gh_user_type, gh_privacy_level, gh_tier_node_id, gh_tier_created_at, gh_tier_monthly_price_in_cents, gh_tier_monthly_price_in_dollars, gh_tier_name, gh_tier_is_one_time, gh_tier_is_custom_amount, gh_repo_id, gh_repo_name, gh_repo_permissions, gh_repo_created_at, gh_repo_fork ) {
    this.gh_action = gh_action;
    this.gh_sponsorship_id = gh_sponsorship_id;
    this.gh_sponsorship_created_at = gh_sponsorship_created_at;
    this.gh_user_login = gh_user_login;
    this.gh_user_id = gh_user_id;
    this.gh_user_url = gh_user_url;
    this.gh_user_type = gh_user_type;
    this.gh_privacy_level = gh_privacy_level;
    this.gh_tier_node_id = gh_tier_node_id;
    this.gh_tier_created_at = gh_tier_created_at;
    this.gh_tier_monthly_price_in_cents = gh_tier_monthly_price_in_cents;
    this.gh_tier_monthly_price_in_dollars = gh_tier_monthly_price_in_dollars;
    this.gh_tier_name = gh_tier_name;
    this.gh_tier_is_one_time = gh_tier_is_one_time;
    this.gh_tier_is_custom_amount = gh_tier_is_custom_amount;
    this.gh_repo_id = gh_repo_id;
    this.gh_repo_name = gh_repo_name;
    this.gh_repo_permissions = gh_repo_permissions;
    this.gh_repo_created_at = gh_repo_created_at;
    this.gh_repo_fork = gh_repo_fork;
}

exports.createSponsor = function() {
    return new sponsor();
};
