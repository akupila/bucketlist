'use strict'

const bucketlist = require('..')

const makeTask = (name, duration) => {
  return {
    name,
    run: (log, data) => 'ok'
  }
}

bucketlist([
  makeTask('A', 200),
  makeTask('B', 200),
  [
    makeTask('C', 200),
    makeTask('D', 100),
    makeTask('E', 300)
  ]
])
.then(() => {
  console.log('done')
})
.catch(console.error)
