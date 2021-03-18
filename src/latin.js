import { setUndefined } from "./dom";

async function getLatinMorph (lemma) {
    const latinData = await fetch(`http://services.perseids.org/bsp/morphologyservice/analysis/word?lang=lat&engine=morpheuslat&word=${lemma}`)
    const dataOut = await latinData.json();
    const body = dataOut.RDF.Annotation.Body;

    if (body === undefined) {
        setUndefined();
    }


    console.log(dataOut);
    if(Array.isArray(body)) {
        let retArr = [];
        for(let i = 0; i < body.length; i++){
            const inflections = body[i].rest.entry.infl;
            let headWord = body[i].rest.entry.dict.hdwd.$;
            let fixedHead = headWord.replace(/[1-9]/g, '');
            const type = body[i].rest.entry.dict.pofs.$;
            const inflect = getLatinInflections(inflections, type);
            const dict = await getDef(fixedHead);
            
            let setArr = [fixedHead, type, inflect, dict]
            let check = false; 
            console.log(setArr);
            
            for(let i = 0; i < retArr.length; i++) {
                    if(JSON.stringify(setArr) === JSON.stringify(retArr[i])){
                        check = true;
                    }
            }
            if(check === false) {
                retArr.push(setArr);
            }
        }
        

    return retArr;
    } else {
        const inflections = body.rest.entry.infl;
        let headWord = body.rest.entry.dict.hdwd.$;
        let fixedHead = headWord.replace(/[1-9]/g, '');
        console.log(fixedHead);
        const type = body.rest.entry.dict.pofs.$;
        const inflect = getLatinInflections(inflections, type);
        const dict = await getDef(fixedHead);
        
        return [fixedHead, type, inflect, dict];
    }
}

const getLatinInflections = (inflections, type) => {
    //console.log(inflections, type);
    let returnArr = [];
    if(type === 'noun') {
        if(Array.isArray(inflections)){
            for(let i = 0; i < inflections.length; i++){
                let gender = inflections[i].gend.$;
                let latCase = inflections[i].case.$;
                let number = inflections[i].num.$;
                let declension = inflections[i].decl.$;
                let conj = [`${declension} declension`, `${gender} ${latCase} ${number}`];
                returnArr.push(conj);
            }   
            return returnArr;
        } else {
            let gender = inflections.gend.$;
            let latCase = inflections.case.$;
            let number = inflections.num.$;
            let declension = inflections.decl.$;
            returnArr = [`${declension} declension`, `${gender} ${latCase} ${number}`];
            return returnArr;
        }
    }
    if(type === 'verb') {
        if(Array.isArray(inflections)){
            for(let i = 0; i < inflections.length; i++){
                if(inflections[i].mood.$ === 'infinitive'){
                    let latTense = inflections[i].tense.$;
                    let latVoice = inflections[i].voice.$;
                    let latMood = inflections[i].mood.$;
                    let subArr = [`${latTense} ${latVoice} ${latMood}`];
                    returnArr.push(subArr);
                } else {
                    let person = inflections[i].pers.$;
                    let number = inflections[i].num.$;
                    let latTense = inflections[i].tense.$;
                    let latVoice = inflections[i].voice.$;
                    let latMood = inflections[i].mood.$;
                    let subArr = [`${person} person ${number} ${latTense} ${latVoice} ${latMood}`];
                    returnArr.push(subArr);
                }
                
            }   
            return returnArr;
        } else {
            if(inflections.mood.$ === 'infinitive'){
                let latTense = inflections.tense.$;
                let latVoice = inflections.voice.$;
                let latMood = inflections.mood.$;
                returnArr = [`${latTense} ${latVoice} ${latMood}`];
                return returnArr;
            } else {
                let person = inflections.pers.$;
                let number = inflections.num.$;
                let latTense = inflections.tense.$;
                let latVoice = inflections.voice.$;
                let latMood = inflections.mood.$;
                returnArr = [`${person} person ${number} ${latTense} ${latVoice} ${latMood}`];
                return returnArr;
            }
        }
    }
    if(type === 'adjective') {
        if(Array.isArray(inflections)) {
            for(let i = 0; i < inflections.length; i++) {
                if(inflections[i].gend.$ === 'adverbial') {
                    let declension = inflections[i].decl.$;
                    let gender = inflections[i].gend.$;
                    let conj = [`${declension} declension`, `${gender}`];
                    returnArr.push(conj);
                } else {
                    let gender = inflections[i].gend.$;
                    let latCase = inflections[i].case.$;
                    let number = inflections[i].num.$;
                    let declension = inflections[i].decl.$;
                    let conj = [`${declension} declension`, `${gender} ${latCase} ${number}`];
                    returnArr.push(conj);
                }
                
            }   
            return returnArr;
        } else {
            if(inflections.gend.$ === 'adverbial') {
                let declension = inflections.decl.$;
                let gender = inflections.gend.$;
                returnArr = [`${declension}`, `${gender}`];
                return returnArr;
            } else {
                let gender = inflections.gend.$;
                let latCase = inflections.case.$;
                let number = inflections.num.$;
                let declension = inflections.decl.$;
                returnArr = [`${declension} declension`, `${gender} ${latCase} ${number}`];
                return returnArr;
            }
        } 
    }
}

async function getDef (lemma) {
    const latinDef = await fetch (`https://en.wiktionary.org/api/rest_v1/page/definition/${lemma}?redirect=true`);
    const defOut = await latinDef.json();
    const defOut_Latin = defOut.la[0];
    
    let defHTML = defOut_Latin.definitions[0].definition;

    document.getElementById('latin').innerHTML = defHTML;
    let titles = document.querySelectorAll('#latin a');
    let sumDef = `${titles[0].textContent}`;
    for(let i = 1; i < titles.length; i++){
        sumDef = sumDef + `, ${titles[i].textContent}`;
    }

    return sumDef;
}

export {  getLatinMorph, getDef  }