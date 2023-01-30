/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

/**
 * This JS file is legacy from coding coach.
 * I want to keep it around because it has all the client side logic that was used for the 
 * assessment creation and editing.  I want to keep it around for reference.
 */

//const { ConfigurationServicePlaceholders } = require("aws-sdk/lib/config_service_placeholders");


// keep track of running total of new questions for assessment
let newQuestionNum = 0;
//let newOptionNum = 0;

// keep track of questions and options as a 2-dimensional array
let totalTracking = [];


/**
 * Create an assessment question dynamically
 * @param {*} questionId 
 */
function addQuestion( assessmentId ) {
    //e.stopPropagation();
    let qdiv = document.createElement( 'div' );
    qdiv.setAttribute( "id", "question-border-" + newQuestionNum );
    qdiv.setAttribute( "class", "question-border" );

    let hqid = document.createElement( 'input' );
    hqid.setAttribute( "type", "hidden" );
    hqid.setAttribute( 'id', 'topicAssessmentQuestionId-' + newQuestionNum );
    hqid.setAttribute( "name", "topicAssessmentQuestionId" );
    hqid.setAttribute( "value", newQuestionNum );

    let qh = document.createElement( 'h6' );
    qh.innerHTML = "Question <span id='question-number-" + newQuestionNum + "'>" + newQuestionNum + "</span>:";
    let qp = document.createElement( 'p' );
    let qin = document.createElement( 'input' );
    qin.setAttribute( 'id', 'topicAssessmentQuestionName-' + newQuestionNum );
    qin.setAttribute( "type", "input" );
    qin.setAttribute( "class", "form-control form-control-lg" );
    qin.setAttribute( "name", "topicAssessmentQuestionName-" + newQuestionNum );
    qin.setAttribute( "value", "" );
    qin.setAttribute( "placeholder", "question" );
    qin.setAttribute( "required", "required" );

    //add the question delete button
    let dSpan = document.createElement( 'span' );
    let dBut = document.createElement( 'button' );
    dBut.setAttribute( 'id', 'question-delete-' + newQuestionNum );
    dBut.setAttribute( 'type', 'button' );
    dBut.setAttribute( 'class', 'btn btn-outline-danger' );
    dBut.setAttribute( 'onclick', 'removeOption(' + newQuestionNum + ');' );
    dBut.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"></path><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"></path></svg>Delete';

    dSpan.appendChild( dBut );

    let optsb = document.createElement( "div" );
    optsb.setAttribute( "id", "options-border-" + newQuestionNum );
    optsb.setAttribute( "class", "options-border" );
    
    qdiv.appendChild( hqid );
    qdiv.appendChild( qh );
    qdiv.appendChild( qp );
    qdiv.appendChild( dSpan );
    qdiv.appendChild( qin );
    qdiv.appendChild( optsb );

    // add the question option button
    let ob = document.createElement( 'input' );
    ob.setAttribute( "id", "addQuestionOption-" + newQuestionNum );
    ob.setAttribute( "class", "btn-primary" );
    ob.setAttribute( "type", "button" );
    ob.setAttribute( "name", "addQuestionOption" );
    ob.setAttribute( "value", "Add Option" );

    qdiv.appendChild( ob );

    // set the question
    document.getElementById( 'questions-border' ).appendChild( qdiv );
    let localId = newQuestionNum;

    // add an event listener for the new questions option button
    ob.addEventListener( 'click', ( e ) => {
        addOption( localId );
        e.stopPropagation();
    } );

    newQuestionNum++;

}

function removeQuestion( questionId ) {
    //console.log("removing qusetion: " + questionId);
    let questionDiv = document.getElementById( 'question-border-' + questionId );
    questionDiv.remove();

    // get the total questions
    let totalQuestions = parseInt( document.getElementsByName( 'topicAssessmentQuestionId' ).length ) + 1;
    //console.log("total Questions: " + totalQuestions);

    // re-number the questions
    for( let i = ( questionId + 1 ); i <= totalQuestions; i++ ) {
        let qDiv = document.getElementById( 'question-border-' + i );
        qDiv.setAttribute( 'id', 'question-border-' + ( i - 1 ) );

        // hidden question id div
        let hqdiv = document.getElementById( 'topicAssessmentQuestionId-' + i );
        hqdiv.setAttribute( 'id', 'topicAssessmentQuestionId-' + ( i - 1 ) );
        hqdiv.setAttribute( 'value', ( i - 1 ) );

        // question number
        let qNum = document.getElementById( 'question-number-' + i );
        qNum.setAttribute( 'id', 'question-number-' + ( i - 1 ) );
        qNum.innerHTML = ( i - 1 );

        // question     
        let qIn = document.getElementById( 'topicAssessmentQuestionName-' + i );
        qIn.setAttribute( 'id', 'topicAssessmentQuestionName-' + ( i - 1 ) );
        qIn.setAttribute( 'name', 'topicAssessmentQuestionName-' + ( i - 1 ) );

        //question delete button
        let qdBut = document.getElementById( 'question-delete-' + i );
        qdBut.setAttribute( 'id', 'question-delete-' + ( i - 1 ) );
        qdBut.setAttribute( 'onclick', 'removeQuestion(' + ( i - 1 ) + ');' );

        // update the options container
        let osDiv = document.getElementById( 'options-border-' + i );
        osDiv.setAttribute( 'id', 'options-border-' + ( i - 1 ) );

        // add option button
        let aBut = document.getElementById( 'addQuestionOption-' + i );
        aBut.setAttribute( 'id', 'addQuestionOption-' + ( i - 1 ) );
        aBut.setAttribute( 'onclick', 'addOption(' + ( i - 1 ) + ');' );

        // update the options for this question
        let totalOptions = parseInt( document.getElementsByName( 'topicAssessmentQuestionOptionId-' + i ).length ) + 1;
        for( let j = 1; j < totalOptions; j++ ) {
            // option border
            let oDiv = document.getElementById( 'option-border-' + i + "-" + j );
            oDiv.setAttribute( "id", "option-border-" + ( i - 1 ) + "-" + j );
            oDiv.setAttribute( "class", "option-border-" + j );

            // hidden id div
            let hdiv = document.getElementById( 'topicAssessmentQuestionOptionId-' + i + "-" + j );
            hdiv.setAttribute( 'id', 'topicAssessmentQuestionOptionId-' + ( i - 1 ) + "-" + j );
            hdiv.setAttribute( 'name', 'topicAssessmentQuestionOptionId-' + ( i - 1 ) );
            hdiv.setAttribute( 'value', j );

            // option number
            let oSpan = document.getElementById( 'option-number-' + i + '-' + j );
            oSpan.innerHTML = j;
            oSpan.setAttribute( "id", "option-number-" + ( i - 1 ) + "-" + j );

            // radio value
            let radio = document.getElementById( 'topicAssessmentQuestionOptionsCorrect-' + i + '-' + j );
            radio.setAttribute( 'id', 'topicAssessmentQuestionOptionsCorrect-' + ( i - 1 ) + "-" + j );
            radio.setAttribute( 'name', 'topicAssessmentQuestionOptionsCorrect-' + ( i - 1 ) );
            radio.setAttribute( 'value', j );

            // question input
            let oIn = document.getElementById( 'topicAssessmentQuestionOption-' + i + '-' + j );
            oIn.setAttribute( 'id', 'topicAssessmentQuestionOption-' + ( i - 1 ) + "-" + j );
            oIn.setAttribute( 'name', 'topicAssessmentQuestionOptions-' + ( i - 1 ) );

            //option delete button
            let dBut = document.getElementById( 'option-delete-' + i + '-' + j );
            dBut.setAttribute( 'id', 'option-delete-' + ( i - 1 ) + "-" + j );
            dBut.setAttribute( 'onclick', 'removeOption(' + ( i - 1 ) + ', ' + j + ');' );
        }

    }

    // decrement the new question number so that new questions adjust for the removed one
    newQuestionNum--;
}

/**
 * Create a assessment question option dynamically
 * @param {Integer} questionId 
 * @param {Integer} index
 */
function addOption( questionId ) {

    // get the total number of options 
    let newOptionNum = parseInt( document.getElementsByName( 'topicAssessmentQuestionOptionId-' + questionId ).length + 1 );

    // find out how many options exist now so we can number this one

    let odiv = document.createElement( "div" );
    odiv.setAttribute( 'id', 'option-border-' + questionId + '-' + newOptionNum );
    odiv.setAttribute( "class", "option-border-" + newOptionNum );
    let hqoid = document.createElement( "input" );
    hqoid.setAttribute( 'id', 'topicAssessmentQuestionOptionId-' + questionId + "-" + newOptionNum );
    hqoid.setAttribute( "type", "hidden" );
    hqoid.setAttribute( "name", "topicAssessmentQuestionOptionId-" + questionId );
    hqoid.setAttribute( "value", newOptionNum );

    let os = document.createElement( "span" );
    os.innerHTML = "Option <span id='option-number-" + questionId + "-" + newOptionNum + "'>" + newOptionNum + "</span> : Mark Option Correct ";
    let or = document.createElement( "input" );
    or.setAttribute( 'id', 'topicAssessmentQuestionOptionsCorrect-' + questionId + '-' + newOptionNum );
    or.setAttribute( "type", "radio" );
    or.setAttribute( "name", "topicAssessmentQuestionOptionsCorrect-" + questionId );
    or.setAttribute( "value", newOptionNum );
    let oi = document.createElement( "input" );
    oi.setAttribute( 'id', 'topicAssessmentQuestionOption-' + questionId + '-' + newOptionNum );
    oi.setAttribute( "type", "input" );
    oi.setAttribute( "class", "form-control form-control-lg" );
    oi.setAttribute( "name", "topicAssessmentQuestionOptions-" + questionId );
    oi.setAttribute( "value", "" );
    oi.setAttribute( "placeholder", "option" );
    oi.setAttribute( "required", "reqired" );

    // create the delete button for this option
    let dSpan = document.createElement( 'span' );
    dSpan.setAttribute( 'class', 'button-right' );
    let dBut = document.createElement( 'button' );
    dBut.setAttribute( 'id', 'option-delete-' + questionId + '-' + newOptionNum );
    dBut.setAttribute( 'type', 'button' );
    dBut.setAttribute( 'class', 'btn btn-outline-danger' );
    dBut.setAttribute( 'onclick', 'removeOption(' + questionId + ', ' +  newOptionNum+ ');' );
    dBut.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"></path><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"></path></svg>Delete';

    dSpan.appendChild( dBut );
    

    odiv.appendChild( hqoid );
    odiv.appendChild( os );
    odiv.appendChild( or );
    odiv.appendChild( dSpan );
    odiv.appendChild( oi );
    

    let optsBorder = document.getElementById( 'options-border-' + questionId );
    optsBorder.appendChild( odiv );
    
}

function removeOption( questionId, optionId ) {
    let optionDiv = document.getElementById( 'option-border-' + questionId + "-" + optionId );
    optionDiv.remove();

    // re-number this questions options
    // get the total number of options 
    // let totalOptions = document.getElementsByClassName('option-border-' + questionId).length;
    let totalOptions = parseInt( document.getElementsByName( 'topicAssessmentQuestionOptionId-' + questionId ).length ) + 1;
    for( let i = ( optionId + 1 ); i <= totalOptions; i++ ) {
        // option border
        let oDiv = document.getElementById( 'option-border-' + questionId + "-" + i );
        oDiv.setAttribute( "id", "option-border-" + questionId + "-" + ( i -1 ) );
        oDiv.setAttribute( "class", "option-border-" + ( i - 1 ) );

        // hidden id div
        let hdiv = document.getElementById( 'topicAssessmentQuestionOptionId-' + questionId + "-" + i );
        hdiv.setAttribute( 'id', 'topicAssessmentQuestionOptionId-' + questionId + "-" + ( i - 1 ) );
        hdiv.setAttribute( 'value', ( i -1 ) );

        // option number
        let oSpan = document.getElementById( 'option-number-' + questionId + '-' + i );
        oSpan.innerHTML = ( i -1 );
        oSpan.setAttribute( "id", "option-number-" + questionId + "-" + ( i -1 ) );

        // radio value
        let radio = document.getElementById( 'topicAssessmentQuestionOptionsCorrect-' + questionId + '-' + i );
        radio.setAttribute( 'id', 'topicAssessmentQuestionOptionsCorrect-' + questionId + "-" + ( i -1 ) );
        radio.setAttribute( 'value', ( i - 1 ) );

        // question input
        let qIn = document.getElementById( 'topicAssessmentQuestionOption-' + questionId + '-' + i );
        qIn.setAttribute( 'id', 'topicAssessmentQuestionOption-' + questionId + "-" + ( i - 1 ) );

        //option delete button
        let dBut = document.getElementById( 'option-delete-' + questionId + '-' + i );
        dBut.setAttribute( 'id', 'option-delete-' + questionId + "-" + ( i - 1 ) );
        dBut.setAttribute( 'onclick', 'removeOption(' + questionId + ', ' + ( i -1 ) + ');' );

    }
}


let dragSrcEl = null;
let draggables = document.getElementsByClassName( 'draggable' );

function drag( e ) {
    this.style.opacity = '0.4';
    dragSrcEl = this;
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData( "text", this.id );
    
}

function drop( e ) {
    e.stopPropagation();
    e.preventDefault();

    if ( dragSrcEl !== this ) {
        let data = e.dataTransfer.getData( "text" );
        this.appendChild( document.getElementById( data ) );
    }

    return false;
}

function dragEnd( e ) {
    this.style.opacity = '1';

    for( let i=0; i < draggables.length; i++ ) {
        draggables[i].classList.remove( 'over' );
    }
}

function dragOver( e ) {
    if ( e.preventDefault ) {
        e.preventDefault();
    }

    return false;
}

function dragEnter( e ) {
    this.classList.add( 'over' );
}

function dragLeave( e ) {
    this.classList.remove( 'over' );
}

function checkboxClick( e ) {
    e.stopPropagation();
    e.preventDefault();

    let elCheck = this.querySelector( '.custom-control-input' );
    ( elCheck.checked ) ? elCheck.checked = false : elCheck.checked = true;

}


window.addEventListener( 'load', () => {
    // look for any accordions, apply click event to open
    if( document.getElementsByClassName( 'accordion-container' ) ) {
        const accordionLabel = document.getElementsByClassName( 'accordion-label' );
        for ( let i=0; i<accordionLabel.length; i++ ) {
            accordionLabel[i].addEventListener( 'click', function () {
                this.parentElement.classList.toggle( 'accordion-active' );
            } );
        }

    }

    if( document.getElementById( 'currentStepField' ) ) {
        let currentStep = document.getElementById( 'currentStepField' ).value;

        //console.log(currentStep);
        switch( currentStep ) {
        case "1": {
            let step1 = document.getElementById( 'step1' );
            let step1text = document.getElementById( 'step1-text' );
            let step1a = step1text.childNodes[0];

            step1.classList.add( "grouping-background" );
            step1text.classList.remove( 'codingcoach-red' );
            step1a.classList.add( 'txt-white' );
            break;
        }
            
        case "2": {
            let step2 = document.getElementById( 'step2' );
            let step2text = document.getElementById( 'step2-text' );
            let step2a = step2text.childNodes[0];

            step2.classList.add( "grouping-background" );
            step2text.classList.remove( 'codingcoach-red' );
            step2a.classList.add( 'txt-white' );
            break;
        }
        case "3": {
            let step3 = document.getElementById( 'step3' );
            let step3text = document.getElementById( 'step3-text' );
            let step3a = step3text.childNodes[0];

            step3.classList.add( "grouping-background" );
            step3text.classList.remove( 'codingcoach-red' );
            step3a.classList.add( 'txt-white' );
            break;
        }
        case "4": {
            let step4 = document.getElementById( 'step4' );
            let step4text = document.getElementById( 'step4-text' );
            let step4a = step4text.childNodes[0];

            step4.classList.add( "grouping-background" );
            step4text.classList.remove( 'codingcoach-red' );
            step4a.classList.add( 'txt-white' );
            break;
        }
        case "5": {
            let step5 = document.getElementById( 'step5' );
            let step5text = document.getElementById( 'step5-text' );
            let step5a = step5text.childNodes[0];

            step5.classList.add( "grouping-background" );
            step5text.classList.remove( 'codingcoach-red' );
            step5a.classList.add( 'txt-white' );
            break;
        }
        case "6": {
            let step6 = document.getElementById( 'step6' );
            let step6text = document.getElementById( 'step6-text' );
            let step6a = step6text.childNodes[0];

            step6.classList.add( "grouping-background" );
            step6text.classList.remove( 'codingcoach-red' );
            step6a.classList.add( 'txt-white' );
            break;
        }
        }
    }
    
    if( document.querySelectorAll( "iframe" ) ) {
        //console.log("page has iframes!");
        let frames = document.querySelectorAll( "iframe" );
        frames.forEach( ( frame ) => {
            frame.classList.add( 'iframe-size-control' );
        } );
    }

    if( document.getElementById( 'resource_submit' ) ) {
        // see if the button should be disabled
        resourceButtonAccess();

        document.getElementsByName( 'resource-complete-ck' ).forEach( ( item ) => {
            item.addEventListener( 'change', () => {
                resourceButtonAccess();
            } );
        } );
    }

    // // quill editor for taking an activity (set up for code)
    // if(document.getElementById('activity-submit')) {

    //     hljs.configure({   // optionally configure hljs
    //         languages: ['javascript', 'ruby', 'python']
    //     });
        
    //     var toolbarOptions = [
    //       ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
    //       ['blockquote', 'code-block'],
        
    //       [{ 'header': 1 }, { 'header': 2 }],               // custom button values
    //       [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    //       [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
    //       [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
    //       [{ 'direction': 'rtl' }],                         // text direction
        
    //       [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
    //       [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        
    //       [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
    //       [{ 'font': [] }],
    //       [{ 'align': [] }],
        
    //       ['clean']                                         // remove formatting button
    //     ];

    //     var quill = new Quill('#quill_editor', {
    //         modules: {
    //             syntax: true,
    //             toolbar: [
    //                 [{ header: [1, 2, false] }],
    //                 ['bold', 'italic', 'underline'],
    //                 ['image', 'code-block']
    //             ]
    //         }, 
    //         theme: 'snow'
    //     });
    //     // open the code-block by default
    //     quill.formatLine(0, quill.getLength(), { 'code-block': true });

    //     document.getElementById('activity-form').addEventListener('submit', () => {
    //         document.getElementById("quill_html").value = quill.root.innerHTML;
    //     });
    // }

    // // quill editor for creator TOPIC form
    // if(document.getElementById('creatorTopicForm')) {

    //     hljs.configure({   // optionally configure hljs
    //         languages: ['javascript', 'ruby', 'python']
    //     });
        
    //     var toolbarOptions = [
    //       ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
    //       ['blockquote', 'code-block'],
        
    //       [{ 'header': 1 }, { 'header': 2 }],               // custom button values
    //       [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    //       [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
    //       [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
    //       [{ 'direction': 'rtl' }],                         // text direction
        
    //       [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
    //       [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        
    //       [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
    //       [{ 'font': [] }],
    //       [{ 'align': [] }],
        
    //       ['clean']                                         // remove formatting button
    //     ];

    //     var quill = new Quill('#quill_editor_topic', {
    //         modules: {
    //             syntax: true,
    //             toolbar: [
    //                 [{ header: [1, 2, false] }],
    //                 ['bold', 'italic', 'underline'],
    //                 ['image', 'code-block']
    //             ]
    //         }, 
    //         theme: 'snow'
    //     });

    //     document.getElementById('creatorTopicForm').addEventListener('submit', () => {
    //         document.getElementById("quill_html_topic").value = quill.root.innerHTML;
    //     });
    // }

    // // quill editor for creator TOPIC-activity form
    // if(document.getElementById('topicActivity')) {

    //     hljs.configure({   // optionally configure hljs
    //         languages: ['javascript', 'ruby', 'python']
    //     });
        
    //     var toolbarOptions = [
    //       ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
    //       ['blockquote', 'code-block'],
        
    //       [{ 'header': 1 }, { 'header': 2 }],               // custom button values
    //       [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    //       [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
    //       [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
    //       [{ 'direction': 'rtl' }],                         // text direction
        
    //       [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
    //       [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        
    //       [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
    //       [{ 'font': [] }],
    //       [{ 'align': [] }],
        
    //       ['clean']                                         // remove formatting button
    //     ];

    //     var quillActivity = new Quill('#quill_editor_activity', {
    //         modules: {
    //             syntax: true,
    //             toolbar: [
    //                 [{ header: [1, 2, false] }],
    //                 ['bold', 'italic', 'underline'],
    //                 ['image', 'code-block']
    //             ]
    //         }, 
    //         theme: 'snow'
    //     });

    //     document.getElementById('creatorTopicForm').addEventListener('submit', () => {
    //         document.getElementById("activity_html").value = quillActivity.root.innerHTML;
    //     });
    // }

    // quill editor for creator resource form
    if( document.getElementById( 'resourceDescription' ) ) {

       



        // hljs.configure({   // optionally configure hljs
        //     languages: ['javascript', 'ruby', 'python']
        // });
        
        // var toolbarOptions = [
        //   ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        //   ['blockquote', 'code-block'],
        
        //   [{ 'header': 1 }, { 'header': 2 }],               // custom button values
        //   [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        //   [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
        //   [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
        //   [{ 'direction': 'rtl' }],                         // text direction
        
        //   [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        //   [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        
        //   [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
        //   [{ 'font': [] }],
        //   [{ 'align': [] }],
        
        //   ['clean']                                         // remove formatting button
        // ];

        // var quillResource = new Quill('#quill_editor_resource', {
        //     modules: {
        //         syntax: true,
        //         toolbar: [
        //             [{ header: [1, 2, false] }],
        //             ['bold', 'italic', 'underline'],
        //             ['image', 'code-block']
        //         ]
        //     }, 
        //     theme: 'snow'
        // });

        // // open the code-block by default
        // //quillResource.formatLine(0, quillResource.getLength(), { 'code-block': true });

        // if(document.getElementById('dashboardResourceForm')) {
        //     document.getElementById('dashboardResourceForm').addEventListener('submit', () => {
        //         document.getElementById("quill_html_resource").value = quillResource.root.innerHTML;
        //     });
        // }
        

        // toggleQuillEditor();

        // document.getElementById('resourceType').addEventListener('change', () => {
        //     toggleQuillEditor();
        // })
    }

    /**
     * Drag and drop for pathway (topics related to workspaces) 
     * 
     */
    if( document.getElementById( 'pathway-draggable' ) ) {

        let at = document.getElementById( 'available-items' );
        let ct = document.getElementById( 'chosen-items' );

        at.addEventListener( 'drop', drop );
        at.addEventListener( 'dragover', dragOver );

        ct.addEventListener( 'drop', drop );
        ct.addEventListener( 'dragover', dragOver );

        for( let i=0; i < draggables.length; i++ ) {
            draggables[i].addEventListener( 'dragstart', drag );
            draggables[i].addEventListener( 'dragend', dragEnd );
            draggables[i].addEventListener( 'dragover', dragOver );
            draggables[i].addEventListener( 'dragenter', dragEnter );
            draggables[i].addEventListener( 'dragleave', dragLeave );
            if( document.getElementsByName( 'resource-required' ) ) {
                draggables[i].addEventListener( 'click', checkboxClick );
                
            }
        }
    }
    
    /**
     * When the workspace form is submitted find all the selected topics and populate the pathway hidden form field
     * so that the data can pass as part of the form.
     */
    if( document.getElementById( 'workspaceButton' ) ) {
        /**
         * Parses selected topics and creates list to send to server along with form data
         */
        document.getElementById( 'workspaceButton' ).addEventListener( 'click', () => {
            
            // get the field to add the list to
            let pathway = document.getElementById( 'pathway' );

            // create the list
            let chosenTopics = document.getElementById( 'chosen-items' ).childNodes;
            let topicList = "";
            for( let i=0; i < chosenTopics.length; i++ ) {
                if( chosenTopics[i].id && chosenTopics[i].id > 0 ) {
                    ( topicList.length > 0 ) ? topicList += ",":'';
                    topicList += chosenTopics[i].id;
                }
            }
            // set the list
            pathway.value = topicList;
            
        } );
    }

    /**
     * When the workspace form is submitted find all the selected topics and populate the pathway hidden form field
     * so that the data can pass as part of the form.
     */
    if( document.getElementById( 'topicButton' ) ) {
        /**
         * Parses selected topics and creates list to send to server along with form data
         */
        document.getElementById( 'topicButton' ).addEventListener( 'click', () => {
            
            // get the field to add the list to
            let chosen = document.getElementById( 'selectedTopicResources' );
            let chosenRequired = document.getElementById( 'selectedTopicResourcesRequired' );

            // create the list
            let chosenResources = document.getElementById( 'chosen-items' ).childNodes;
            let resourceList = "";
            let requiredList = "";
            for( let i=0; i < chosenResources.length; i++ ) {
                if( chosenResources[i].id ) {
                    // find if the required box is checked
                    let required = chosenResources[i].querySelector( '[name="resource-required"]' ).checked;

                    let rId = chosenResources[i].id.split( "-" )[1];

                    ( resourceList.length > 0 ) ? resourceList += ",":'';
                    resourceList += rId;

                    ( requiredList.length > 0 ) ? requiredList += ",":'';
                    requiredList += required;

                }
            }
            // set the list
            chosen.value = resourceList;
            chosenRequired.value = requiredList;
            
        } );
    }


    // create event handler for clicking the button to add question
    if( document.getElementById( 'addQuestionToAssessment' ) ) {

        // first we have to find out how many questions already existed so we can set the next question id
        let questionBorders = document.getElementsByClassName( 'question-border' );
        newQuestionNum = questionBorders.length + 1;

        // next get the id of this assessment
        let topicAssessment = document.getElementsByName( 'topicAssessment' );
        let assessmentId = topicAssessment[0].id.split( "-" )[1];
        
        // find the button to add a question and attach the addquestion event.
        document.getElementById( 'addQuestionToAssessment' ).addEventListener( 'click', ( e ) => {
            addQuestion( assessmentId );
            e.stopPropagation();
            
        } );

    }



    
} );



/**
 * When toggling resource types set the correct editor in the UI
 */
function toggleQuillEditor() {
    if( document.getElementById( 'resourceType' ).value == "3" ) {
        document.getElementById( 'quillWrapper' ).style.display = 'none';
        document.getElementById( 'embedded_submission_text_resource' ).style.display = 'block';
    }
    else if( document.getElementById( 'resourceType' ).value == "2" ) {
        document.getElementById( 'quillWrapper' ).style.display = 'none';
        document.getElementById( 'embedded_submission_text_resource' ).style.display = 'none';
    }
    else {
        document.getElementById( 'quillWrapper' ).style.display = 'block';
        document.getElementById( 'embedded_submission_text_resource' ).style.display = 'none';
    }
}


/**
 * api call to update individual topic resources as complete
 */


function resourceButtonAccess() {
    let boxes = document.getElementsByName( 'resource-complete-ck' );
    let flag = true;
    for( let i=0; i < boxes.length; i++ ) {
        if( boxes[i].checked == false ) {
            flag = false;
            break;
        }
        
    }

    if( flag ) {
        document.getElementById( 'resource_submit' ).disabled = false;
    }
    else {
        document.getElementById( 'resource_submit' ).disabled = true;
    }
}

function updateTopicResourceCompleteStatus( resourceId, submittedText ) {

    // get the status of the checkbox
    let status = document.getElementById( 'resource_complete_' + resourceId ).checked;

    fetch( '/api/resource/completed', {
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        method: 'POST',                                                              
        body: JSON.stringify( { resourceId: resourceId, status: status, submittedText: submittedText } )                                        
    } ).then( ( res ) => {
    } );
}






