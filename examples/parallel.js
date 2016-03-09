'use strict'

const bucketlist = require('..')

function delayedResponse (prefix, delay) {
  delay = Math.round(delay)
  return {
    name: `${prefix}: Resolves in ${delay}ms`,
    run: () => new Promise((resolve) => {
      setTimeout(resolve, delay)
    })
  }
}

console.log('Running items in sequence and parallel')
console.log()

bucketlist([
  delayedResponse('Sequence 1 A', 2000),
  delayedResponse('Sequence 1 B', 1000),
  delayedResponse('Sequence 1 C', 500),
  [
    delayedResponse('Parallel 1 A', 2000),
    delayedResponse('Parallel 1 B', 1000),
    delayedResponse('Parallel 1 C', 500)
  ],
  [
    delayedResponse('Parallel 2 A', Math.random() * 2500),
    delayedResponse('Parallel 2 B', Math.random() * 2500),
    delayedResponse('Parallel 2 C', Math.random() * 2500),
    delayedResponse('Parallel 2 D', Math.random() * 2500),
    delayedResponse('Parallel 2 E', Math.random() * 2500),
    delayedResponse('Parallel 2 F', Math.random() * 2500),
    delayedResponse('Parallel 2 G', Math.random() * 2500),
    delayedResponse('Parallel 2 H', Math.random() * 2500),
    delayedResponse('Parallel 2 I', Math.random() * 2500),
    delayedResponse('Parallel 2 J', Math.random() * 2500)
  ]
])
.then(() => {
  console.log()
  console.log('done')
})
