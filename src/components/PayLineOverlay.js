export class PaylineOverlay {
    constructor(app, config) {
        this.app = app;
        this.config = config;
        this.container = new PIXI.Container();
        this.lines = [];  // stores all the line graphics
        this.visible = false;
    }

    drawPaylines(paylines, machineContainer, reelContainer) {
        // clear old lines first
        this.clear();

        const colors = this.config.paylineColors;
        
        // calculate where the reels are positioned
        const baseX = machineContainer.x + reelContainer.x;
        const baseY = machineContainer.y + reelContainer.y;
        const symbolHeight = this.config.symbolSize + this.config.symbolPadding;
        const symbolWidth = this.config.symbolSize + this.config.symbolPadding;

        // only show first 10 lines (too many would be messy)
        const linesToShow = Math.min(paylines.length, 10);
        
        paylines.slice(0, linesToShow).forEach((payline, index) => {
            const graphics = new PIXI.Graphics();
            const color = colors[index % colors.length];  // cycle through colors
            
            graphics.lineStyle(3, color, 0.8);  // line thickness and opacity
            
            // draw line through the payline positions
            for (let reel = 0; reel < payline.length; reel++) {
                const row = payline[reel];
                // calculate center position of symbol
                const x = baseX + reel * symbolWidth + this.config.symbolSize / 2;
                const y = baseY + row * symbolHeight + this.config.symbolSize / 2;
                
                if (reel === 0) {
                    graphics.moveTo(x, y);  // start point
                } else {
                    graphics.lineTo(x, y);  // draw line to next point
                }
            }
            
            graphics.endFill();
            this.lines.push(graphics);
            this.container.addChild(graphics);
        });

        // text showing how many lines are active
        const text = new PIXI.Text(`${paylines.length} LINES ACTIVE`, {
            fontSize: 24,
            fill: 0xffd700,
            fontWeight: 'bold',
            stroke: 0x000000,
            strokeThickness: 4
        });
        text.anchor.set(0.5);
        text.x = this.config.width / 2;
        text.y = 30;
        this.container.addChild(text);
        this.textIndicator = text;
    }

    show() {
        this.visible = true;
        this.container.visible = true;
    }

    hide() {
        this.visible = false;
        this.container.visible = false;
    }

    toggle() {
        // switch between show and hide
        if (this.visible) {
            this.hide();
        } else {
            this.show();
        }
    }

    clear() {
        // remove all lines
        this.lines.forEach(line => {
            this.container.removeChild(line);
            line.destroy();
        });
        this.lines = [];
        
        // remove text if it exists
        if (this.textIndicator) {
            this.container.removeChild(this.textIndicator);
            this.textIndicator.destroy();
            this.textIndicator = null;
        }
    }

    getContainer() {
        return this.container;
    }
}