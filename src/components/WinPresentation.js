export class WinPresentation {
    constructor(app) {
        this.app = app;
        this.particles = [];  // array of active particles
    }

    createWinExplosion(x, y) {
        // create 20 particles at position x,y
        for (let i = 0; i < 20; i++) {
            const particle = new PIXI.Graphics();
            const size = Math.random() * 8 + 4;  // random size
            
            // different colors for variety
            const colors = [0xffd700, 0xffa500, 0xff6347, 0x4ade80, 0x3b82f6];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            particle.beginFill(color);
            particle.drawCircle(0, 0, size);
            particle.endFill();
            
            // starting position
            particle.x = x;
            particle.y = y;
            
            // random velocity (makes them fly outward)
            particle.vx = (Math.random() - 0.5) * 12;
            particle.vy = (Math.random() - 0.5) * 12 - 8;  // bias upward
            particle.life = 1;  // fully visible at start
            
            this.particles.push(particle);
            this.app.stage.addChild(particle);
        }
    }

    update() {
        // update all particles every frame
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            // move particle
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.3;  // gravity
            
            // fade out
            particle.life -= 0.015;
            particle.alpha = particle.life;
            
            // remove dead particles
            if (particle.life <= 0) {
                this.app.stage.removeChild(particle);
                this.particles.splice(i, 1);
            }
        }
    }

    showWinMessage(amount, elementId = 'win-message') {
        // show win message on screen
        const winMessage = document.getElementById(elementId);
        winMessage.textContent = `WIN: $${amount}`;
        winMessage.style.display = 'block';
        
        // hide after 3 seconds
        setTimeout(() => {
            winMessage.style.display = 'none';
        }, 3000);
    }
}