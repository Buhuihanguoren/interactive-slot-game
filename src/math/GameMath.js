export class WeightedRandom {
    constructor(items, weights) {
        this.items = items;  // array of symbols
        this.weights = weights;  // array of weights
        // sum all weights together
        this.totalWeight = weights.reduce((a, b) => a + b, 0);
    }

    pick() {
        // generate random number between 0 and total weight
        let r = Math.random() * this.totalWeight;
        
        // subtract each weight until we go negative
        for (let i = 0; i < this.items.length; i++) {
            if (r < this.weights[i]) return this.items[i];
            r -= this.weights[i];
        }
        
        // fallback (shouldn't happen but just in case)
        return this.items[this.items.length - 1];
    }
}

export class WinCalculator {
    /**
     * checks all paylines for wins
     * returns total win amount and which lines won
     */
    static calculatePaylineWins(results, paylines, payouts, betPerLine) {
        let totalWin = 0;
        const winningLines = [];

        // check each payline
        paylines.forEach((payline, lineIndex) => {
            // get symbols along this payline
            const symbols = [];
            for (let reel = 0; reel < payline.length; reel++) {
                const row = payline[reel];  // which row to check
                symbols.push(results[reel][row]);
            }

            // check if this line won
            const win = this.calculateLineWin(symbols, payouts, betPerLine);
            
            if (win.amount > 0) {
                totalWin += win.amount;
                winningLines.push({
                    lineIndex: lineIndex + 1,  // 1-indexed for display
                    payline: payline,
                    symbols: symbols,
                    count: win.count,
                    amount: win.amount
                });
            }
        });

        return { totalWin, winningLines };
    }

    /**
     * check a single line of symbols for wins
     */
    static calculateLineWin(symbols, payouts, betPerLine) {
        const first = symbols[0];  // first symbol
        let count = 1;

        // count matching symbols from left to right
        for (let i = 1; i < symbols.length; i++) {
            if (symbols[i] === first) {
                count++;
            } else {
                break;  // stop at first non-match
            }
        }

        // look up payout for this symbol and count
        const payout = payouts[first];
        if (payout && payout[count]) {
            return { 
                amount: payout[count] * betPerLine, 
                count 
            };
        }

        // no win
        return { amount: 0, count: 0 };
    }

    /**
     * old method (keeping for backwards compatibility)
     */
    static calculateWin(line, payouts, bet) {
        const first = line[0];
        let count = 1;

        for (let i = 1; i < line.length; i++) {
            if (line[i] === first) count++;
            else break;
        }

        const pay = payouts[first];
        if (pay && pay[count]) {
            return { amount: pay[count] * bet, count };
        }

        return { amount: 0, count: 0 };
    }
}