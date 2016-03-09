'use strict'

const _ = require('lodash')
const pad = require('pad')
const charm = require('charm')(process)
charm.reset()
const Rx = require('rxjs/Rx')
require('colors')

module.exports = function (taskList, config) {
  const settings = Object.assign({
    icons: {
      waiting: '◦',
      running: 'ϟ',
      completed: '•',
      error: '•'
    },
    colors: {
      waiting: 'gray',
      running: 'yellow',
      completed: 'green',
      error: 'red',
      comment: 'cyan'
    },
    showLogs: true
  }, config)

  const states = {
    WAITING: 'waiting',
    RUNNING: 'running',
    COMPLETED: 'completed',
    ERROR: 'error'
  }

  function BucketListError (index, task, message, stack) {
    const temp = Error.apply(this, [message])
    this.index = index
    this.task = task
    this.state = states.ERROR
    this.stack = temp.stack
    this.message = temp.message
  }
  BucketListError.prototype = Error.prototype

  const flatTaskList = _.flatten(taskList)

  charm.cursor(false)
  const getCursor$ = Rx.Observable.create((observer) => {
    charm.position((x, y) => {
      observer.next({x, y})
      observer.complete()
    })
  })

  return getCursor$
  .flatMap((initialCursor) => {
    function restoreCursor () {
      charm.cursor(true)
      charm.position(0, initialCursor.y + flatTaskList.length)
      charm.destroy()
    }

    process.on('exit', restoreCursor)

    let index = 0
    let maxNameLength = 0
    const tasks = Rx.Observable.fromArray(taskList.map((task) => {
      if (Array.isArray(task)) {
        task.forEach((subTask) => {
          maxNameLength = Math.max(subTask.name.length, maxNameLength)
          subTask.index = index++
        })
      } else {
        maxNameLength = Math.max(task.name.length, maxNameLength)
        task.index = index++
      }
      return task
    }))

    const data = {}
    const messages = new Rx.Subject()

    function render (row) {
      charm.position(0, initialCursor.y + row.index)
      charm.erase('line')
      const icon = settings.icons[row.state]

      charm.write(`  ${icon} ${pad(row.task.name, maxNameLength + 3)}`[settings.colors[row.state]])
      if (row.message && settings.showLogs) charm.write(row.message[settings.colors.comment])
      charm.write('\n')
    }

    function runTask (task) {
      const index = task.index
      messages.next({ index, task, state: states.RUNNING })
      return Promise.resolve(task.run(data, (message) => {
        const messageOutput = typeof message === 'number' && message >= 0 && message <= 1
          ? Math.round(message * 100) + '%'
          : message
        messages.next({index, message: messageOutput, task, state: states.RUNNING})
      }))
      .then((result) => {
        if (task.id) {
          data[task.id] = result
        }

        return { index, task, message: '', state: states.COMPLETED }
      })
      .catch((error) => {
        // Need to attach metadata so we can render the error
        throw new BucketListError(index, task, error.toString())
      })
    }

    const completedTasks = tasks
    .concatMap((task) => {
      if (Array.isArray(task)) {
        // Run tasks in array in parallel
        const subs = Rx.Observable.fromArray(task).mergeMap((taskItem, taskSubIndex) => {
          return runTask(taskItem)
        })
        return subs
      } else {
        return runTask(task)
      }
    })

    return Rx.Observable.merge(
      // initial list
      Rx.Observable.fromArray(flatTaskList).map((task, index) => ({ index, task, message: '', state: states.WAITING })),
      // message updated
      messages,
      // completed tasks
      completedTasks
    )
    .do(render, (error) => {
      render(error)
      // make sure cursor is restored on error too
      restoreCursor()
    })
    .takeUntil(completedTasks.toPromise()) // otherwise the final promise will never resolve..
    .do(null, null, restoreCursor)
  })
  .toPromise()
}
