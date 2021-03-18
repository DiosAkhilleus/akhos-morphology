import {  getGreekMorph  } from './greek';
import { getLatinMorph } from './latin';

function handleForm(event) {  event.preventDefault();  }

async function getGreek () {
    let formData = document.getElementById('greek-title');  
    let lemma = formData.value;
    
    let lemmaArr = lemma.split(' ');
    console.log(lemmaArr);
    if(lemmaArr.length === 1){
        const morph = await getGreekMorph(lemmaArr[0]);
        console.log(morph); 
    } else {
        let allMorph = [];
        for(let i = 0; i < lemmaArr.length; i++){
            const subMorph = await getGreekMorph(lemmaArr[i]);
            allMorph.push(subMorph);
        }
        console.log(allMorph);
    }
    
}
async function getLatin () {
    let formData = document.getElementById('latin-title');
    let lemma = formData.value;
    let lemmaArr = lemma.split(' ');
    console.log(lemmaArr);
    if(lemmaArr.length === 1){
        const morph = await getLatinMorph(lemmaArr[0]);
        console.log(morph); 
    } else {
        let allMorph = [];
        for(let i = 0; i < lemmaArr.length; i++){
            const subMorph = await getLatinMorph(lemmaArr[i]);
            allMorph.push(subMorph);
        }
        console.log(allMorph);
    }
}

let grkForm = document.getElementById('grk-form');
let latForm = document.getElementById('lat-form');
grkForm.addEventListener('submit', handleForm);
grkForm.addEventListener('submit', getGreek);
latForm.addEventListener('submit', handleForm);
latForm.addEventListener('submit', getLatin);


