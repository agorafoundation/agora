/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */


window.addEventListener('load', () => {
    if(document.getElementById('currentStepField')) {
        let currentStep = document.getElementById('currentStepField').value;
        let goalId = document.getElementById('goalIdField').value;
        let topicId = document.getElementById('topicIdField').value;
        console.log(currentStep);
        switch(currentStep) {
            case "1":
                let step1 = document.getElementById('step1');
                let step1text = document.getElementById('step1-text');
                let step1a = step1text.childNodes[0];

                step1.classList.add("grouping-background");
                step1text.classList.remove('codingcoach-red');
                step1a.classList.add('txt-white');
                break;
            case "2":
                let step2 = document.getElementById('step2');
                let step2text = document.getElementById('step2-text');
                let step2a = step2text.childNodes[0];

                step2.classList.add("grouping-background");
                step2text.classList.remove('codingcoach-red');
                step2a.classList.add('txt-white');
                break;
            case "3":
                let step3 = document.getElementById('step3');
                let step3text = document.getElementById('step3-text');
                let step3a = step3text.childNodes[0];

                step3.classList.add("grouping-background");
                step3text.classList.remove('codingcoach-red');
                step3a.classList.add('txt-white');
                break;
            case "4":
                let step4 = document.getElementById('step4');
                let step4text = document.getElementById('step4-text');
                let step4a = step4text.childNodes[0];

                step4.classList.add("grouping-background");
                step4text.classList.remove('codingcoach-red');
                step4a.classList.add('txt-white');
                break;
            case "5":
                let step5 = document.getElementById('step5');
                let step5text = document.getElementById('step5-text');
                let step5a = step5text.childNodes[0];

                step5.classList.add("grouping-background");
                step5text.classList.remove('codingcoach-red');
                step5a.classList.add('txt-white');
                break;
            case "6":
                let step6 = document.getElementById('step6');
                let step6text = document.getElementById('step6-text');
                let step6a = step6text.childNodes[0];

                step6.classList.add("grouping-background");
                step6text.classList.remove('codingcoach-red');
                step6a.classList.add('txt-white');
                break;
        }
    }
    
    if(document.querySelectorAll("iframe")) {
        console.log("page has iframes!");
        let frames = document.querySelectorAll("iframe");
        frames.forEach((frame) => {
            frame.classList.add('iframe-size-control');
        })
    }

    if(document.getElementById('resource_submit')) {
        // see if the button should be disabled
        resourceButtonAccess();

        document.getElementsByName('resource-complete-ck').forEach((item) => {
            item.addEventListener('change', () => {
                resourceButtonAccess();
            });
        });
    }



})


// if(document.getElementById('step1')) {
    
//     document.getElementById('step1').addEventListener('click', () => {
//         let currentStep = document.getElementById('currentStepField').value;
//         let goalId = document.getElementById('goalIdField').value;
//         let topicId = document.getElementById('topicIdField').value;
//         window.location.assign('/community/topic/' + goalId + '/' + topicId +'?requestedStep=1');

//     });
// }

// if(document.getElementById('switch1')) {
    
//     document.getElementById('switch1').addEventListener('click', () => {
//         let currentStep = document.getElementById('currentStepField').value;
//         let goalId = document.getElementById('goalIdField').value;
//         let topicId = document.getElementById('topicIdField').value;
//         window.location.assign('/community/topic/update/1');

//     });
// }



/**
 * api call to update individual topic resources as complete
 */


function resourceButtonAccess() {
    let boxes = document.getElementsByName('resource-complete-ck');
    console.log("box 0: " + boxes[0].checked);
    console.log("box 1: " + boxes[1].checked);
    let flag = true;
    console.log("there are " + boxes.length + " boxes");
    for(let i=0; i < boxes.length; i++) {
        console.log("checked status: " + boxes[i].checked );
        if(boxes[i].checked == false) {
            flag = false;
            break;
        }
        
    }

    if(flag) {
        console.log("flag true");
        document.getElementById('resource_submit').disabled = false;
    }
    else {
        console.log("flag false");
        document.getElementById('resource_submit').disabled = true;
    }
}

function updateTopicResourceCompleteStatus(resourceId, submittedText) {
    console.log("js call ");

    // get the status of the checkbox
    console.log("the id is: resource_complete_" + resourceId);
    let status = document.getElementById('resource_complete_' + resourceId).checked;
    console.log("the status is: " + status);

    fetch('/api/topic/resource', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: 'PATCH',                                                              
        body: JSON.stringify( { resourceId: resourceId, status: status, submittedText: submittedText } )                                        
      }).then((res) => {
        console.log("fetch returned! " + JSON.stringify(res));
    });
}