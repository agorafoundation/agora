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
        //console.log(currentStep);
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
        //console.log("page has iframes!");
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

    // quill editor for activity (set up for code)
    if(document.getElementById('activity-submit')) {

        hljs.configure({   // optionally configure hljs
            languages: ['javascript', 'ruby', 'python']
        });
        
        var toolbarOptions = [
          ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
          ['blockquote', 'code-block'],
        
          [{ 'header': 1 }, { 'header': 2 }],               // custom button values
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
          [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
          [{ 'direction': 'rtl' }],                         // text direction
        
          [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        
          [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
          [{ 'font': [] }],
          [{ 'align': [] }],
        
          ['clean']                                         // remove formatting button
        ];

        var quill = new Quill('#quill_editor', {
            modules: {
                syntax: true,
                toolbar: [
                    [{ header: [1, 2, false] }],
                    ['bold', 'italic', 'underline'],
                    ['image', 'code-block']
                ]
            }, 
            theme: 'snow'
        });
        // open the code-block by default
        quill.formatLine(0, quill.getLength(), { 'code-block': true });

        document.getElementById('activity-form').addEventListener('submit', () => {
            document.getElementById("quill_html").value = quill.root.innerHTML;
        });
    }

    // quill editor for creator topic form
    if(document.getElementById('creatorTopicForm')) {

        hljs.configure({   // optionally configure hljs
            languages: ['javascript', 'ruby', 'python']
        });
        
        var toolbarOptions = [
          ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
          ['blockquote', 'code-block'],
        
          [{ 'header': 1 }, { 'header': 2 }],               // custom button values
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
          [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
          [{ 'direction': 'rtl' }],                         // text direction
        
          [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        
          [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
          [{ 'font': [] }],
          [{ 'align': [] }],
        
          ['clean']                                         // remove formatting button
        ];

        var quill = new Quill('#quill_editor', {
            modules: {
                syntax: true,
                toolbar: [
                    [{ header: [1, 2, false] }],
                    ['bold', 'italic', 'underline'],
                    ['image', 'code-block']
                ]
            }, 
            theme: 'snow'
        });

        document.getElementById('creatorTopicForm').addEventListener('submit', () => {
            document.getElementById("quill_html").value = quill.root.innerHTML;
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
    let flag = true;
    for(let i=0; i < boxes.length; i++) {
        if(boxes[i].checked == false) {
            flag = false;
            break;
        }
        
    }

    if(flag) {
        document.getElementById('resource_submit').disabled = false;
    }
    else {
        document.getElementById('resource_submit').disabled = true;
    }
}

function updateTopicResourceCompleteStatus(resourceId, submittedText) {

    // get the status of the checkbox
    let status = document.getElementById('resource_complete_' + resourceId).checked;

    fetch('/api/topic/resource', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: 'PATCH',                                                              
        body: JSON.stringify( { resourceId: resourceId, status: status, submittedText: submittedText } )                                        
      }).then((res) => {
    });
}