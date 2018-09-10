const LRU = require('lru-cache');

function parseHrtime(hrtimeOutput) {
    if (Array.isArray(hrtimeOutput)) {
        const [ seconds, nanoseconds ] = hrtimeOutput;
        return seconds + nanoseconds/(10**9);
    }
    return 0;
}

class Canarify {
    constructor({ name, cacheDuration }){
        this.name = name;
        this.cache = null;
        this.params = [];
        this.actions = [];
        this.action = this.action.bind(this);
        this.execute = this.execute.bind(this);
        if (cacheDuration) {
            this.cache = LRU({ maxAge: cacheDuration });
        }
    }

    action(actionName, actionFn) {
        this.actions.push({ actionName, actionFn });
    }

    async execute() {
        const results = [];
        for (let { actionName, actionFn } of this.actions) {
            if (typeof actionFn === 'function') {
                const startTime = process.hrtime();
                try {
                    const currResult = await actionFn();
                    const totalTime = process.hrtime(startTime);
                    results.push({
                        action: actionName,
                        success: true,
                        currResult,
                        time: parseHrtime(totalTime)
                    });
                } catch (err) {
                    const totalTime = process.hrtime(startTime);
                    results.push({
                        action: actionName,
                        success: false,
                        result: err,
                        time: parseHrtime(totalTime)
                    });
                }
            }
        }

        return results;
    }
}

module.exports = Canarify;