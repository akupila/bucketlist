# bucketlist
Simple async task (promise) runner for node with a nice interface

[gif]
[gif]

## Installation

```bash
$ npm install --save bucketlist
```

## Usage 

```javascript
const bucketlist = require('bucketlist')

bucketlist([
  task1,
  task2
], config)
.then((data) => {
  console.log('done', data)
})
.catch((error) => {
  console.error('error', error)
})
```

Tasks is an array of tasks to run, each of them being run in sequence. If a single task fails execution stops there.

The return value is a promise that resolves with data (more on that later) or rejects on first failed task

Tasks can also contain arrays which are processed in parallel. 
Here `series2` waits for `series1` to finish, then runs all the `parallel` tasks in parallel and finally runs `series3`

```javascript
bucketlist([
  series1,
  series2,
  [
    parallel1,
    parallel2,
    parallel3
  ],
  series3
])
```

## Task definition

A task is a simple JavaScript object that should have two properties: `name` and `run` + an optional `id`.

`name` is as you might expect what shows up in the UI. Put whatever you want there.

`run` is a function that gets executed when the task should run. It should return a promise.
The signature is:

```javascript
function run (log, data) {
  // return promise
}
```

## Logging

The first argument passes to `run` is a function you can call to log out extra information. 
Call it with something and that will show up next to the task in the runner.

Calling `log(<0-1>)` (with a number, 0-1) will output a percentage (0-100%). 
If you want to log 0.5 and not have it become 50% use `toString()`.

## Data

The second argument is a data object that becomes populated if the the task had an `id`. 

```javascript
const task1 = {
  name: 'Sets data',
  id: 'setData',
  run: (log, data) => {
    return Promise.resolve({ meaningOfLife: 42 })
  }
}

const task2 = {
  name: 'Wants data',
  run: (log, data) => {
    // data.setData.meaningOfLife is now 42
  }
}

bucketlist([task1, task2])
```

Don't modify `data` directly, return a value when resolving the promise instead.
