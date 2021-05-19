class roomContents {
    constructor(room) {
        this.room = room;
    }
}

class stairsUp extends roomContents {

}

class stairsDown extends roomContents {

}

class mob extends roomContents {
    SAFE = 'mobsafe';
    UNSAFE = 'mobunsafe';
    domElement = null;
    state = this.SAFE;
    counter = 0;
    pattern = [];

    constructor() {
        super();
        this.constructDomElement();
        window.addEventListener('beat', () => {
            this.advanceState();
        });
    }

    constructDomElement() {
        // Stub. Override in children.
    }

    getDomElement() {
        return this.domElement;
    }

    advanceState() {
        const previousState = this.state;
        this.state = this.pattern[this.counter];
        if (!this.domElement.classList.contains(this.state)) {
            this.domElement.classList.remove(previousState);
            this.domElement.classList.add(this.state);
        }
        this.counter++;
        if (this.counter >= this.pattern.length) {
            this.counter = 0;
        }
    }
}

export class blueBlob extends mob {
    pattern = [this.UNSAFE];

    constructDomElement() {
        this.domElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        this.domElement.setAttribute('class', 'blueblob');
        this.domElement.setAttribute('r', 20);
        this.domElement.setAttribute('cx', 50);
        this.domElement.setAttribute('cy', 80);
    }
}

export class yellowBlob extends mob {
    pattern = [this.SAFE, this.SAFE, this.SAFE, this.UNSAFE];

    constructDomElement() {
        this.domElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        this.domElement.setAttribute('class', 'yellowblob');
        this.domElement.setAttribute('r', 20);
        this.domElement.setAttribute('cx', 50);
        this.domElement.setAttribute('cy', 80);
    }
}

export class purpleBlob extends mob {
    pattern = [this.SAFE, this.UNSAFE, this.UNSAFE, this.UNSAFE];

    constructDomElement() {
        this.domElement = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        this.domElement.setAttribute('class', 'purpleblob');
        this.domElement.setAttribute('r', 20);
        this.domElement.setAttribute('cx', 50);
        this.domElement.setAttribute('cy', 80);
    }
}
