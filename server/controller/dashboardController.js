/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

// dependencies


// models
const Goal = require( '../model/goal' );
const Topic = require( '../model/topic' );
const Resource = require( '../model/resource' );

// services
const goalService = require( '../service/goalService' );
const topicService = require( '../service/topicService' );
const resourceService = require( '../service/resourceService' );

exports.getDashboard = async function( req, res ) {
    console.log("Loading Dashboard");
    let message = '';

    if( req.locals && req.locals.message ) {
        message = req.locals.message;
    }
    
    let goalId = req.params.goalId;

    // get all the goals for this owner
    let ownerGoals = await goalService.getAllGoalsForOwner( req.session.authUser.id, false );
    console.log("Owner goals this is where I left off why is the images path wrong??? " + JSON.stringify(ownerGoals));

    // get all the topics for this owner
    let ownerTopics = await topicService.getAllTopicsForOwner( req.session.authUser.id, true );
    // start the available topics out with the full owner topic set
    let availableTopics = ownerTopics;

    // create an empty goal to use if the user creates a new one
    let goal = Goal.emptyGoal();
    if( goalId > 0 ) {
        goal = await goalService.getActiveGoalWithTopicsById( goalId, false );

        // iterate through the goals assigned topics, remove them from the available list
        for(let i=0; i < goal.topics.length; i++) {
            let redundantTopic = ownerTopics.map( ot => ot.id ).indexOf( goal.topics[i].id );
            
            ~redundantTopic && availableTopics.splice( redundantTopic, 1 );
        }

        // get the topics that are not currently assigned to this goal

    }
    else {
        goal.ownedBy = req.session.authUser.id;
        goal.goalVersion = 1;
    }

    // create an empty topic to use if the user creates a new one
    let topic = Topic.emptyTopic( );

    // get all the resources for this owner
    let availableResources = await resourceService.getAllActiveResourcesForOwner( req.session.authUser.id );
    
    let resource = Resource.emptyResource();
    
    // make sure the user has access to this goal (is owner)
    if(goal.ownedBy === req.session.authUser.id) {
        res.render('dashboard/dashboard', { ownerGoals: ownerGoals, goal: goal, ownerTopics: ownerTopics, topic: topic, availableTopics: availableTopics, availableResources: availableResources, resource: resource });
    }
    else {
        message = 'Access Denied';
        message2 = 'You do not have access to the requested resource';
        res.render('dashboard/dashboard', { ownerGoals: ownerGoals, goal: null, ownerTopics: ownerTopics, topic: topic, message: message, message2: message2 });
    }
}

// exports.saveGoal = async function( req, res ) {
    
//     upload(req, res, (err) => {

//         if(err) {
//             console.log("Error uploading picture : " + err);
//             req.session.uploadMessage = "File size was larger the 1MB, please use a smaller file."
//             res.redirect(303, '/profile/manageProfile');
//         }
//         else {
//             // save image          
                
//             let goal = Goal.emptyGoal();
//             goal.id = req.body.goalId;

//             goal.goalName = req.body.goalName;
//             goal.goalDescription = req.body.goalDescription;
//             goal.active = ( req.body.goalActive == "on" ) ? true : false;
//             goal.completable = ( req.body.goalCompletable == "on") ? true : false;
            
//             // get the existing data
//             if(goal.id) {

//                 goalService.getMostRecentGoalById(goal.id).then((dbGoal) => {
//                     goal.id = dbGoal.id;
//                     goal.goalImage = dbGoal.goalImage

//                     if(req.session.savedGoalFileName) {
//                         goal.goalImage = req.session.savedGoalFileName;
//                     } 

//                     goal.ownedBy = req.session.authUser.id;
//                     goalService.saveGoal(goal).then((savedGoal) => {
//                         res.locals.message = "Goal Saved Successfully";

//                         // get the pathway
//                         let pathway = null;
//                         if(req.body.pathway) {
//                             pathway = req.body.pathway.split(",");
//                             goalService.savePathwayToMostRecentGoalVersion(goal.id, pathway);
//                         }
//                         //console.log("checkin that the pathway was recieved: " + JSON.stringify(pathway));
//                     });

//                 });
//             }
//             else {
                
//                 goal.ownedBy = req.session.authUser.id; 

//                 goalService.saveGoal(goal).then((savedGoal) => {
//                     res.locals.message = "Goal Saved Successfully";
//                 });

//             }
            
//             res.redirect(303, '/a/goal/' + goal.id);

//         }  
//     });


// }