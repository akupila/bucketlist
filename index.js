'use strict'

const makeCharm = require('charm')
const Rx = require('rxjs/Rx')
const pad = require('pad')

module.exports = function (taskList, config) {
  if (taskList.length === 0) {
    console.log('nothing to do')
    return Promise.resolve()
  }

  const settings = Object.assign({
    icons: {
      waiting: '◦',
      running: 'ϟ',
      completed: '•',
      error: '•'
    },
    colors: {
      waiting: 8, // see: https://upload.wikimedia.org/wikipedia/en/1/15/Xterm_256color_chart.svg
      running: 'yellow',
      completed: 'green',
      error: 'red',
      comment: 'cyan'
    },
    showLogs: true
  })

  const disableOutput = process.env.CI || process.env.NODE_ENV === 'test'

  // -----------------------------------------------------

  const states = {
    WAITING: 'waiting',
    RUNNING: 'running',
    COMPLETED: 'completed',
    ERROR: 'error'
  }

  // Some prep work, a bit ugly..
  // Add task indices so we can keep track of nested tasks correctly
  // Also keep track of max task length for nice padding
  let index = 0
  let maxNameLength = 0
  const flatTasks = []
  taskList.forEach((taskOrList) => {
    if (Array.isArray(taskOrList)) {
      taskOrList.forEach((subTask) => {
        maxNameLength = Math.max(subTask.name.length, maxNameLength)
        subTask.__index = index++
        flatTasks.push(subTask)
      })
    } else {
      maxNameLength = Math.max(taskOrList.name.length, maxNameLength)
      taskOrList.__index = index++
      flatTasks.push(taskOrList)
    }
  })

  function makeRenderCommand (task, state, message) {
    return {index: task.__index, name: task.name, state, message: message || ''}
  }

  // Keep track of data
  const data = {}

  function runTask (task) {
    return Rx.Observable.create((observer) => {
      observer.next(makeRenderCommand(task, states.RUNNING))

      let result
      try {
        result = task.run((message) => {
          // Task logged something
          // If value is 0-1 it's treated as a percentage
          const str = typeof message === 'number' && message <= 1
            ? Math.round(message * 100) + '%'
            : message
          // Emit so we re-render
          observer.next(makeRenderCommand(task, states.RUNNING, str))
        }, data)
        result = result instanceof Promise ? result : Promise.resolve(result)
      } catch (error) {
        result = Promise.reject(error)
      }

      result
      .then((result) => {
        // Task finished
        if (task.id) {
          data[task.id] = result
        }
        observer.next(makeRenderCommand(task, states.COMPLETED))
        observer.complete()
      })
      .catch((error) => {
        // Render error
        observer.next(makeRenderCommand(task, states.ERROR, error.toString()))
        // Emitting an error will stop further tasks from running
        observer.error(error)
      })
    })
  }

  // Initial list to start of with
  const initialList = Rx.Observable.fromArray(flatTasks)
    .map((task) => makeRenderCommand(task, states.WAITING))

  // Updated results
  const results = Rx.Observable.fromArray(taskList)
    .concatMap((task) => {
      if (Array.isArray(task)) {
        // Run sub tasks in parallel
        return Rx.Observable.fromArray(task).flatMap(runTask)
      } else {
        // Single task
        return runTask(task)
      }
    })

  let charm
  if (!disableOutput) {
    charm = makeCharm(process)
    charm.on('^C', process.exit)
  }

  return Rx.Observable.create((observer) => {
    if (disableOutput) {
      observer.next({x: 0, y: 0})
      observer.complete()
      return
    }

    charm.position((x, y) => {
      // Make some space if we've scrolled all the way down
      // If we don't do this the terminal will go crazy and scroll
      // for every render
      const missingRows = Math.max(y + flatTasks.length - process.stdout.rows, 0)
      charm.write(pad(missingRows, '', { char: '\n' }))
      observer.next({x, y: y - missingRows})
      observer.complete()
    })
  }).flatMap((initialCursor) => {
    function resetCursor () {
      if (disableOutput) return
      charm.display('reset')
      charm.cursor(true)
      charm.position(initialCursor.x, initialCursor.y + flatTasks.length)
      charm.destroy()
    }

    if (!disableOutput) {
      charm.cursor(false)
      process.on('exit', resetCursor)
    }

    return Rx.Observable.concat(
      // Empty list first
      initialList,
      results
    )
    // debounce? bufferWithTime?
    .do((task) => {
      if (task instanceof Error) return

      if (disableOutput) {
        if (task.state === states.COMPLETED && process.env.NODE_ENV !== 'test') {
          console.log(task.name + ' completed')
        }
        return
      }

      // Render
      charm.position(0, initialCursor.y + task.index)
      charm.erase('line')

      const icon = settings.icons[task.state]
      charm.foreground(settings.colors[task.state])
      charm.write(`  ${icon} ${pad(task.name, maxNameLength + 3)}`)
      if (task.message && settings.showLogs) {
        charm.foreground(settings.colors.comment)
        charm.write(task.message)
      }
      charm.write('\n')
      return task
    }, null, () => {
      resetCursor()
    })
    .mapTo(data)
    .catch((error) => {
      resetCursor()
      throw error
    })
  })
  .toPromise()
}
