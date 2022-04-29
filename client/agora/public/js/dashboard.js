
/**
 * When user selects an existing goal that they wish to edit this function will populate the DOM
 * using the passed goal so the form is ready for modification of the object.
 * @param {*} goal <- goal used to popluate the form
 * @param {*} goalImagePath <- base path for the image url
 */
function updateGoalModal( goal, goalImagePath ) {
    if(document.getElementById( 'create-goal-modal' ) && goal ) {

        document.getElementById( 'goalId' ).value = goal.id;

        console.log( goal.visibility );
        if( goal.visibility === 0 ) {
            document.getElementById( 'goalVisibilityPrivate' ).checked = true;
            document.getElementById( 'goalVisibilityShared' ).checked = false;
            document.getElementById( 'goalVisibilityPublic' ).checked = false;
        }
        else if( goal.visibility === 1 ) {
            document.getElementById( 'goalVisibilityPrivate' ).checked = false;
            document.getElementById( 'goalVisibilityShared' ).checked = true;
            document.getElementById( 'goalVisibilityPublic' ).checked = false;
        }
        else if( goal.visibility === 2 ) {
            document.getElementById( 'goalVisibilityPrivate' ).checked = false;
            document.getElementById( 'goalVisibilityShared' ).checked = false;
            document.getElementById( 'goalVisibilityPublic' ).checked = true;
        }

        document.getElementById( 'goalVersion' ).value = goal.goalVersion;
        document.getElementById( 'goalName' ).value = goal.goalName;
        document.getElementById( 'goalDescription' ).value = goal.goalDescription;

        if( goal.goalImage ) {
            document.getElementById( 'goalImage' ).src = goalImagePath + goal.goalImage;
        }
        else {
            document.getElementById( 'goalImage' ).src = "data:,";
            document.getElementById( 'formFile' ).value = "";
        }
        

        if( goal.active ) {
            document.getElementById( 'goalActive' ).checked = true;
        }
        else {
            document.getElementById( 'goalActive' ).checked = false;
        }
        
        if( goal.completable ) {
            document.getElementById( 'goalCompletable' ).checked = true;
        }
        else {
            document.getElementById( 'goalCompletable' ).checked = false;
        }
    }
}


/**
 * When user selects an existing topic that they wish to edit this function will populate the DOM
 * using the passed topic so the form is ready for modification of the object.
 * @param {*} topic <- topic used to popluate the form
 * @param {*} topicImagePath <- base path for the image url
 */
function updateTopicModal( topic, topicImagePath ) {
    if(document.getElementById( 'create-topic-modal' ) && topic ) {

        document.getElementById( 'topicId' ).value = topic.id;

        console.log( topic.visibility );
        if( topic.visibility === 0 ) {
            document.getElementById( 'topicVisibilityPrivate' ).checked = true;
            document.getElementById( 'topicVisibilityShared' ).checked = false;
            document.getElementById( 'topicVisibilityPublic' ).checked = false;
        }
        else if( topic.visibility === 1 ) {
            document.getElementById( 'topicVisibilityPrivate' ).checked = false;
            document.getElementById( 'topicVisibilityShared' ).checked = true;
            document.getElementById( 'topicVisibilityPublic' ).checked = false;
        }
        else if( topic.visibility === 2 ) {
            document.getElementById( 'topicVisibilityPrivate' ).checked = false;
            document.getElementById( 'topicVisibilityShared' ).checked = false;
            document.getElementById( 'topicVisibilityPublic' ).checked = true;
        }

        document.getElementById( 'topicName' ).value = topic.topicName;
        document.getElementById( 'topicDescription' ).value = topic.topicDescription;

        if( topic.topicImage ) {
            document.getElementById( 'topicImage' ).src = topicImagePath + topic.topicImage;
        }
        else {
            document.getElementById( 'topicImage' ).src = "data:,";
            document.getElementById( 'formFile' ).value = "";
        }
        

        if( topic.active ) {
            document.getElementById( 'topicActive' ).checked = true;
        }
        else {
            document.getElementById( 'topicActive' ).checked = false;
        }
        
        if( topic.completable ) {
            document.getElementById( 'topicCompletable' ).checked = true;
        }
        else {
            document.getElementById( 'topicCompletable' ).checked = false;
        }
    }
}

/**
 * 
 */
function deleteGoal() {
    // double check the user is sure!!
    console.log( "stub to delete goal ");
}

/**
 * 
 */
function addFilter() {
    console.log( "this will add a filter" );
}