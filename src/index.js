import {  getGreekMorph  } from './greek';
import { getLatinMorph } from './latin';

function handleForm(event) {  event.preventDefault();  }

async function getGreek () {
    let formData = document.getElementById('greek-title');  
    let lemma = formData.value;
    const morph = await getGreekMorph(lemma);
    console.log(morph); 
}
async function getLatin () {
    let formData = document.getElementById('latin-title');
    let lemma = formData.value;
    const morph = await getLatinMorph(lemma);
    console.log(morph);
}

let grkForm = document.getElementById('grk-form');
let latForm = document.getElementById('lat-form');
grkForm.addEventListener('submit', handleForm);
grkForm.addEventListener('submit', getGreek);
latForm.addEventListener('submit', handleForm);
latForm.addEventListener('submit', getLatin);


