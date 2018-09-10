const Canarify = require('../lib/canarify');
const canary = new Canarify({ name: 'my-app' });

canary.action('database', () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                dbStatus: 'alive',
                transPerSec: 12000
            })
        }, Math.floor(Math.random() * 2000))
    });
});

canary.action('mq-service', () => {
    return new Promise((resolve) => {
        resolve({
            mqsize: 123513,
            serviceTime: 0.23
        });
    })
});

canary.action('users-ms', () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                processTime: 123513
            });
        }, 500)
    })
});

(async () => {
    console.log(await canary.execute());
})();