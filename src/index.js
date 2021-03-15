
// const { Parser } = require('urn-parser');

// https://greekwordnet.chs.harvard.edu/api

async function getMorph (lemma) { // fetches the given greek string from the morphology service
    const greekData = await fetch(`http://services.perseids.org/bsp/morphologyservice/analysis/word?lang=grc&engine=morpheusgrc&word=${lemma}`, {mode: 'cors'});
    const dataOut = await greekData.json();
    console.log(dataOut);
    const inflections = dataOut.RDF.Annotation.Body.rest.entry.infl;
    const headWord = dataOut.RDF.Annotation.Body.rest.entry.dict.hdwd.$;
    const states = getInflectionStates(inflections);

    displayMorph(headWord, states);
};
const getInflectionStates = (inflectArr) => { // returns an array in which each element is itself an array of the dialect type and inflection pattern
    
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
};
const setHead = (head) => {
    console.log(head);
};
async function getDict () {
    const dictEntry = await fetch(`urn:cite2:hmt:lsj.chicago_md:n71450`, {mode: 'cors'});
    const entryOut = await dictEntry.json();
    console.log(entryOut);
};
const displayMorph = (headword, states) => {
    console.log(`Head-Word: ${headword}`);
    console.log(states);
};

// function parseURN() {
//     const parsed = Parser.parse('urn:cite2:hmt:lsj.chicago_md:n71450');
//     console.log(parsed);
// }
document.getElementById('luo').addEventListener('click', getMorph);


//https://crossorigin.me/