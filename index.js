// https://greekwordnet.chs.harvard.edu/api

async function getMorph (lemma) {
    const greekData = await fetch(`http://services.perseids.org/bsp/morphologyservice/analysis/word?lang=grc&engine=morpheusgrc&word=${lemma}`, {mode: 'cors'});
    const dataOut = await greekData.json();
    const headWord = dataOut.RDF.Annotation.Body.rest.entry.dict.hdwd.$;
    const inflections = dataOut.RDF.Annotation.Body.rest.entry.infl;
    const states = getInflectionStates(inflections);
    console.log(headWord, states);
};

async function getDict () {
    const dictEntry = await fetch(`http://www.perseus.tufts.edu/hopper/morph?l=prose%2Ffh&la=greek`, {mode: 'cors'});
    const entryOut = await dictEntry.json();
    console.log(entryOut);
}

const getInflectionStates = (inflectArr) => {
    
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
                    combinedArr[i] = [[`${dialect}`], [`${person} ${number} ${tense} ${voice} ${mood}`]];
                }else {
                    combinedArr[i] = [['Attic'], [`${person} ${number} ${tense} ${voice} ${mood}`]];
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
            return [[`${dialect}`], [`${person} ${number} ${tense} ${voice} ${mood}`]];
        }else {
            return [['Attic'], [`${person} ${number} ${tense} ${voice} ${mood}`]];
        }
    }
}

const setHead = (head) => {
    console.log(head);
}

//https://crossorigin.me/
