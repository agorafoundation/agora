/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */


// keep track of running total of new questions for assessment
let newQuestionNum = 0;


/**
 * Create an assessment question dynamically
 * @param {*} questionId 
 */
function addQuestion(assessmentId) {
    //e.stopPropagation();
    console.log('Adding Question!');
    let qdiv = document.createElement('div');
    qdiv.setAttribute("id", "question-border-" + newQuestionNum);
    qdiv.setAttribute("class", "question-border");

    let qh = document.createElement('h6');
    qh.textContent = "Question " + newQuestionNum + ":";
    let qp = document.createElement('p');
    let qin = document.createElement('input');
    qin.setAttribute("type", "input");
    qin.setAttribute("class", "form-control form-control-lg");
    qin.setAttribute("name", "topicAssessmentQuestion-" + assessmentId);
    qin.setAttribute("value", "");
    qin.setAttribute("placeholder", "question");
    qin.setAttribute("required", "required");

    let optsb = document.createElement("div");
    optsb.setAttribute("id", "options-border-" + newQuestionNum)
    optsb.setAttribute("class", "options-border");
    
    qdiv.appendChild(qh);
    qdiv.appendChild(qp);
    qdiv.appendChild(qin);
    qdiv.appendChild(optsb);





    // add the question option button
    let ob = document.createElement('input');
    ob.setAttribute("id", "addQuestionOption-" + newQuestionNum);
    ob.setAttribute("class", "btn-primary");
    ob.setAttribute("type", "button");
    ob.setAttribute("name", "addQuestionOption");
    ob.setAttribute("value", "Add Option");

    qdiv.appendChild(ob);

    // set the question
    document.getElementById('questions-border').appendChild(qdiv);
    let localId = newQuestionNum;

    // add an event listener for the new questions option button
    ob.addEventListener('click', () => {
        addQuestionOption(localId);
    })
    console.log("ob event: " + ob.onclick)

    newQuestionNum++;

}


/**
 * Create a assessment question option dynamically
 * @param {Integer} questionId 
 * @param {Integer} index
 */
function addQuestionOption(questionId) {
    console.log('Adding Option!');
    console.log("question Id : " + questionId);

    let odiv = document.createElement("div");
    odiv.setAttribute("class", "option-border");
    let os = document.createElement("span");
    os.textContent = "New Option : Mark Option Correct ";
    let or = document.createElement("input");
    or.setAttribute("type", "radio");
    or.setAttribute("name", "topicAssessmentQuestionOptionsCorrect-" + questionId);
    or.setAttribute("value", "");
    let oi = document.createElement("input");
    oi.setAttribute("type", "input");
    oi.setAttribute("class", "form-control form-control-lg");
    oi.setAttribute("name", "topicAssessmentQuestionOptions-" + questionId);
    oi.setAttribute("value", "");
    oi.setAttribute("placeholder", "option");
    oi.setAttribute("required", "reqired");

    odiv.appendChild(os);
    odiv.appendChild(or);
    odiv.appendChild(oi);

    console.log("why?? " + questionId);
    let optsBorder = document.getElementById('options-border-' + questionId);
    console.log("optsBorder: " + optsBorder);
    optsBorder.appendChild(odiv);
    
}





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


    // quill editor for creator resource form
    if(document.getElementById('creatorResourceForm')) {

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

        document.getElementById('creatorResourceForm').addEventListener('submit', () => {
            document.getElementById("quill_html").value = quill.root.innerHTML;
        });
    }

    /**
     * Drag and drop for pathway (topics related to goals) 
     * 
     */
    if(document.getElementById('pathway-draggable')) {
        console.log("testing !");
        let dragSrcEl = null;
      
        function drag(e) {
            this.style.opacity = '0.4';
            dragSrcEl = this;
            
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData("text", this.id);
            
        }
      
        function drop(e) {
            e.stopPropagation();
            e.preventDefault();

            console.log("about to drop!");
            console.log("1: " + dragSrcEl);
            console.log("2: " + this);

            if (dragSrcEl !== this) {
                let data = e.dataTransfer.getData("text");
                console.log("data was: " + data);
                this.appendChild(document.getElementById(data));
            }

            return false;
        }
        
        function dragEnd(e) {
            this.style.opacity = '1';

            for(let i=0; i < draggables.length; i++) {
                draggables[i].classList.remove('over');
            }
        }

        function dragOver(e) {
            if (e.preventDefault) {
                e.preventDefault();
            }
        
            return false;
        }
        
        function dragEnter(e) {
            this.classList.add('over');
        }
        
        function dragLeave(e) {
            this.classList.remove('over');
        }



        let at = document.getElementById('available-topics');
        let ct = document.getElementById('chosen-topics');

        console.log("at is  : " + at);

        at.addEventListener('drop', drop);
        at.addEventListener('dragover', dragOver);

        ct.addEventListener('drop', drop);
        ct.addEventListener('dragover', dragOver);

        let draggables = document.getElementsByClassName('draggable');
        console.log("the number of draggables is: " + draggables.length);
        for(let i=0; i < draggables.length; i++) {
            draggables[i].addEventListener('dragstart', drag);
            draggables[i].addEventListener('dragend', dragEnd);
            draggables[i].addEventListener('dragover', dragOver);
            draggables[i].addEventListener('dragenter', dragEnter);
            draggables[i].addEventListener('dragleave', dragLeave);
        }
    }
    
    if(document.getElementById('goalButton')) {
        /**
         * Parses selected topics and creates list to send to server along with form data
         */
        document.getElementById('goalButton').addEventListener('click', () => {
            
            // get the field to add the list to
            let pathway = document.getElementById('pathway');

            // create the list
            let chosenTopics = document.getElementById('chosen-topics').childNodes;
            let topicList = "";
            for(let i=0; i < chosenTopics.length; i++) {
                if(chosenTopics[i].id && chosenTopics[i].id > 0) {
                    (topicList.length > 0) ? topicList += ",":'';
                    topicList += chosenTopics[i].id;
                }
            }
            // set the list
            pathway.value = topicList;
            
        });
    }



    // create event handler for clicking the button to add question
    if(document.getElementById('addQuestionToAssessment')) {

        // first we have to find out how many questions already existed so we can set the next question id
        let questionBorders = document.getElementsByClassName('question-border');
        newQuestionNum = questionBorders.length + 1;
        console.log("newQuestionNum set to: " + newQuestionNum);

        // next get the id of this assessment
        let topicAssessment = document.getElementsByName('topicAssessment');
        let assessmentId = topicAssessment[0].id.split("-")[1];
        console.log("assessment Id: " + assessmentId);
        
        // find the button to add a question and attach the addquestion event.
        document.getElementById('addQuestionToAssessment').addEventListener('click', (e) => {
            addQuestion(assessmentId);

            
        });
    }

    // create event handler to handle clicking any of the buttons to add options to questions
    if(document.getElementsByName('addQuestionOption')) {
        // find all of the existing buttons to add options to questions 
        let optionAddButtons = document.getElementsByName('addQuestionOption');

        // iterate through all the existing add option buttons, find the question id in the button id and attach the add addQuestionOption event
        for(let i=0; i < optionAddButtons.length; i++) {
            let questionId = optionAddButtons[i].id.split("-")[1];
            optionAddButtons[i].addEventListener("click", () => {
                addQuestionOption(questionId);
            });
            
        }

    }
});





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

