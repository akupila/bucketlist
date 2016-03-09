'use strict'

const bucketlist = require('..')

const learnToCount = {
  name: 'Learn to count to 10',
  run: (data, log) => new Promise((resolve, reject) => {
    let num = 1
    function count () {
      log(`Learned to count to ${num++}`)
      if (num <= 10) {
        setTimeout(count, 200)
      } else {
        setTimeout(resolve, 500)
      }
    }
    count()
  })
}

const seeTheWorld = {
  name: 'See the world',
  id: 'world',
  run: (data, log) => new Promise((resolve, reject) => {
    resolve({ placesVisited: 50 })
  })
}

const meetInterestingPeople = {
  name: 'Try different foods',
  run: (data, log) => new Promise((resolve, reject) => {
    log(`Met interesting people in ${data.world.placesVisited} places`)
    setTimeout(resolve, 500)
  })
}

const masterJavaScript = {
  name: 'Master JavaScipt',
  run: (data, log) => new Promise((resolve, reject) => {
    log('Practicing...')
    setTimeout(function () {
      reject('Uh oh, not perfect')
    }, 2000)
  })
}

const learnToMakeFood = {
  name: 'Learn to make food',
  id: 'foodSkill',
  run: () => Promise.resolve('decent')
}

const cookPasta = {
  name: 'Cook pasta',
  run: (data, log) => new Promise((resolve, reject) => {
    log(`Cooking ${data.foodSkill} pasta..`)
    setTimeout(resolve, 2500)
  })
}

const cookSteak = {
  name: 'Cook steak',
  run: (data, log) => new Promise((resolve, reject) => {
    log(`Cooking ${data.foodSkill} steak..`)
    setTimeout(resolve, 2000)
  })
}

const cookMushrooms = {
  name: 'Cook mushrooms',
  run: (data, log) => new Promise((resolve, reject) => {
    log(`Cooking ${data.foodSkill} mushrooms..`)
    setTimeout(resolve, 1500)
  })
}

const sleep = {
  name: 'Sleep',
  run: (data, log) => new Promise((resolve, reject) => {
    const duration = 1000
    const startSleep = Date.now()
    function sleep () {
      const slept = (Date.now() - startSleep) / duration
      if (slept <= 1) {
        log(slept)
        setTimeout(sleep, 50)
      } else {
        resolve()
      }
    }
    sleep()
  })
}

const goToMars = {
  name: 'Go to Mars',
  run: new Promise((resolve, reject) => {})
}

// -----------------------------------------------------

console.log('Things to do before ⚰')
console.log()
const doAllTheThingsIWantToDo = bucketlist([
  learnToCount,
  seeTheWorld,
  meetInterestingPeople,
  learnToMakeFood,
  [
    cookPasta,
    cookMushrooms,
    cookSteak
  ],
  sleep,
  masterJavaScript,
  goToMars
])

// -----------------------------------------------------

doAllTheThingsIWantToDo
.then(() => {
  console.log()
  console.log('All done!')
})
.catch((error) => {
  console.log()
  console.log('Failed:')
  console.error(error.task.name + ': ' + error.message)
})
