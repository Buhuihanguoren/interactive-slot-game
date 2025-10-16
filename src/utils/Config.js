/**
 * generates paylines mathematically instead of hardcoding them
 * way easier to modify and support different grid sizes
 */
class PaylineGenerator {
    constructor(reels = 5, rows = 3) {
        this.reels = reels;
        this.rows = rows;
    }

    generateAll() {
        const paylines = [];

        // different types of patterns
        paylines.push(...this.generateHorizontal());      // straight lines
        paylines.push(...this.generateDiagonals());       // diagonal lines
        paylines.push(...this.generateVShapes());         // v shapes and zigzags
        paylines.push(...this.generateWavePatterns());    // wave patterns
        paylines.push(...this.generateStepPatterns());    // step patterns
        paylines.push(...this.generateRandomPatterns(40)); // random valid patterns

        return paylines;
    }

    generateHorizontal() {
        // creates straight horizontal lines
        // example: [0,0,0,0,0] is top row
        const lines = [];
        for (let row = 0; row < this.rows; row++) {
            lines.push(new Array(this.reels).fill(row));
        }
        return lines;
    }

    generateDiagonals() {
        const lines = [];
        
        // descending diagonal (top left to bottom right)
        const desc = [];
        for (let i = 0; i < this.reels; i++) {
            const row = Math.floor((i / (this.reels - 1)) * (this.rows - 1));
            desc.push(Math.min(row, this.rows - 1));
        }
        lines.push(desc);
        
        // ascending diagonal (bottom left to top right)
        const asc = [];
        for (let i = 0; i < this.reels; i++) {
            const row = this.rows - 1 - Math.floor((i / (this.reels - 1)) * (this.rows - 1));
            asc.push(Math.max(row, 0));
        }
        lines.push(asc);
        
        return lines;
    }

    generateVShapes() {
        // v shapes like [0,1,2,1,0]
        const lines = [];
        const patterns = [
            [0, 1, 2, 1, 0], [1, 2, 2, 2, 1], [0, 0, 1, 0, 0],
            [1, 1, 2, 1, 1], [0, 1, 1, 1, 0], [2, 1, 0, 1, 2],
            [1, 0, 0, 0, 1], [2, 2, 1, 2, 2], [1, 1, 0, 1, 1],
            [2, 1, 1, 1, 2], [0, 0, 2, 0, 0], [2, 2, 0, 2, 2],
            [0, 1, 2, 2, 0], [2, 1, 0, 0, 2], [1, 0, 1, 0, 1]
        ];
        
        // only add valid patterns (all rows must be in range)
        patterns.forEach(pattern => {
            if (pattern.every(row => row >= 0 && row < this.rows)) {
                lines.push(pattern);
            }
        });
        
        return lines;
    }

    generateWavePatterns() {
        // creates wave-like patterns using sine function
        const lines = [];
        
        for (let freq = 1; freq <= 4; freq++) {
            for (let offset = 0; offset < this.rows; offset++) {
                const pattern = [];
                for (let i = 0; i < this.reels; i++) {
                    const wave = Math.sin((i * freq * Math.PI) / (this.reels - 1));
                    const row = Math.floor(((wave + 1) / 2) * (this.rows - 1));
                    pattern.push((row + offset) % this.rows);
                }
                
                // dont add duplicates
                if (!this.isDuplicateLine(lines, pattern)) {
                    lines.push(pattern);
                }
            }
        }
        
        return lines.slice(0, 20);  // only return first 20
    }

    generateStepPatterns() {
        // patterns that step up or down
        const lines = [];
        
        for (let startRow = 0; startRow < this.rows; startRow++) {
            for (let step = -1; step <= 1; step++) {
                if (step === 0) continue;  // skip no step
                
                const pattern = [];
                let currentRow = startRow;
                
                for (let i = 0; i < this.reels; i++) {
                    pattern.push(currentRow);
                    currentRow += step;
                    // bounce back if we go out of bounds
                    if (currentRow < 0) currentRow = 1;
                    if (currentRow >= this.rows) currentRow = this.rows - 2;
                }
                
                if (!this.isDuplicateLine(lines, pattern)) {
                    lines.push(pattern);
                }
            }
        }
        
        // add some cycling patterns
        for (let i = 0; i < 5; i++) {
            const pattern = [];
            for (let j = 0; j < this.reels; j++) {
                pattern.push((j + i) % this.rows);
            }
            if (!this.isDuplicateLine(lines, pattern)) {
                lines.push(pattern);
            }
        }
        
        return lines.slice(0, 20);
    }

    generateRandomPatterns(count) {
        // generate random valid patterns
        const lines = [];
        const maxAttempts = count * 10;
        let attempts = 0;
        
        while (lines.length < count && attempts < maxAttempts) {
            const pattern = [];
            let prevRow = Math.floor(Math.random() * this.rows);
            
            for (let i = 0; i < this.reels; i++) {
                const change = Math.floor(Math.random() * 3) - 1;  // -1, 0, or 1
                let newRow = prevRow + change;
                newRow = Math.max(0, Math.min(this.rows - 1, newRow));  // clamp to valid range
                pattern.push(newRow);
                prevRow = newRow;
            }
            
            // only add if not duplicate
            if (!this.isDuplicateLine(lines, pattern)) {
                lines.push(pattern);
            }
            
            attempts++;
        }
        
        return lines;
    }

    isDuplicateLine(lines, pattern) {
        // check if pattern already exists in lines array
        return lines.some(line => 
            line.length === pattern.length && 
            line.every((val, idx) => val === pattern[idx])
        );
    }

    getPaylines(count) {
        // generate all patterns and return first N
        const allLines = this.generateAll();
        return allLines.slice(0, count);
    }
}

// create generator for 5 reels, 4 rows
const generator = new PaylineGenerator(5, 4);
const allPaylines = generator.generateAll();

// game configuration
export const CONFIG = {
    // canvas size
    width: 1200,
    height: 900,
    
    // slot machine grid
    reels: 5,
    rows: 4,
    
    // symbol sizing
    symbolSize: 140,
    symbolPadding: 24,
    symbolFontSize: 75,
    
    // spin timing
    spinDuration: 1250,
    
    // symbols and their weights (higher = appears more often)
    symbols: ['🍒', '🍋', '🍊', '🍇', '💎', '⭐', '7️⃣'],
    symbolWeights: [25, 25, 20, 15, 8, 5, 2],
    
    // betting options
    betPerLine: 1,
    minBetPerLine: 0.10,
    maxBetPerLine: 10,
    betStepPerLine: 0.10,
    lineOptions: [20, 40, 100],  // player can choose 20, 40, or 100 lines
    defaultLines: 20,
    startingBalance: 1000,
    
    // colors for payline display
    paylineColors: [
        0xff00ff, // purple
        0xff1493, // pink
        0x00ffff, // cyan
        0xffff00, // yellow
        0x00ff00, // green
        0xff6600, // orange
        0xff0000, // red
        0x0000ff, // blue
        0xff00aa, // magenta
        0x00aaff  // light blue
    ],
    
    // payout table
    // format: symbol: { count: multiplier }
    payouts: {
        '🍒': { 3: 5, 4: 15, 5: 50 },
        '🍋': { 3: 5, 4: 15, 5: 50 },
        '🍊': { 3: 10, 4: 25, 5: 75 },
        '🍇': { 3: 15, 4: 40, 5: 100 },
        '💎': { 3: 30, 4: 75, 5: 200 },
        '⭐': { 3: 50, 4: 125, 5: 300 },
        '7️⃣': { 3: 100, 4: 250, 5: 500 }
    },
    
    // generated paylines
    paylines: {
        20: generator.getPaylines(20),
        40: generator.getPaylines(40),
        100: generator.getPaylines(100)
    }
};

console.log('📊 Paylines generated:');
console.log(`  20 lines: ${CONFIG.paylines[20].length} patterns`);
console.log(`  40 lines: ${CONFIG.paylines[40].length} patterns`);
console.log(`  100 lines: ${CONFIG.paylines[100].length} patterns`);