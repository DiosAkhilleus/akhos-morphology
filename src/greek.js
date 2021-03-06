import {  setUndefined  } from './dom';
import {  greekToBetaCode  } from 'beta-code-js';
import {  parseSingleMorph, parseMultiMorph  } from './helpers'; 
const convert = require('xml-js');
const flatten = require('flat');

async function getGreek (lemma) {
    
    let lemmaArr = lemma.split(' ');
    
    if(lemmaArr.length === 1){
        const morph = await getGreekMorph(lemmaArr[0]);
        //parseSingleMorph(morph);
        console.log(morph);
    } else {
        let multiMorph = [];
        for(let i = 0; i < lemmaArr.length; i++){
            const subMorph = await getGreekMorph(lemmaArr[i]);
            multiMorph.push(subMorph);
        }
        //parseMultiMorph(multiMorph);
        console.log(multiMorph);
    }
    
}

async function getGreekMorph (lemma) { //returns a full array of relevant information relating to the morphology, including the headword, part of speech, inflection possibilities, Wiktionary Def, and LSJ Def
    // fetches the given greek string from the morphology service
    const greekData = await fetch(`http://services.perseids.org/bsp/morphologyservice/analysis/word?lang=grc&engine=morpheusgrc&word=${lemma}`, {mode: 'cors'});
    const dataOut = await greekData.json();
    const body = dataOut.RDF.Annotation.Body;

    if(body === undefined){
        setUndefined();
    }

    //console.log(dataOut);

    let type;
    let returnObj = {};
    if(Array.isArray(body)){ // if multiple possible definitions, returns morphology array for each
        let subObj = {};
        for(let i = 0; i < body.length; i++){
            if(dataOut.RDF.Annotation.Body[i].rest.entry.infl[0] !== undefined){
                type = (dataOut.RDF.Annotation.Body[i].rest.entry.infl[0].pofs.$);
            } else {
                type = dataOut.RDF.Annotation.Body[i].rest.entry.infl.pofs.$;
            }
            const inflections = dataOut.RDF.Annotation.Body[i].rest.entry.infl;
            let headWord = dataOut.RDF.Annotation.Body[i].rest.entry.dict.hdwd.$;
            let fixedHead = headWord.replace(/[1-9]/g, '');
            const inflect = getGreekInflections(inflections, type);
            const shortDict = await getWikiGreek(fixedHead);
            const longDict = await getPerseusGreek(fixedHead);

            console.log(shortDict);

            if(inflect === undefined){ // iff word is not inflected, returns array without inflections (numerals, particles, etc.)
                subObj = {
                            headword: fixedHead, 
                            type: type, 
                            inflections: [
                                {
                                    dialect: "n/a",
                                    inflections: "uninflected"
                                }
                            ], 
                            shortDef: shortDict,
                            longDef: longDict
                        };
            } else {
                subObj = {
                    headword: fixedHead, 
                    type: type, 
                    inflections: inflect,
                    shortDef: shortDict,
                    longDef: longDict
                };
            }
            returnObj[i] = subObj;
        }
        //console.log(returnObj);
        return returnObj; //full array of word possibilities
    } else { //if there is only one headword possible
        
        if(dataOut.RDF.Annotation.Body.rest.entry.infl[0] !== undefined){
            type = (dataOut.RDF.Annotation.Body.rest.entry.infl[0].pofs.$);
        } else {
            type = dataOut.RDF.Annotation.Body.rest.entry.infl.pofs.$;
        }
    
        const inflections = dataOut.RDF.Annotation.Body.rest.entry.infl;
        let headWord = dataOut.RDF.Annotation.Body.rest.entry.dict.hdwd.$;
        let fixedHead = headWord.replace(/[1-9]/g, '');
        const inflect = getGreekInflections(inflections, type);
        const shortDict = await getWikiGreek(fixedHead);
        const longDict = await getPerseusGreek(fixedHead);

        if(inflect === undefined){ // as before, if word is not inflected, returns array without inflections (numerals, particles, etc.)
            return {
                    headword: fixedHead, 
                    type: type, 
                    inflections: [
                        {
                            dialect: 'n/a',
                            inflection: 'uninflected'
                        }
                    ], 
                    shortDef: shortDict,
                    longDef: longDict
                };
        } else {
            return {   
                    headword: fixedHead,
                    type: type,
                    inflections: inflect,
                    shortDef: shortDict,
                    longDef: longDict
                };
        }   
    }
};

const getGreekInflections = (inflectArr, type) => { // returns an array in which each element is itself an array of the dialect type and inflection pattern
    
    if (type === 'verb') { //all other if statements contain similar code that will change what is returned in the array, depending on word type.
        if(Array.isArray(inflectArr)){ // if multiple inflection possibilities, returns array of all possible inflections. 
            let combinedArr = [];
                for(let i = 0; i < inflectArr.length; i++){
                    
                    let person = inflectArr[i].pers.$;
                    let number = inflectArr[i].num.$;
                    let tense = inflectArr[i].tense.$;
                    let voice = inflectArr[i].voice.$;
                    let mood = inflectArr[i].mood.$;
                    if(inflectArr[i].dial){
                        let dialect = inflectArr[i].dial.$;
                        combinedArr[i] = {
                            dialect: dialect,
                            inflection: `${person} person ${number} ${tense} ${voice} ${mood}`
                        };
                    }else {
                        combinedArr[i] = {
                            dialect: 'attic',
                            inflection: `${person} person ${number} ${tense} ${voice} ${mood}`
                        }
                    }
                }
            return combinedArr;
        } else {
            let person = inflectArr.pers.$;
            let number = inflectArr.num.$;
            let tense = inflectArr.tense.$;
            let voice = inflectArr.voice.$;
            let mood = inflectArr.mood.$;
            if(inflectArr.dial){
                let dialect = inflectArr.dial.$;
                return [{
                    dialect: dialect,
                    inflection: `${person} person ${number} ${tense} ${voice} ${mood}`
                }];
            }else {
                return [{
                    dialect: dialect,
                    inflection: `${person} person ${number} ${tense} ${voice} ${mood}`
                }];
            }
        }
    } else if (type === 'verb participle') {
        if(Array.isArray(inflectArr)){
            let combinedArr = [];
                for(let i = 0; i < inflectArr.length; i++){
                    let gender = inflectArr[i].gend.$;
                    let number = inflectArr[i].num.$;
                    let tense = inflectArr[i].tense.$;
                    let voice = inflectArr[i].voice.$;
                    let mood = inflectArr[i].mood.$;
                    if(inflectArr[i].dial){
                        let dialect = inflectArr[i].dial.$;
                        combinedArr[i] = {
                            dialect: dialect, 
                            inflection: `${gender} ${number} ${tense} ${voice} ${mood}`
                        };
                    } else {
                        combinedArr[i] = {
                            dialect: 'attic',
                            inflection: `${gender} ${number} ${tense} ${voice} ${mood}`
                        };
                    }
                }
            return combinedArr;
        } else {
            let gender = inflectArr.gend.$;
            let number = inflectArr.num.$;
            let tense = inflectArr.tense.$;
            let voice = inflectArr.voice.$;
            let mood = inflectArr.mood.$;
            if(inflectArr.dial){
                let dialect = inflectArr.dial.$;
                return [{
                    dialect: dialect, 
                    inflection: `${gender} ${number} ${tense} ${voice} ${mood}`
                }];
            } else {
                return [{
                    dialect: 'attic',
                    inflection: `${gender} ${number} ${tense} ${voice} ${mood}`
                }];
            }
        }
    } else if (type === 'noun') {
        if(Array.isArray(inflectArr)){
            let combinedArr = [];
                for(let i = 0; i < inflectArr.length; i++){
                    
                    let gender = inflectArr[i].gend.$;
                    let nCase = inflectArr[i].case.$;
                    let number = inflectArr[i].num.$;
                    let declension = inflectArr[i].decl.$;
                    if(inflectArr[i].dial){
                        let dialect = inflectArr[i].dial.$;
                        combinedArr[i] = {
                            dialect: dialect, 
                            declension: declension,
                            inflection: `${gender} ${nCase} ${number}`
                        };
                    } else {
                        combinedArr[i] = {
                            dialect: 'attic', 
                            declension: declension,
                            inflection: `${gender} ${nCase} ${number}`
                        };
                    }
                }
            return combinedArr;
        }
        let gender = inflectArr.gend.$;
        let nCase = inflectArr.case.$;
        let number = inflectArr.num.$;
        let declension = inflectArr.decl.$;
        if(inflectArr.dial){
            let dialect = inflectArr.dial.$;
            return [{
                dialect: dialect, 
                declension: declension,
                inflection: `${gender} ${nCase} ${number}`
            }];
        } else {
            return [{
                dialect: 'attic', 
                declension: declension,
                inflection: `${gender} ${nCase} ${number}`
            }];
        }
    } else if (type === 'adjective') {
        if(Array.isArray(inflectArr)){
            let combinedArr = [];
                for(let i = 0; i < inflectArr.length; i++){
                    
                    let gender = inflectArr[i].gend.$;
                    let nCase = inflectArr[i].case.$;
                    let number = inflectArr[i].num.$;
                    let declension = inflectArr[i].decl.$;
                    if(inflectArr[i].dial){
                        let dialect = inflectArr[i].dial.$;
                        combinedArr[i] = {
                            dialect: dialect, 
                            declension: declension,
                            inflection: `${gender} ${nCase} ${number}`
                        };
                    } else {
                        combinedArr[i] = {
                            dialect: 'attic',
                            declension: declension,
                            inflection: `${gender} ${nCase} ${number}`
                        };
                    }
                }
            return combinedArr;
        }
        let gender = inflectArr.gend.$;
        let nCase = inflectArr.case.$;
        let number = inflectArr.num.$;
        let declension = inflectArr.decl.$;
        if(inflectArr.dial){
            let dialect = inflectArr.dial.$;
            return [{
                dialect: dialect, 
                declension: declension,
                inflection: `${gender} ${nCase} ${number}`
            }]; 
        } else {
            return [{
                dialect: 'attic',
                declension: declension,
                inflection: `${gender} ${nCase} ${number}`
            }];
        }
    } else if (type === 'pronoun') {
        if(Array.isArray(inflectArr)){
            let combinedArr = [];
                for(let i = 0; i < inflectArr.length; i++){
                    let person = inflectArr[i].pers.$;
                    let gender = inflectArr[i].gend.$;
                    let nCase = inflectArr[i].case.$;
                    let number = inflectArr[i].num.$;

                        combinedArr[i] = {
                            inflection: `${person} person ${gender} ${nCase} ${number}`
                        };
                }
            return combinedArr;
        }
        let person = inflectArr.pers.$;
        let gender = inflectArr.gend.$;
        let nCase = inflectArr.case.$;
        let number = inflectArr.num.$;
        return [{
            inflection: `${person} person ${gender} ${nCase} ${number}`
        }];
    } else if (type === 'article') {
        if(Array.isArray(inflectArr)){
            let combinedArr = [];
                for(let i = 0; i < inflectArr.length; i++){
                    
                    let gender = inflectArr[i].gend.$;
                    let nCase = inflectArr[i].case.$;
                    let number = inflectArr[i].num.$;
                    if(inflectArr[i].dial){
                        let dialect = inflectArr[i].dial.$;
                        combinedArr[i] = {
                            dialect: dialect, 
                            inflection: `${gender} ${nCase} ${number}`
                        };
                    } else {
                        combinedArr[i] = {
                            dialect: 'attic', 
                            inflection: `${gender} ${nCase} ${number}`
                        };
                    }
                }
            return combinedArr;
        }
        let gender = inflectArr.gend.$;
        let nCase = inflectArr.case.$;
        let number = inflectArr.num.$;
        if(inflectArr.dial){
            let dialect = inflectArr.dial.$;
            return [{
                dialect: dialect, 
                inflection: `${gender} ${nCase} ${number}`
            }];
        } else {
            return [{
                dialect: 'attic', 
                inflection: `${gender} ${nCase} ${number}`
            }];
        }
    }

    //Fix Relative Pronouns
};

async function getWikiGreek (lemma) { // fetches the wiktionary definition for 
    const dictEntry = await fetch(`https://en.wiktionary.org/api/rest_v1/page/definition/${lemma}`, {mode: 'cors'});
    const entryOut = await dictEntry.json();
    console.log("Hello");
    
    if (entryOut === undefined){
        return "Hello";
    } else {
        let def;
        let defArr = entryOut.other[0].definitions;
        
        if(entryOut.other[0].definitions.length === 1){
            def = entryOut.other[0].definitions[0].definition;
            
        } else {
            for(let i = 0; i < defArr.length; i++ ){
                def = def + defArr[i].definition; 
            }
        }
        let fixedDef = def.replace(/undefined/g, '');
        
        
        document.getElementById('greek').innerHTML = fixedDef;
    
        let titles = document.querySelectorAll('#greek a');
        if (titles.length === 0){
            return document.getElementById('greek').innerHTML;
        }
        
        let sumDef;

        if (titles.length < 8 && titles.length > 0) {
            for(let i = 0; i < titles.length; i++){
                if(i === 0){
                    sumDef = `${titles[i].textContent}`;
                } else {
                    sumDef = sumDef + `, ${titles[i].textContent}`;
                }
            }
        } else {
            for(let i = 0; i < titles.length/4; i++){
                if(i === 0){
                    sumDef = `${titles[i].textContent}`;
                } else {
                    sumDef = sumDef + `, ${titles[i].textContent}`;
                }
            }
        }
        //sumDef.replace(/[^a-zA-Z\s,]/g, '')
            
        return sumDef;
    }
};

async function getPerseusGreek(lemma) {
    const beta = greekToBetaCode(lemma);
    
    let dataAsJson = {};
    const data = await fetch(`http://www.perseus.tufts.edu/hopper/xmlchunk?doc=Perseus%3Atext%3A1999.04.0058%3Aentry%3D${beta}`);
    const textData = await data.text();

    if (textData.indexOf('An Error Occurred') > -1) {
        const data1 = await fetch(`http://www.perseus.tufts.edu/hopper/xmlchunk?doc=Perseus%3Atext%3A1999.04.0058%3Aentry%3D${beta}1`);
        const textData1 = await data1.text();
        if (textData1.indexOf('An Error Occurred') > -1) {
            return "Can't Find Entry";
        } else {
            dataAsJson = JSON.parse(convert.xml2json(textData1, {compact: true, spaces: 4}));
            const lower = dataAsJson["TEI.2"].text.body.div0.entry.sense;
        let defArray = [];
        for(let i = 0; i < lower.length; i++){
            const flatter = flatten(lower[i]);
            //console.log(flatter);
            let regex1 = /^_text.0/;
            let regex2 = /_text$/
            let regex3 = /^foreign./;
            let regex4 = /^usg./;

            const asArray = Object.entries(flatter);
            const allowedArr = asArray.filter(([key, value]) => (((regex1.test(key) || regex2.test(key)) && (!regex3.test(key) && !regex4.test(key)) && (value !== ", " && value !== "; " && value !== ":"))));
            const allowedObj = Object.fromEntries(allowedArr);
    
            for (const [key, value] of Object.entries(allowedObj)) {
                allowedObj[key] = value.replace(/^\s/g, '');
                allowedObj[key] = value.replace(/,\s$/, ':');
            }
    
            defArray.push(allowedObj);
        }
        
        let joined = '';
        for(let i = 0; i < defArray.length; i++) {
            let subArr = Object.entries(defArray[i]);
            const endArr = subArr.map(([key, value]) => (value) )
            const endStr = endArr.join(', ');
            
            joined += endStr;
        }
        return joined;
        } 
    } else {
        dataAsJson = JSON.parse(convert.xml2json(textData, {compact: true, spaces: 4}));
        
        const lower = dataAsJson["TEI.2"].text.body.div0.entry.sense;
        let defArray = [];
        for(let i = 0; i < lower.length; i++){
            const flatter = flatten(lower[i]);
            //console.log(flatter);
            let regex1 = /^_text.0/;
            let regex2 = /_text$/
            let regex3 = /^foreign./;
            let regex4 = /^usg./;

            const asArray = Object.entries(flatter);
            const allowedArr = asArray.filter(([key, value]) => (((regex1.test(key) || regex2.test(key)) && (!regex3.test(key) && !regex4.test(key)) && (value !== ", " && value !== "; " && value !== ":"))));
            const allowedObj = Object.fromEntries(allowedArr);
    
            for (const [key, value] of Object.entries(allowedObj)) {
                allowedObj[key] = value.replace(/^\s/g, '');
                allowedObj[key] = value.replace(/,\s$/, ':');
            }
    
            defArray.push(allowedObj);
        }
        
        let joined = '';
        for(let i = 0; i < defArray.length; i++) {
            let subArr = Object.entries(defArray[i]);
            const endArr = subArr.map(([key, value]) => (value) )
            const endStr = endArr.join(', ');
            
            joined += endStr;
        }
        console.log(joined);
        return joined;
    }
}

export default getGreek;