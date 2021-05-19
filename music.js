const AbMajorScale = ['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G']

const addOctaveNumbers = (scale, octaveNumber) => scale.map(note => {
    const firstOctaveNoteIndex = scale.indexOf('C') !== -1 ? scale.indexOf('C') : scale.indexOf('C#')
    const noteOctaveNumber = scale.indexOf(note) < firstOctaveNoteIndex ? octaveNumber - 1 : octaveNumber;
    return `${note}${noteOctaveNumber}`
});

const AbMajorScaleWithOctave = addOctaveNumbers(AbMajorScale, 4)

document.getElementById("play-button").addEventListener("click", async function() {
    await Tone.start();
    const synth = new Tone.PolySynth(Tone.Synth, {
        oscillator : {
            type : "sine"
        }
    }).toDestination();
    AbMajorScaleWithOctave.forEach((note, index) => {
        synth.triggerAttackRelease(note, '4n', index + 1)
    });
    if (Tone.Transport.state !== 'started') {
        Tone.Transport.start();
    } else {
        Tone.Transport.stop();
    }
});