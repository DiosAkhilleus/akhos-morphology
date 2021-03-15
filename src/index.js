import {  getMorph  } from './morph';

function handleForm(event) {  event.preventDefault();  }

async function getFull () {
    let formData = document.querySelector('#lemmaform input');  
    let lemma = formData.value;
    const morph = await getMorph(lemma);
    console.log(morph);
}

let form = document.getElementById('lemmaform');
form.addEventListener('submit', handleForm);
form.addEventListener('submit', getFull);

