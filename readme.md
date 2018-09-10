# Canarify

![alt](https://img.shields.io/badge/stability-alpha-red.svg)
![alt](https://img.shields.io/badge/node%20version-%3E%3D%20v8.x.x-brightgreen.svg)

> This module is still in alpha and the API is subject to change frequently.

Canarify makes it so easy to implement Canary Healthcheck endpoints in NodeJS microservices. This minimalistic library can be integrated with any web framework including express, restify etc.

### What is a Canary Endpoint anyway?

A Canary endpoint is a healthcheck REST endpoint implemented in a microservice, which upon called will check health of itself, as well as the health of all its dependencies (databases, message queues, other microservices etc.). Compared to the most common type of healthcheck endpoints where a simple message is echoed back to the client, a Canary endpoint can indicate a more accurate status of the microservice functionality. 

However, there are multiple caveats in implementing Canary endpoints in practice, including

- Canary endpoint taking too long to respond (this is because it will have to check the health of all its dependencies before sending the response)
- Checking the health of all its dependencies might not be necessary in some cases (serving certain clients might not require all the dependencies up and running)
- Circular dependencies can cause infinite response time

Canarify attempts to solve most of these problems by providing the features and the flexibility to develop your Canary endpoints as you wish. 

### Current status

|Feature|Status|
|------|----|
|Multiple dependency support|✅|
|Status Caching|❌|
|Custom Timeouts|❌|
|Circular dependency detection|❌|
|Client-aware health checks|❌|

### Installation

```
npm install canarify
```

### Usage

```js
const Canarify = require('canarify');
const canary = new Canarify('myapp');

function checkDatabaseHealth() {
	// perform an action to check whether the database is up and running
}

canary.action('database', checkDatabaseHealth);
```

In the above example, the `checkDatabaseHealth` function will check the health of the `database` dependency. More than one healthchecks can also be provided.

e.g,

```js
const Canarify = require('canarify');
const canary = new Canarify({ name: 'myapp'});

// ... 

canary.action('database', checkDatabaseHealth);
canary.action('mq-service', checkMQHealth);
canary.action('users-ms', checkBackendHealth);
```
To understand how to implement the healthcheck action functions, see the API reference at the bottom.

### Executing the Canary

`canary.execute` will call all the healthcheck actions and will produce an output containing the results returned by all the healthcheck actions.

e.g,

```
[ { action: 'database',
    success: true,
    result: { dbStatus: 'alive', transPerSec: 12000 },
    time: 1.2524792599999999 },
  { action: 'mq-service',
    success: true,
    result: { mqsize: 123513, serviceTime: 0.23 },
    time: 0.000105344 },
  { action: 'users-ms',
    success: true,
    result: { processTime: 123513 },
    time: 0.500422045 } ]
```

### Example usage of Canarify with Express

```js
app.get('/health/canary', (req, res) => {
	canary.execute().then((results) => {
		const success = results.map(r => r.status).some(s => s < 200 || s >= 300);
  		const statusCode = success ? 200 : 500;
		res.status(statusCode).send({
			success,
			results
		});
	}).catch((err) => {
		res.status(500).send({
			success: false
		});
	})
})
```

## API Reference

### Constructor: Canarify(options)

- `options.name` (String) Name of the microservice

```js
const canary = new Canarify({ name: 'my-microservice' });
```

### canary.action(dependencyName, healthCheckAction)
- `dependencyName ` (String) Name of the dependency
- `healthCheckAction` (Function) Health check function for the dependency. This function should return a promise. If the promise is resolve with data, the resolved data will be included in the `result` property of the given microservice. If the promise is rejected with an error, the property `success` will be set to false and the `result` property value will be the error object.

e.g,

```
[
	{ 
		action: 'database',
		success: true,
		result: { dbStatus: 'alive', transPerSec: 12000 },
		time: 1.2524792599999999 
	}
]
```

e.g, 

```js
canary.action('users-microservice', () => {
	// send a request to the health check endpoint of the  users-microservice
});
```

### canary.execute

This function does not accept any parameters.

e.g,

```
canary.execute()
```
