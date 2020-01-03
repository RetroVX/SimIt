import SimIt from "./src/SimIt.js";

window.addEventListener('keydown', function(e){
  console.log(e);
})
window.addEventListener('click', function(e){
    console.log(e);
})

// add touchEvents

const input = document.querySelector('input');
input.addEventListener('keydown', (e) => {
    console.log(e);
    input.value += e.key;
});

const simit = new SimIt();
console.log(simit);
simAll();


function hi() {
    return new Promise(resolve => {
        setTimeout(() =>{
            resolve(console.log('async func complete'));
        }, 1500);
    });
}

function simAll() {
    simit.setElement(input).all([
        {keydown: 'h'},
        {sleep: 1000},
        {callback: hi},
        {repeat: { event: {keydown: 'y'}, amount: 10, delay: 500}},
        {keydown: 'i'},
        {sleep: 500},
        {click: { x: 100, y: 250 }},
    ], onStart, onComplete);
}

function onStart(seq) {
    console.log('started' + JSON.stringify(seq));
}

function onComplete(seq) {
    console.log('ended' + JSON.stringify(seq));
}
//simit.repeat({ click: { x: 150, y: 250 } }, 10, 500);
//simit.repeat({callback: hi}, 5);
