import getGreek from './greek';
import getLatin from './latin';
import {  parseSingleMorph, parseMultiMorph  } from './helpers';



function handleForm(event) {  event.preventDefault();  }

async function getFormGreek () {
    let formData = document.getElementById('greek-title');  
    let lemma = formData.value;
    
    getGreek(lemma);
    
}
async function getFormLatin () {
    let formData = document.getElementById('latin-title');
    let lemma = formData.value;
    
    getLatin(lemma);
}


let grkForm = document.getElementById('grk-form');
let latForm = document.getElementById('lat-form');
grkForm.addEventListener('submit', handleForm);
grkForm.addEventListener('submit', getFormGreek);
latForm.addEventListener('submit', handleForm);
latForm.addEventListener('submit', getFormLatin);









//getXML();