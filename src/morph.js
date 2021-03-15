async function getMorph (lemma) { // fetches the given greek string from the morphology service
    const greekData = await fetch(`http://services.perseids.org/bsp/morphologyservice/analysis/word?lang=grc&engine=morpheusgrc&word=${lemma}`, {mode: 'cors'});
    const dataOut = await greekData.json();
    
    const inflections = dataOut.RDF.Annotation.Body.rest.entry.infl;
    const headWord = dataOut.RDF.Annotation.Body.rest.entry.dict.hdwd.$;
    const inflect = getInflectionStates(inflections);
    const dict = await getDict(headWord);
    return [headWord, inflect, dict];
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
async function getDict (lemma) {
    const dictEntry = await fetch(`https://en.wiktionary.org/api/rest_v1/page/definition/${lemma}`, {mode: 'cors'});
    const entryOut = await dictEntry.json();

    let def = entryOut.other[0].definitions[0].definition;
    
    document.getElementById('search').innerHTML = def;

    let titles = document.querySelectorAll('a');
    let sumDef = `${titles[0].textContent}`;
    for(let i = 1; i < titles.length; i++){
        sumDef = sumDef + `, ${titles[i].textContent}`;
    }
    return sumDef;
};

export {  getMorph  };