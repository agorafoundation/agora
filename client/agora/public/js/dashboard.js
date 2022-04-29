
/**
 * 
 */
function updateGoalModal( goal, goalImagePath ) {
    if(document.getElementById('create-goal-modal') && goal) {

        document.getElementById('goalId').value = goal.id;

        console.log( goal.visibility );
        if( goal.visibility === 0 ) {
            document.getElementById('goalVisibilityPrivate').checked = true;
            document.getElementById('goalVisibilityShared').checked = false;
            document.getElementById('goalVisibilityPublic').checked = false;
        }
        else if( goal.visibility === 1 ) {
            document.getElementById('goalVisibilityPrivate').checked = false;
            document.getElementById('goalVisibilityShared').checked = true;
            document.getElementById('goalVisibilityPublic').checked = false;
        }
        else if( goal.visibility === 2 ) {
            document.getElementById('goalVisibilityPrivate').checked = false;
            document.getElementById('goalVisibilityShared').checked = false;
            document.getElementById('goalVisibilityPublic').checked = true;
        }

        document.getElementById('goalVersion').value = goal.goalVersion;
        document.getElementById('goalName').value = goal.goalName;
        document.getElementById('goalDescription').value = goal.goalDescription;

        if( goal.goalImage ) {
            document.getElementById('goalImage').src = goalImagePath + goal.goalImage;
        }
        else {
            document.getElementById('goalImage').src = "data:,";
            document.getElementById('formFile').value = "";
        }
        

        if( goal.active ) {
            document.getElementById('goalActive').checked = true;
        }
        else {
            document.getElementById('goalActive').checked = false;
        }
        
        if( goal.completable ) {
            document.getElementById('goalCompletable').checked = true;
        }
        else {
            document.getElementById('goalCompletable').checked = false;
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