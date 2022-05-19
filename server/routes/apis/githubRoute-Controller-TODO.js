/**
 * This file is another TODO to return to when there is time to recollect on how to 
 * build out GitHub API integration.  This file currently contains what would be 
 * broken out into a GitHubRoute and GitHubController for the API calls.
 * 
 * This will likely be the last one addressed. There are no current concrete needs for this
 * in the MVP. So this is really historical for context when getting back into it.
 */

/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

console.log(process.env.GITHUB_COLLABORATORS);

const fetch = require('node-fetch');
const crypto = require('crypto');

const service = require("../../service/sponsorship");
const sponsor = require("../../model/ghSponsor");

exports.sponsorship = async function(req, res) {
	console.log("Request Recieved");
	console.log("request action: " + req.body.action);
	console.log("request user login: " + req.body.sponsorship.sponsor.login);
	console.log("request tier name: " + req.body.sponsorship.tier.name);
	console.log("request is one time?" + req.body.sponsorship.tier.is_one_time)
	if(req && req.body) {
		if(req.body.action && req.body.sponsorship.sponsor.login && req.body.sponsorship.tier.name) {
			console.log("Request for : " + req.body.sponsorship.sponsor.login);
			validateJsonWebhook(req);
			console.log("Validation successful");
			// create a sponsor instance to hold the database
			let sRecord = sponsor.createSponsor();

			// add data to sponsor
			sRecord.gh_action = req.body.action;
			sRecord.gh_sponsorship_id = req.body.sponsorship.node_id;
			sRecord.gh_sponsorship_created_at = req.body.sponsorship.created_at;
			sRecord.gh_user_id = req.body.sponsorship.sponsor.id;
			sRecord.gh_user_login = req.body.sponsorship.sponsor.login;
			sRecord.gh_user_url = req.body.sponsorship.sponsor.url;
			sRecord.gh_user_type = req.body.sponsorship.sponsor.type;
			sRecord.gh_privacy_level = req.body.sponsorship.privacy_level;
			sRecord.gh_tier_node_id = req.body.sponsorship.tier.node_id;
			sRecord.gh_tier_created_at = req.body.sponsorship.tier.created_at;
			sRecord.gh_tier_monthly_price_in_cents = req.body.sponsorship.tier.monthly_price_in_cents;
			sRecord.gh_tier_monthly_price_in_dollars = req.body.sponsorship.tier.monthly_price_in_dollars;
			sRecord.gh_tier_name = req.body.sponsorship.tier.name;
			sRecord.gh_tier_is_one_time = req.body.sponsorship.tier.is_one_time;
			sRecord.gh_tier_is_custom_amount = req.body.sponsorship.tier.is_custom_amount;

			if(!req.body.sponsorship.tier.is_one_time
				&& (req.body.sponsorship.tier.name === "$15 a month"
				|| req.body.sponsorship.tier.name === "$9 a month"
				|| (req.body.sponsorship.tier.is_custom_amount && req.body.sponsorship.tier.monthly_price_in_dollars >= 9))) {
				
				console.log("Monthy - full membership");

				if(req.body.action === "created") {
					console.log("before: " + sRecord);

					const headers = {
						"Authorization" : `Token ${process.env.GITHUB_TOKEN}`
					}
					let response = await fetch(process.env.GITHUB_BASE_URL + process.env.GITHUB_COLLABORATORS + "/" + sRecord.gh_user_login, {
						"method": "PUT",
						"headers": headers,
						"body": '{"permission":"pull"}'
					})

					let result = await response.json();

					console.log(result);

					// save repository info
					if(result) {
						sRecord.gh_repo_id = result.repository.id;
						sRecord.gh_repo_name = result.repository.name;
						sRecord.gh_repo_fork = result.repository.fork;
						sRecord.gh_repo_permissions = result.permissions;
						sRecord.gh_repo_created_at = result.created_at;
					}

					console.log("after: " + sRecord);
				}
				else if(req.body.action === "cancelled") {
					removeFromRepo(sRecord);
				}
			}
			

			// save the record to the database!
			service.insertSponsorRecord(sRecord);

		}
	}

	res.setHeader('Content-Type', 'application/json');
	res.send("{'Success': true}");
}

async function removeFromRepo(sRecord) {
	if(sRecord) {
		let body = '{"owner":"briangormanly","repo":"cc-robotics-programming","username":"' + sRecord.gh_user_login + '"}'
		console.log(body);
		const headers = {
			"Authorization" : `Token ${process.env.GITHUB_TOKEN}`
		}
		let response = await fetch(process.env.GITHUB_BASE_URL + process.env.GITHUB_COLLABORATORS + "/" + sRecord.gh_user_login, {
			"method": "DELETE",
			"headers": headers,
			"body": body
		})

		// save repository info
		if(response) {
			sRecord.gh_repo_id = response.body.repository.id;
			sRecord.gh_repo_name = response.body.repository.name;
			sRecord.gh_repo_fork = response.body.repository.fork;
			sRecord.gh_repo_permissions = response.body.repository.permissions;
			sRecord.gh_repo_created_at = response.body.repository.created_at;
		}

		//console.log(response);
	}
}

/**
 * Verifies the secret sent in the x-hub-signature header to locally known
 * secret.  Verifies that request originated from github server.
 */
function validateJsonWebhook(request) {

    // calculate the signature
    const expectedSignature = "sha1=" +
        crypto.createHmac("sha1", process.env.GITHUB_SECRET)
            .update(JSON.stringify(request.body))
            .digest("hex");

    // compare the signature against the one in the request
    const signature = request.headers["x-hub-signature"];
    if (signature !== expectedSignature) {
        throw new Error("Invalid signature.");
    }
}

//removeFromRepo('BrianMarist');
//addToRepo('BrianMarist');
