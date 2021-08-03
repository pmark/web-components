class BondLoadingAnimation extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: "open" });
        
        // const div = document.createElement("div");
        const style = document.createElement("style");
        shadow.appendChild(style);
        // shadow.appendChild(div);
        
        this._container = shadow;
        this._previousTimestamp = 0;
        this._mover = null;
        this._boxWidth = 0;
        this._t = 0.0;
        this._lastFaderAt = 0;
        this._moverSpeedPixelsPerSec = 100;
        this._requiredElapsed = 1000 / 30;
        this._millisBetweenFaders = 750;
    }
    
    updateStyle(elem) {
        const width = elem.getAttribute("width");
        const heightInPixels = elem.getAttribute("heightInPixels");
        const circleWidth = `${heightInPixels}px`;
        const circleColor = elem.getAttribute("color");
        
        const shadow = elem.shadowRoot;
        shadow.querySelector("style").textContent = `
        :host {
            width: ${width};
            height: ${circleWidth};
            background-color: transparent;
            overflow: hidden;
            position: relative;
        }
        
        .circle {
            width: ${circleWidth};
            height: ${circleWidth};
            border-radius: 50%;
            background-color: ${circleColor};
            position: absolute;
        }
        
        #mover {
        }
        
        @keyframes bla-bond {
            2% {
                opacity: 1;
            }
            90% {
                opacity: 1;
            }
            100% {
                opacity: 0;
            }
        }
        
        .fader {
            opacity: 0.25;
            animation: bla-bond 0.75s linear forwards;
        }
        `;
        
        const bbox = this.getBoundingClientRect();
        this._boxWidth = bbox.width;
        this._moverWidth = heightInPixels;
    }
    
    connectedCallback() {
        this.updateStyle(this);
        this.createMover();
        this.animate();
    }
    
    createMover() {
        const extant = this.mover;
        if (extant) {
            extant.remove();
        }
        
        const div = document.createElement("div");
        div.id = "mover";
        div.className = "circle";
        this.container.appendChild(div);
        this.mover = div;
    }
    
    get mover() {
        return this._mover;
    }
    
    set mover(m) {
        this._mover = m;
    }
    
    get container() {
        return this._container;
    }
    
    set container(c) {
        this._container = c;
    }
    
    get startTime() {
        return this._startTime;
    }
    
    set startTime(n) {
        this._startTime = n;
    }
    
    get previousTimestamp() {
        return this._previousTimestamp;
    }
    
    set previousTimestamp(n) {
        this._previousTimestamp = n;
    }
    
    animate() {
        window.requestAnimationFrame(this.step.bind(this));
    }
    
    step(timestamp) {
        this.animate();
        
        const mover = this.mover;
        const elapsed = timestamp - this.previousTimestamp;
        
        if (elapsed > this._requiredElapsed) {
            this.previousTimestamp = timestamp;
            const tw = this._moverWidth / this._boxWidth;
            
            const moverSpeed = this._moverSpeedPixelsPerSec / this._boxWidth;
            let t = this._t;
            t += moverSpeed * (elapsed / 1000.0);
            
            if (t > 1.0) {
                t = -tw;
            }
            
            const xPos = t * this._boxWidth;
            mover.style.transform = `translateX(${xPos}px)`;
            this._t = t;
            
            const timeSinceLastFader = timestamp - this._lastFaderAt;
            const twp = tw * 1.0;
            const shouldCreateFader = (t > twp) & (t < 1.0 - twp);
            
            // const fp = (t - tw * 1.5) * 100;
            // const shouldCreateFader = parseInt(fp, 10) % 20 === 0;
            
            if (timeSinceLastFader > this._millisBetweenFaders && shouldCreateFader) {
                this._lastFaderAt = timestamp;
                this.createFaderAt(t);
            }
        }
    }
    
    createFaderAt(t) {
        console.log("fader at", t);
        const div = document.createElement("div");
        div.className = "circle fader";
        const xPos = t * this._boxWidth;
        div.style.transform = `translateX(${xPos}px)`;
        this.container.appendChild(div);
    }
}

window.customElements.define("bond-loading-animation", BondLoadingAnimation);
