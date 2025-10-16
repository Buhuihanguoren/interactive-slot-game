export class SymbolAnalyzer {
    static countSymbols(results) {
        const counts = {};  // will store { symbol: count }
        
        // loop through each reel
        results.forEach(function(reel) {
            // loop through each symbol in the reel
            reel.forEach(function(symbol) {
                if (counts[symbol]) {
                    // symbol exists, add 1
                    counts[symbol]++;
                } else {
                    // new symbol, set to 1
                    counts[symbol] = 1;
                }
            });
        });
        
        return counts;
    }
    
    // could add more analysis methods here
    // like getMostCommon(), getPercentages(), etc
}