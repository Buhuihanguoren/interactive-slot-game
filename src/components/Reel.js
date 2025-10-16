import { Symbol } from './Symbol.js';
import { WeightedRandom } from '../math/GameMath.js';

export class Reel {
    constructor(index, x, config) {
        this.index = index;  // which reel is this (0-4)
        this.config = config;
        this.container = new PIXI.Container();
        this.container.x = x;  // horizontal position
        
        this.symbols = [];  // all symbol objects for this reel
        this.spinning = false;
        this.stopping = false;
        this.symbolGenerator = new WeightedRandom(config.symbols, config.symbolWeights);
        this.targetSymbols = [];  // what symbols should land after spin
        this.targetsLoaded = false;
        
        // each reel spins at slightly different speed
        this.spinSpeed = 25 + index * 6;
        this.currentSpeed = this.spinSpeed;
        this.spinStartTime = 0;
        this.slowdownStartTime = 0;
        
        this.createStrip();
    }

    createStrip() {
        // create more symbols than visible for buffer
        const total = this.config.rows + 8;
        
        for (let i = 0; i < total; i++) {
            const value = this.symbolGenerator.pick();
            const symbol = new Symbol(
                value,
                0,
                i * (this.config.symbolSize + this.config.symbolPadding),
                this.config
            );
            this.symbols.push(symbol);
            this.container.addChild(symbol.container);
        }
    }

    startSpin(targetSymbols) {
        // called when spin button pressed
        this.spinning = true;
        this.stopping = false;
        this.targetSymbols = targetSymbols;  // save what we should land on
        this.targetsLoaded = false;
        this.currentSpeed = this.spinSpeed;
        this.spinStartTime = Date.now();
        this.slowdownStartTime = 0;
    }

    stopImmediately() {
        // when user presses stop button
        this.stopping = true;
        this.slowdownStartTime = Date.now();
    }

    update() {
        if (!this.spinning) return;  // dont do anything if not spinning

        const elapsed = Date.now() - this.spinStartTime;
        const totalHeight = this.symbols.length * (this.config.symbolSize + this.config.symbolPadding);

        // move all symbols down
        this.symbols.forEach(symbol => {
            symbol.container.y += this.currentSpeed;
        });

        // timing stuff - later reels load earlier
        const slowdownStartTime = this.config.spinDuration + this.index * 200;
        const loadPercent = 0.4 - (this.index * 0.02);
        const loadTargetsAt = slowdownStartTime * loadPercent;

        // wrap symbols when they go off bottom
        this.symbols.forEach((symbol, idx) => {
            if (symbol.container.y >= totalHeight) {
                // teleport to top (creates infinite scroll)
                symbol.container.y -= totalHeight;
                
                // update symbol value if are loaded
                if (this.targetsLoaded && idx < this.config.rows) {
                    symbol.setValue(this.targetSymbols[idx]);
                } else if (!this.targetsLoaded && elapsed < loadTargetsAt) {
                    // still spinning random symbols
                    symbol.setValue(this.symbolGenerator.pick());
                }
            }
        });

        // load target symbols early for smooth stop
        if (!this.targetsLoaded && elapsed >= loadTargetsAt) {
            this.loadTargetSymbolsSmooth();
            this.targetsLoaded = true;
        }

        // start slowing down
        if (this.stopping || elapsed > slowdownStartTime) {
            if (!this.stopping) {
                this.stopping = true;
                this.slowdownStartTime = Date.now();
                
                // make sure targets are loaded
                if (!this.targetsLoaded) {
                    this.loadTargetSymbolsSmooth();
                    this.targetsLoaded = true;
                }
            }

            const slowdownElapsed = Date.now() - this.slowdownStartTime;
            const slowdownProgress = Math.min(slowdownElapsed / 1000, 1);
            
            // easing function makes it slow down smoothly
            const easeOutQuart = 1 - Math.pow(1 - slowdownProgress, 4);
            this.currentSpeed = this.spinSpeed * (1 - easeOutQuart);

            // stop when speed is almost 0
            if (this.currentSpeed < 0.3) {
                this.finalizeStop();
            }
        }
    }

    loadTargetSymbolsSmooth() {
        // set all symbols (including buffer) to cycle through targets
        // this prevents symbols from "changing" while visible
        for (let i = 0; i < this.symbols.length; i++) {
            if (i < this.config.rows) {
                // visible symbols
                this.symbols[i].setValue(this.targetSymbols[i]);
            } else {
                // buffer symbols - cycle through targets
                const targetIndex = i % this.config.rows;
                this.symbols[i].setValue(this.targetSymbols[targetIndex]);
            }
        }
    }

    finalizeStop() {
        // snap symbols to exact positions with correct values
        for (let row = 0; row < this.config.rows; row++) {
            const symbol = this.symbols[row];
            symbol.setValue(this.targetSymbols[row]);
            symbol.container.y = row * (this.config.symbolSize + this.config.symbolPadding);
        }

        // reset all positions to grid
        for (let i = 0; i < this.symbols.length; i++) {
            this.symbols[i].container.y = i * (this.config.symbolSize + this.config.symbolPadding);
        }

        this.spinning = false;
        this.stopping = false;
        this.bounce();  // small bounce effect when stopping
    }

    bounce() {
        // makes reel bounce slightly when it stops
        const originalY = this.container.y;
        let offset = 0;
        let speed = 3;
        let direction = 1;
        let bounces = 0;

        const animateBounce = () => {
            offset += speed * direction;
            this.container.y = originalY + offset;

            if (Math.abs(offset) > 15) {
                direction *= -1;  // reverse direction
                speed *= 0.65;    // reduce speed
                bounces++;
            }

            if (bounces < 3) {
                requestAnimationFrame(animateBounce);
            } else {
                this.container.y = originalY;  // back to original
            }
        };

        animateBounce();
    }

    getVisibleSymbols() {
        // returns array of visible symbol values
        return this.symbols.slice(0, this.config.rows).map(symbol => symbol.value);
    }

    highlightSymbols(rowIndices) {
        // highlight symbols at specific rows (for wins)
        this.symbols.forEach((symbol, index) => {
            if (index < this.config.rows) {
                symbol.highlight(rowIndices.includes(index));
            }
        });
    }
}