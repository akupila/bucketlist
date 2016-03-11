/* eslint-env mocha */

'use strict'

process.env.NODE_ENV = 'test'

const bucketlist = require('..')
const expect = require('expect.js')
const sinon = require('sinon')
const shhh = require('shhh')

describe('bucketlist', () => {
  it('should do nothing with empty task list', (done) => {
    shhh.enable()
    bucketlist([])
    .then(() => {
      done()
    })
    shhh.disable()
  })

  it('should run tasks in sequence', (done) => {
    let firstCalled = false
    let secondCalled = false

    const first = () => {
      if (secondCalled) {
        throw new Error('Second called before first')
      }
      firstCalled = true
      return Promise.resolve()
    }

    const second = () => {
      if (!firstCalled) {
        throw new Error('First not called before second')
      }
      secondCalled = true
      return Promise.resolve()
    }

    bucketlist([
      { name: '', run: first },
      { name: '', run: second }
    ])
    .then(() => {
      expect(firstCalled).to.be(true)
      expect(secondCalled).to.be(true)
      done()
    })
    .catch(done)
  })

  it('should run tasks in parallel', (done) => {
    const clock = sinon.useFakeTimers()
    const delay = 5000
    const makeDelayed = () => ({
      name: 'Delayed',
      run: () => new Promise((resolve, reject) => {
        setTimeout(resolve, delay)
      })
    })

    let resolved = false

    bucketlist([
      [
        makeDelayed(),
        makeDelayed(),
        makeDelayed(),
        makeDelayed(),
        makeDelayed()
      ]
    ])
    .then(() => {
      resolved = true
    })

    clock.tick(delay)
    clock.restore()

    setImmediate(() => {
      if (!resolved) {
        return done('Parallel didn\'t resolve in time')
      }
      done()
    })
  })

  it('should return data', (done) => {
    bucketlist([
      {
        id: 'source',
        name: 'A',
        run: () => Promise.resolve({ value: 42 })
      },
      {
        name: 'B',
        run: (log, data) => new Promise((resolve, reject) => {
          expect(data.source.value).to.be(42)
          resolve()
        })
      }
    ])
    .then(() => {
      done()
    })
    .catch(done)
  })

  it('should fail on first error', (done) => {
    bucketlist([
      {
        name: 'Error',
        run: () => Promise.resolve()
      },
      {
        name: 'Second',
        run: () => {
          throw new Error('run called after error')
        }
      }
    ])
    .then(() => {
      done('Did not exit on error')
    })
    .catch(() => {
      done()
    })
  })

  it('should fail gracefully when run throws', (done) => {
    bucketlist([
      {
        name: 'Throws',
        run: () => {
          throw new Error('Some error')
        }
      }
    ])
    .then(() => done('Exited successfully'))
    .catch((error) => {
      expect(error.message).to.eql('Some error')
      done()
    })
  })

  it('should fail if promise rejects', (done) => {
    bucketlist([
      {
        name: 'rejects',
        run: () => new Promise((resolve, reject) => {
          setTimeout(() => {
            reject('Error message')
          }, 10)
        })
      }
    ])
    .then(() => done('Exited successfully'))
    .catch((error) => {
      expect(error).to.eql('Error message')
      done()
    })
  })
})
