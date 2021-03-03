const messages = document.getElementById('messages');
const stage = document.getElementById('stage');
const corridor = document.getElementById('corridor');
const player = document.getElementById('player');
messages.innerText = "Press any key to start";
const beat = new Event('beat');
const bpm = 60;
const threshold = (bpm / 60) * 0.1;
let beatNow = false;

function beatOn() {
    beatNow = true;
    document.getElementById('beatindicator').setAttribute('class', 'beaton');
}
function beatOff() {
    beatNow = false;
    document.getElementById('beatindicator').setAttribute('class', 'beatoff');
}

function jumpOn() {
    player.setAttribute('class', 'jumping');
}

function jumpOff() {
    player.setAttribute('class', 'idle');
    player.removeEventListener('animationend', jumpOff);
}

async function main() {
    window.removeEventListener('keypress', main);
    await Tone.start();
    console.log('Tone started');
    const synth = new Tone.Synth().toDestination();

    const loopA = new Tone.Loop(time => {
        synth.triggerAttackRelease("C2", "8n", time + threshold);
        window.dispatchEvent(beat);
    }, "4n").start(0);
    Tone.Transport.set({bpm: 60});
    Tone.Transport.start();

    window.addEventListener('beat', () => {
        beatOn();
        setTimeout(beatOff, (1000 * threshold * 2));
        console.log('Beat!');
    });

    window.addEventListener('keydown', () => {
        if (beatNow) {
            let firstCell, newCell;
            console.log('Hit!');
            jumpOn();
            player.addEventListener('animationend', jumpOff);
            firstCell = document.querySelector('#corridor .cell:first-child');
            newCell = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            newCell.classList.add('cell');
            corridor.appendChild(newCell);
            corridor.removeChild(firstCell);
        } else {
            console.log('Miss!');
        }
    });
}

const startListener = window.addEventListener('keypress', main);