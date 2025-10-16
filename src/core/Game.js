import { CONFIG } from '../utils/Config.js';
import { Reel } from '../components/Reel.js';
import { WinPresentation } from '../components/WinPresentation.js';
import { PaylineOverlay } from '../components/PaylineOverlay.js';
import { WeightedRandom, WinCalculator } from '../math/GameMath.js';
import { AnimationManager } from '../managers/AnimationManager.js';
import { AudioManager } from '../managers/AudioManager.js';

export class Game {
    constructor() {
        // get settings from config
        this.config = CONFIG;
        
        // game state stuff
        this.balance = this.config.startingBalance;
        this.lines = this.config.defaultLines;
        this.betPerLine = this.config.betPerLine;
        this.lastWin = 0;
        this.spinning = false;  // checks if reels are spinning
        this.results = [];  // stores what symbols landed
        
        // create all the game objects
        this.reels = [];
        this.winPresentation = null;
        this.paylineOverlay = null;
        this.animationManager = new AnimationManager();
        this.audioManager = new AudioManager();
        
        this.initialize();
    }

    initialize() {
        console.log('🎰 Starting game...');
        this.createApp();
        this.buildScene();
        this.updateUI();
        this.startGameLoop();
        console.log('✅ Game ready');
    }

    createApp() {
        // create the pixi application
        this.app = new PIXI.Application({
            width: this.config.width,
            height: this.config.height,
            backgroundColor: 0x0a0a1a,
            antialias: true,
            autoDensity: true
        });

        // add canvas to the page
        document.getElementById('game-root').appendChild(this.app.view);
    }

    buildScene() {
        // background
        this.background = new PIXI.Graphics();
        this.background.beginFill(0x1a1a2a);
        this.background.drawRect(0, 0, this.config.width, this.config.height);
        this.background.endFill();
        this.app.stage.addChild(this.background);

        // container for the whole slot machine
        this.machineContainer = new PIXI.Container();
        this.app.stage.addChild(this.machineContainer);

        // frame around the reels
        this.frame = new PIXI.Graphics();
        this.machineContainer.addChild(this.frame);

        // container just for reels
        this.reelContainer = new PIXI.Container();
        this.machineContainer.addChild(this.reelContainer);

        // make 5 reels
        for (let i = 0; i < this.config.reels; i++) {
            const x = i * (this.config.symbolSize + this.config.symbolPadding);
            const reel = new Reel(i, x, this.config);
            this.reels.push(reel);
            this.reelContainer.addChild(reel.container);
        }

        // mask to hide symbols outside the visible area
        this.mask = new PIXI.Graphics();
        this.machineContainer.addChild(this.mask);
        this.reelContainer.mask = this.mask;

        // for showing win effects
        this.winPresentation = new WinPresentation(this.app);

        // for showing the paylines
        this.paylineOverlay = new PaylineOverlay(this.app, this.config);
        this.app.stage.addChild(this.paylineOverlay.getContainer());
        this.paylineOverlay.hide();

        this.resizeLayout();
    }

    resizeLayout() {
        // calculate sizes
        const reelsWidth = this.config.reels * (this.config.symbolSize + this.config.symbolPadding) - this.config.symbolPadding;
        const reelsHeight = this.config.rows * (this.config.symbolSize + this.config.symbolPadding) - this.config.symbolPadding;
        
        const frameWidth = reelsWidth + 100;
        const frameHeight = reelsHeight + 100;

        // draw the frame
        this.frame.clear();
        this.frame.beginFill(0x0a0a0a, 0.9);
        this.frame.lineStyle(4, 0xffd700, 0.3);
        this.frame.drawRoundedRect(0, 0, frameWidth, frameHeight, 30);
        this.frame.endFill();

        // draw mask (hides stuff outside)
        this.mask.clear();
        this.mask.beginFill(0xffffff);
        this.mask.drawRoundedRect(50, 50, reelsWidth, reelsHeight, 16);
        this.mask.endFill();

        // position stuff
        this.reelContainer.x = 50;
        this.reelContainer.y = 50;

        // center the machine on screen
        this.machineContainer.x = (this.config.width - frameWidth) / 2;
        this.machineContainer.y = (this.config.height - frameHeight) / 2 - 30;
    }

    getTotalBet() {
        // multiply lines by bet per line
        return Math.round(this.lines * this.betPerLine * 100) / 100;
    }

    spin() {
        if (!this.spinning) {
            const totalBet = this.getTotalBet();
            
            // check if player has enough money
            if (this.balance < totalBet) {
                alert('Not enough balance!');
                return;
            }

            // start spinning
            this.spinning = true;
            document.getElementById('spin-btn').classList.add('spinning');
            document.getElementById('spin-btn').textContent = 'STOP';

            // take money for the bet
            this.balance -= totalBet;
            this.lastWin = 0;
            this.updateUI();

            // hide paylines while spinning
            this.paylineOverlay.hide();

            // clear old highlights
            this.reels.forEach(reel => reel.highlightSymbols([]));

            // generate what symbols will land (random)
            const generator = new WeightedRandom(this.config.symbols, this.config.symbolWeights);
            this.results = [];

            for (let i = 0; i < this.config.reels; i++) {
                const reelSymbols = [];
                for (let r = 0; r < this.config.rows; r++) {
                    reelSymbols.push(generator.pick());
                }
                this.results.push(reelSymbols);
            }

            // tell each reel to start spinning with target symbols
            this.reels.forEach((reel, index) => {
                reel.startSpin(this.results[index]);
            });
        } else {
            // stop button pressed - stop reels immediately
            this.reels.forEach(reel => reel.stopImmediately());
        }
    }

    update() {
        // update all reels every frame
        this.reels.forEach(reel => reel.update());
        
        // update win particles
        if (this.winPresentation) {
            this.winPresentation.update();
        }
        
        // update animations
        if (this.animationManager) {
            this.animationManager.update();
        }

        // check if all reels stopped
        if (this.spinning && this.reels.every(reel => !reel.spinning)) {
            this.finishSpin();
        }
    }

    finishSpin() {
        // reels stopped, change button back
        this.spinning = false;
        document.getElementById('spin-btn').classList.remove('spinning');
        document.getElementById('spin-btn').textContent = 'SPIN';
        
        // check if we won anything
        this.checkWins();
    }

    checkWins() {
        if (!this.results || this.results.length === 0) {
            console.error('No results!');
            return;
        }

        // get the paylines we're checking
        const paylines = this.config.paylines[this.lines];
        
        // check each payline for wins
        const winResult = WinCalculator.calculatePaylineWins(
            this.results, 
            paylines, 
            this.config.payouts, 
            this.betPerLine
        );
        
        if (winResult.totalWin > 0) {
            // we won! add money and show effects
            this.lastWin = winResult.totalWin;
            this.balance += winResult.totalWin;
            this.updateUI();
            this.celebrateWin(winResult.winningLines);
            this.winPresentation.showWinMessage(winResult.totalWin);
        } else {
            // no win
            this.updateUI();
        }
    }

    celebrateWin(winningLines) {
        // highlight winning symbols
        winningLines.forEach(({ payline, count }) => {
            for (let reelIdx = 0; reelIdx < count; reelIdx++) {
                const row = payline[reelIdx];
                this.reels[reelIdx].highlightSymbols([row]);
            }
        });

        // create particles at winning positions
        const baseX = this.machineContainer.x + this.reelContainer.x;
        const baseY = this.machineContainer.y + this.reelContainer.y;

        winningLines.forEach(({ payline, count }, idx) => {
            for (let reelIdx = 0; reelIdx < count; reelIdx++) {
                const row = payline[reelIdx];
                const x = baseX + reelIdx * (this.config.symbolSize + this.config.symbolPadding) + this.config.symbolSize / 2;
                const y = baseY + row * (this.config.symbolSize + this.config.symbolPadding) + this.config.symbolSize / 2;
                
                // delay particles so they dont all spawn at once
                setTimeout(() => this.winPresentation.createWinExplosion(x, y), idx * 100);
            }
        });
    }

    updateUI() {
        // update the UI numbers
        document.getElementById('balance').textContent = this.balance.toFixed(2);
        document.getElementById('lines').textContent = this.lines;
        document.getElementById('bet-per-line').textContent = this.betPerLine.toFixed(2);
        document.getElementById('total-bet').textContent = this.getTotalBet().toFixed(2);
        document.getElementById('last-win').textContent = this.lastWin.toFixed(2);
    }

    changeLines(direction) {
        if (this.spinning) return;
        
        // find current line option
        const currentIndex = this.config.lineOptions.indexOf(this.lines);
        let newIndex = currentIndex + direction;
        
        // wrap around if we go past the end
        if (newIndex < 0) newIndex = this.config.lineOptions.length - 1;
        if (newIndex >= this.config.lineOptions.length) newIndex = 0;
        
        this.lines = this.config.lineOptions[newIndex];
        this.updateUI();
        
        // update payline overlay if its visible
        if (this.paylineOverlay.visible) {
            const paylines = this.config.paylines[this.lines];
            this.paylineOverlay.drawPaylines(paylines, this.machineContainer, this.reelContainer);
        }
    }

    changeBetPerLine(amount) {
        if (this.spinning) return;
        
        const newBet = Math.round((this.betPerLine + amount) * 100) / 100;
        
        // make sure bet is in valid range
        if (newBet >= this.config.minBetPerLine && newBet <= this.config.maxBetPerLine) {
            this.betPerLine = newBet;
            this.updateUI();
        }
    }

    togglePaylineOverlay() {
        // show or hide paylines
        const paylines = this.config.paylines[this.lines];
        this.paylineOverlay.drawPaylines(paylines, this.machineContainer, this.reelContainer);
        this.paylineOverlay.toggle();
    }

    startGameLoop() {
        // runs update() every frame (60 times per second)
        this.app.ticker.add(() => this.update());
    }
}