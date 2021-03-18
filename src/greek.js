import {  setUndefined  } from './dom';

async function getGreekMorph (lemma) { // fetches the given greek string from the morphology service
    const greekData = await fetch(`http://services.perseids.org/bsp/morphologyservice/analysis/word?lang=grc&engine=morpheusgrc&word=${lemma}`, {mode: 'cors'});
    const dataOut = await greekData.json();
    const body = dataOut.RDF.Annotation.Body;

    if(body === undefined){
        setUndefined();
    }

    console.log(dataOut);

    let type;
    let returnArr = [];
    if(Array.isArray(body)){
        let subArr = [];
        for(let i = 0; i < body.length; i++){
            if(dataOut.RDF.Annotation.Body[i].rest.entry.infl[0] !== undefined){
                type = (dataOut.RDF.Annotation.Body[i].rest.entry.infl[0].pofs.$);
            } else {
                type = dataOut.RDF.Annotation.Body[i].rest.entry.infl.pofs.$;
            }
            const inflections = dataOut.RDF.Annotation.Body[i].rest.entry.infl;
            const headWord = dataOut.RDF.Annotation.Body[i].rest.entry.dict.hdwd.$;
            const inflect = getGreekInflections(inflections, type);
            const dict = await getDict(headWord);

            if(inflect === undefined){
                subArr = [headWord, type, dict];
            } else {
                subArr = [headWord, type, inflect, dict];
            }
            returnArr.push(subArr);
        }
        return returnArr;
    } else {
        
        if(dataOut.RDF.Annotation.Body.rest.entry.infl[0] !== undefined){
            type = (dataOut.RDF.Annotation.Body.rest.entry.infl[0].pofs.$);
        } else {
            type = dataOut.RDF.Annotation.Body.rest.entry.infl.pofs.$;
        }
    
        const inflections = dataOut.RDF.Annotation.Body.rest.entry.infl;
        const headWord = dataOut.RDF.Annotation.Body.rest.entry.dict.hdwd.$;
        const inflect = getGreekInflections(inflections, type);
        const dict = await getDict(headWord);

        if(inflect === undefined){
            return [headWord, type, dict];
        } else {
            return [headWord, type, inflect, dict];
        }   
    }
};
const getGreekInflections = (inflectArr, type) => { // returns an array in which each element is itself an array of the dialect type and inflection pattern
    
    if (type === 'verb'){
        if(Array.isArray(inflectArr)){
            let combinedArr = [];
                for(let i = 0; i < inflectArr.length; i++){
                    
                    let person = inflectArr[i].pers.$;
                    let number = inflectArr[i].num.$;
                    let tense = inflectArr[i].tense.$;
                    let voice = inflectArr[i].voice.$;
                    let mood = inflectArr[i].mood.$;
                    if(inflectArr[i].dial){
                        let dialect = inflectArr[i].dial.$;
                        combinedArr[i] = [`${dialect}`, `${person} person ${number} ${tense} ${voice} ${mood}`];
                    }else {
                        combinedArr[i] = ['attic', `${person} person ${number} ${tense} ${voice} ${mood}`];
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
                return [`${dialect}`, `${person} person ${number} ${tense} ${voice} ${mood}`];
            }else {
                return ['attic', `${person} person ${number} ${tense} ${voice} ${mood}`];
            }
        }
    } if (type === 'verb participle'){
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
                        combinedArr[i] = [`${dialect}`, `${gender} ${number} ${tense} ${voice} ${mood}`];
                    }else {
                        combinedArr[i] = ['attic', `${gender} ${number} ${tense} ${voice} ${mood}`];
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
                return [`${dialect}`, `${gender} ${number} ${tense} ${voice} ${mood}`];
            }else {
                return ['attic', `${gender} ${number} ${tense} ${voice} ${mood}`];
            }
        }
    } if (type === 'noun'){
        if(Array.isArray(inflectArr)){
            let combinedArr = [];
                for(let i = 0; i < inflectArr.length; i++){
                    
                    let gender = inflectArr[i].gend.$;
                    let nCase = inflectArr[i].case.$;
                    let number = inflectArr[i].num.$;
                    let declension = inflectArr[i].decl.$;
                    if(inflectArr[i].dial){
                        let dialect = inflectArr[i].dial.$;
                        combinedArr[i] = [`${dialect}`, `${gender} ${nCase} ${number}`, `${declension} declension`];
                    }else {
                        combinedArr[i] = ['attic', `${gender} ${nCase} ${number}`, `${declension} declension`];
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
            return [`${dialect}`, `${gender} ${nCase} ${number}`, `${declension} declension`];
        }else {
            return ['attic', `${gender} ${nCase} ${number}`, `${declension} declension`];
        }
    } if (type === 'adjective'){
        if(Array.isArray(inflectArr)){
            let combinedArr = [];
                for(let i = 0; i < inflectArr.length; i++){
                    
                    let gender = inflectArr[i].gend.$;
                    let nCase = inflectArr[i].case.$;
                    let number = inflectArr[i].num.$;
                    let declension = inflectArr[i].decl.$;
                    if(inflectArr[i].dial){
                        let dialect = inflectArr[i].dial.$;
                        combinedArr[i] = [`${dialect}`, `${gender} ${nCase} ${number}`, `${declension} declension`];
                    }else {
                        combinedArr[i] = ['attic', `${gender} ${nCase} ${number}`, `${declension} declension`];
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
            return [`${dialect}`, `${gender} ${nCase} ${number}`, `${declension} declension`];
        }else {
            return ['attic', `${gender} ${nCase} ${number}`, `${declension} declension`];
        }
    }
};
async function getDict (lemma) {
    const dictEntry = await fetch(`https://en.wiktionary.org/api/rest_v1/page/definition/${lemma}`, {mode: 'cors'});
    const entryOut = await dictEntry.json();
    
    if(entryOut.other !== undefined){
        let def;
        let defArr = entryOut.other[0].definitions
        if(entryOut.other[0].definitions.length = 1){
            def = entryOut.other[0].definitions[0].definition;
        } else {
            for(let i = 0; i < defArr.length; i++ ){
                def = def + defArr[i].definition; 
            }
        }
        document.getElementById('greek').innerHTML = def;
    
        let titles = document.querySelectorAll('#greek a');
        let sumDef = `${titles[0].textContent}`;
        for(let i = 1; i < titles.length; i++){
            sumDef = sumDef + `, ${titles[i].textContent}`;
        }
        return sumDef;
    }
    return "Definition Not Found";
};

export {  getGreekMorph  };