function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;
  
    // If you don't care about the order of the elements inside
    // the array, you should sort both arrays here.
    // Please note that calling sort on an array will modify that array.
    // you might want to clone your array first.
  
    for (var i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

async function getXML () {
    let x = new XMLHttpRequest();
    x.open("GET", "http://www.perseus.tufts.edu/hopper/xmlchunk?doc=Perseus%3Atext%3A1999.04.0060%3Aentry%3Dfrequenter", true);
    x.onreadystatechange = function () {
        if (x.readyState == 4 && x.status == 200) {
            let doc = x.responseXML;
            console.log(doc);
            let nodeList = doc.getElementsByTagName('text');
            console.log(nodeList[0].innerHTML);
            document.getElementById('xml').innerHTML = nodeList[0].innerHTML;
        }
    };
x.send(null);
} 
  
  export { arraysEqual, getXML }