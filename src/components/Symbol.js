export class Symbol {
    constructor(value, x, y, config) {
        this.value = value;  // the emoji or symbol character
        this.config = config;
        
        // container holds all the graphics
        this.container = new PIXI.Container();
        this.container.x = x;
        this.container.y = y;

        // dark background rectangle
        this.bg = new PIXI.Graphics();
        this.bg.beginFill(0x1a1a1a);
        this.bg.drawRoundedRect(0, 0, config.symbolSize, config.symbolSize, 12);
        this.bg.endFill();
        this.container.addChild(this.bg);

        // glow effect for when symbol wins
        this.glow = new PIXI.Graphics();
        this.glow.beginFill(0xffd700, 0.3);  // gold color
        this.glow.drawRoundedRect(2, 2, config.symbolSize - 4, config.symbolSize - 4, 10);
        this.glow.endFill();
        this.glow.visible = false;  // hidden by default
        this.container.addChild(this.glow);

        // inner shine effect (looks nicer)
        this.innerShine = new PIXI.Graphics();
        this.innerShine.beginFill(0xffffff, 0.1);
        this.innerShine.drawRoundedRect(4, 4, config.symbolSize - 8, config.symbolSize / 3, 8);
        this.innerShine.endFill();
        this.container.addChild(this.innerShine);

        // the actual emoji text
        this.text = new PIXI.Text(value, {
            fontSize: config.symbolFontSize,
            fill: 0xffffff,
            align: 'center'
        });
        this.text.anchor.set(0.5);  // center the text
        this.text.x = config.symbolSize / 2;
        this.text.y = config.symbolSize / 2;
        this.container.addChild(this.text);
    }

    setValue(value) {
        // change the symbol to a different emoji
        this.value = value;
        this.text.text = value;
    }

    setPosition(y) {
        // move symbol vertically
        this.container.y = y;
    }

    highlight(on) {
        // show/hide the glow effect
        this.glow.visible = on;
        if (on) {
            this.animateGlow();  // start pulsing animation
        }
    }

    animateGlow() {
        // makes the glow pulse (fade in and out)
        let alpha = 0.3;
        let inc = true;  // increasing or decreasing

        const loop = () => {
            if (!this.glow.visible) return;  // stop if glow hidden

            alpha += inc ? 0.03 : -0.03;
            if (alpha >= 0.7) inc = false;  // start decreasing
            if (alpha <= 0.3) inc = true;   // start increasing

            this.glow.alpha = alpha;
            requestAnimationFrame(loop);
        };

        loop();
    }
}