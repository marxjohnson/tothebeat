import { rooms } from './modules/rooms.js';
const messages = document.getElementById('messages');
const corridor = document.getElementById('corridor');
const player = document.getElementById('player');
let cells = document.querySelectorAll('.cell');
let nextRoom = 0;
const finalRoom = parseInt(Object.keys(rooms).pop());
const beat = new Event('beat');
const bpm = 120;
const threshold = 0.04 * (bpm / 60);
let beatNow = false;
let tooSoon = false;
let beatCounter = 0;
let hitCounter = 0;
let missCounter = 0;
let damageCounter = 0;
let complete = false;

function setMessage(message) {
    document.getElementById('messages').innerText = message;
}

function beatOn() {
    beatNow = true;
    tooSoon = false;
    document.body.setAttribute('class', 'beaton');
}
function beatOff() {
    beatNow = false;
    document.body.setAttribute('class', 'beatoff');
    window.setTimeout(() => {
        tooSoon = true;
    }, (1 / (bpm / 60) / 8) * 1000)
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
    if (rooms.hasOwnProperty(roomNumber)) {
        const contents = rooms[roomNumber].contents;
        cell.appendChild(contents.getDomElement());
    }
}

async function main() {
    window.removeEventListener('keydown', main);
    await Tone.start();
    console.log('Tone started');
    const sampler = new Tone.Sampler({
        urls: {
            A0: "drum-bass-hi-2.mp3",
            C0: "cymbal-hihat-stick.mp3",
            D0: "drum-snare-tap.mp3"
        },
        baseUrl: './samples/'
    }).toDestination();

    const drumSequence = new Tone.Sequence((time, note) => {
        if (note === 'C0' || note === 'D0') {
            window.dispatchEvent(beat);
        }
        sampler.triggerAttackRelease(note, "8n", time + threshold);
    }, ['A0', 'C0', 'A0', 'D0']).start(0);
    Tone.Transport.set({bpm: bpm});
    Tone.Transport.start();

    window.addEventListener('beat', () => {
        beatOn();
        beatCounter++
        setTimeout(beatOff, (1000 * threshold * 2));
        console.log('Beat!');
    });

    window.addEventListener('keydown', () => {
        if (complete) {
            setMessage("Reload the page to play again.");
            return;
        }
        if (beatNow) {
            console.log('Hit!');
            console.log(nextRoom);
            hitCounter++;
            setMessage('');
            moveForward().then(() => {
                // Did we hit something?
                if (document.querySelector('#corridor .cell:nth-child(3) .mob.safe')) {
                    const mob = document.querySelector('#corridor .cell:nth-child(3) .mob');
                    mob.parentElement.removeChild(mob);
                    console.log('Killed a mob!');
                    if (nextRoom > finalRoom + 8) {
                        complete = true;
                        Tone.Transport.stop();
                        const beats = beatCounter;
                        const hits = hitCounter;
                        const misses = missCounter;
                        const damage = damageCounter;
                        const accuracy = hits / (hits + misses);
                        const score = Math.round(((finalRoom * 4) - beats - damage) * accuracy);
                        setMessage("You won! Total beats: " + beats + ". "
                            + "Total hits: " + hits + ". "
                            + "Total misses: " + misses + ". "
                            + "Accuracy: " + (accuracy * 100).toPrecision(3) + "%. "
                            + "Damage taken: " + damage + ". "
                            + "Total score: " + score);
                    }
                }
                if (document.querySelector('#corridor .cell:nth-child(3) .mob.unsafe')) {
                    console.log('Hit by a mob!');
                    damageCounter++;
                    setMessage('Ouch!');
                    return moveBackward();
                }
            });
        } else {
            console.log('Miss!');
            missCounter++;
            if (tooSoon) {
                setMessage('Too soon!');
            } else {
                setMessage('Too late!');
            }
        }
    });
    setMessage('Move to the beat!');
}

cells.forEach((cell) => {
    setCellContents(cell, nextRoom);
    nextRoom++;
});

setMessage("Press any key to start");
window.addEventListener('keydown', main);