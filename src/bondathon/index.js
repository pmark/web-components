class BondLoadingAnimation extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: "open" });
        
        const style = document.createElement("style");
        shadow.appendChild(style);
        
        this._container = shadow;
        this._previousTimestamp = 0;
        this._mover = null;
        this._boxWidth = 0;
        this._t = 0.0;
        this._lastFaderAt = 0;
        this._requiredElapsed = 1000 / 30;
        this._dotFrequencyMillis = 700;
        this._moverSpeedPixelsPerSec = 200;
    }
    
    updateStyle(elem) {
        this._dotFrequencyMillis = parseInt(elem.getAttribute("dotFrequencyMillis") || 700, 10);
        this._moverSpeedPixelsPerSec = parseInt(elem.getAttribute("moverSpeedPixelsPerSec") || 200, 10);
        const width = elem.getAttribute("boxWidth") || '100%';
        const moverHeightInPixels = parseInt(elem.getAttribute("moverHeightInPixels") || 50, 10);
        this._moverWidth = moverHeightInPixels;
        const circleWidth = `${moverHeightInPixels}px`;
        const circleColor = elem.getAttribute("color") || 'white';
        
        const shadow = elem.shadowRoot;
        shadow.querySelector("style").textContent = /*css*/`
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
        
        @keyframes bla-bond {
            2% {
                opacity: 1;
            }
            85% {
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
        
        this.observeResize();
    }
    
    resize(w) {
        this._boxWidth = w || this.getBoundingClientRect().width;
    }
    
    observeResize() {
        const ro = new ResizeObserver(entries => {
            const first = entries[0];
            if (first) {
                const cr = first.contentRect;
                this.resize(cr.width);
            }
        });
        ro.observe(this);
    }
    
    connectedCallback() {
        this.updateStyle(this);
        this.createMover();
        this.animate();
    }
    
    createMover() {
        const extant = this._mover;
        if (extant) {
            extant.remove();
        }
        
        const div = document.createElement("div");
        div.id = "mover";
        div.className = "circle";
        this._container.appendChild(div);
        this._mover = div;
    }
    
    animate() {
        window.requestAnimationFrame(this.step.bind(this));
    }
    
    step(timestamp) {
        this.animate();
        
        const mover = this._mover;
        const elapsed = timestamp - this._previousTimestamp;
        
        if (elapsed > this._requiredElapsed) {
            this._previousTimestamp = timestamp;
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
            
            if (timeSinceLastFader > this._dotFrequencyMillis && shouldCreateFader) {
                this._lastFaderAt = timestamp;
                this.createFaderAt(t);
            }
        }
    }
    
    createFaderAt(t) {
        const div = document.createElement("div");
        div.className = "circle fader";
        const xPos = t * this._boxWidth;
        div.style.transform = `translateX(${xPos}px)`;
        this._container.appendChild(div);
    }
}

window.customElements.define("bond-loading-animation", BondLoadingAnimation);
