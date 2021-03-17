
async function getLatin (lemma) {
    const latinData = await fetch(`http://services.perseids.org/bsp/morphologyservice/analysis/word?lang=lat&engine=morpheuslat&word=${lemma}`)
    const dataOut = await latinData.json();
    console.log(dataOut);
}

async function getDef (lemma) {
    const latinDef = await fetch (`https://en.wiktionary.org/api/rest_v1/page/definition/${lemma}?redirect=true#Latin`);
    const defOut = await latinDef.json();
    const defOut_Latin = defOut.la[0];

    let defHTML = defOut_Latin.definitions[0].definition;

    document.getElementById('latin').innerHTML = defHTML;
    let titles = document.querySelectorAll('#latin a');
    let sumDef = `${titles[0].textContent}`;
    for(let i = 1; i < titles.length; i++){
        sumDef = sumDef + `, ${titles[i].textContent}`;
    }
    console.log(sumDef);
    return sumDef;
}


export {  getLatin, getDef  }