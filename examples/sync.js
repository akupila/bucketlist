'use strict'

const bucketlist = require('..')

const makeAsyncTask = (name, duration) => {
  return {
    name,
    run: (log, data) => new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(name)
      }, duration)
    })
  }
}

const makeSyncTask = (name) => {
  return {
    name,
    run: (log, data) => name
  }
}

bucketlist([
  makeAsyncTask('A', 200),
  makeSyncTask('B'),
  [
    makeAsyncTask('C', 200),
    makeSyncTask('D'),
    makeAsyncTask('E', 300)
  ]
])
.then(() => {
  console.log('done')
})
.catch(console.error)
