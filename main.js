import { rooms } from './modules/rooms.js';
const messages = document.getElementById('messages');
const corridor = document.getElementById('corridor');
const player = document.getElementById('player');
let cells = document.querySelectorAll('.cell');
let nextRoom = 0;
messages.innerText = "Press any key to start";
const beat = new Event('beat');
const bpm = 126;
const threshold = 0.02 * (bpm / 60);
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

function jumpOff(resolve) {
    player.setAttribute('class', 'idle');
    player.removeEventListener('animationend', jumpOff);
    setTimeout(resolve, 0);
}

function moveForward() {
    return new Promise((resolve) => {
        player.addEventListener('animationend', () => {
            jumpOff(resolve)
        });
        jumpOn();
        player.addEventListener('animationend', () => {jumpOff(resolve)});
        const firstCell = document.querySelector('#corridor .cell:first-child');
        const newCell = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        newCell.classList.add('cell');
        newCell.classList.add('end');
        setCellContents(newCell, nextRoom);
        nextRoom++;
        corridor.appendChild(newCell);
        newCell.classList.remove('end');
        corridor.removeChild(firstCell);
    });
}

function moveBackward() {
    return new Promise((resolve) => {
        player.addEventListener('animationend', () => {
            jumpOff(resolve)
        });
        jumpOn();
        player.addEventListener('animationend', () => {jumpOff(resolve)});
        const lastCell = document.querySelector('#corridor .cell:last-child');
        const prevRoom = document.querySelector('#corridor .cell:first-child').dataset.room - 1;
        const newCell = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        newCell.classList.add('cell');
        setCellContents(newCell, prevRoom);
        nextRoom--;
        corridor.prepend(newCell);
        lastCell.classList.add('end');
        corridor.removeChild(lastCell);
    });
}

function setCellContents(cell, roomNumber) {
    const wall = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    wall.classList.add('wall');
    cell.dataset.room = roomNumber;
    cell.appendChild(wall);
    const contents = rooms[roomNumber].contents;
    if (contents !== null) {
        cell.appendChild(contents.getDomElement());
    }
}

async function main() {
    window.removeEventListener('keypress', main);
    await Tone.start();
    console.log('Tone started');
    const synth = new Tone.Synth().toDestination();

    const loopA = new Tone.Loop(time => {
        synth.triggerAttackRelease("C4", "8n", time + threshold);
        window.dispatchEvent(beat);
    }, "4n").start(0);
    Tone.Transport.set({bpm: bpm});
    Tone.Transport.start();

    window.addEventListener('beat', () => {
        beatOn();
        setTimeout(beatOff, (1000 * threshold * 2));
        console.log('Beat!');
    });

    window.addEventListener('keydown', () => {
        if (beatNow || true) {
            console.log('Hit!');
            moveForward().then(() => {
                // Did we hit something?
                if (document.querySelector('#corridor .cell:nth-child(3) .mob.safe')) {
                    const mob = document.querySelector('#corridor .cell:nth-child(3) .mob');
                    mob.parentElement.removeChild(mob);
                    console.log('Killed a mob!');
                }
                if (document.querySelector('#corridor .cell:nth-child(3) .mob.unsafe')) {
                    console.log('Hit by a mob!');
                    return moveBackward();
                }
            })
        } else {
            console.log('Miss!');
        }
    });
}

cells.forEach((cell) => {
    setCellContents(cell, nextRoom);
    nextRoom++;
});

window.addEventListener('keypress', main);