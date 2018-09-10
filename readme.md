# Canarify

> This module is under construction and will be updated soon.

### Installation

```
npm install canarify
```

### Usage

```js
const Canarify = require('canarify');
const canary = new Canarify('myapp');

canary.defineHealthParams([ 'time', 'status']); // my not be required?

canary.action('mysql-database', checkDatabaseHealth);
canary.action('rabbitmq-service', checkMQHealth);
canary.action('accounts-ms', checkBackendHealth);
```
Syntax of `action` callback of `canarify`

```js
function () {
  // returns a promise which resolves an object containing param values.
  // e.g, { time: 223.21, status: 200 }
  // in case of an error, reject the promise
}

function (callback) {
  // callback(error) in case of an error
  // otherwise: callback(null, params) - params should be an object containing param values
}
```

use Canarify with express

```js
app.get('/health/canary', canary());
```

or else using a custom endpoint:

```js
app.get('/health/canary', async (req, res) => {
  const { results } = await canary.execute();
  
  const success = results.map(r => r.status).some(s => s < 200 || s >= 300);
  const statusCode = success ? 200 : 500;
  res.status(statusCode).send({
    success,
    results
  });
})
```

Call to `/health/canary` endpoint will provide the following output:

```
{
  name: 'myapp',
  status: 200,
  time: 1223.2
  dependencies: [
    {
      name: 'mysql-database',
      status: 200,
      time: 12.2
    },
    {
      name: 'rabbitmq-service',
      status: 200,
      time: 233.2
    },
    {
      name: 'accounts-ms',
      status: 200,
      time: 31.2,
      dependencies: [
        ...
      ]
    }
  ]
}
```