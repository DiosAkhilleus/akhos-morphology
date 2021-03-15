
import {  getMorph  } from './morph';

function handleForm(event) {  event.preventDefault();  }

async function getFull (input) {
    const morph = await getMorph(input);
    console.log(morph);
}

let form = document.getElementById('lemmaform');
form.addEventListener('submit', handleForm);
form.addEventListener('submit', test);

function test () {
    let formData = document.querySelector('#lemmaform input');  
    let newBook = formData.value;
    getFull(newBook);
}

