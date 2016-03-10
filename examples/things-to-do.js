'use strict'

const bucketlist = require('..')

const learnToCount = {
  name: 'Learn to count to 10',
  run: (log, data) => new Promise((resolve, reject) => {
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
  run: (log, data) => Promise.resolve({ placesVisited: 50 })
}

const meetInterestingPeople = {
  name: 'Meeting interesting people',
  run: (log, data) => new Promise((resolve, reject) => {
    log(`Met interesting people in ${data.world.placesVisited} places`)
    setTimeout(resolve, 1000)
  })
}

const learnToMakeFood = {
  name: 'Learn to make food',
  id: 'foodSkill',
  run: () => Promise.resolve('decent')
}

const cookPasta = {
  name: 'Cook pasta',
  run: (log, data) => new Promise((resolve, reject) => {
    log(`Cooking ${data.foodSkill} pasta..`)
    setTimeout(resolve, 2500)
  })
}

const cookSteak = {
  name: 'Cook steak',
  run: (log, data) => new Promise((resolve, reject) => {
    log(`Cooking ${data.foodSkill} steak..`)
    setTimeout(resolve, 2000)
  })
}

const cookMushrooms = {
  name: 'Cook mushrooms',
  run: (log, data) => new Promise((resolve, reject) => {
    log(`Cooking ${data.foodSkill} mushrooms..`)
    setTimeout(resolve, 1500)
  })
}

const sleep = {
  name: 'Sleep',
  run: (log, data) => new Promise((resolve, reject) => {
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

const masterJavaScript = {
  name: 'Master JavaScipt',
  run: (log, data) => new Promise((resolve, reject) => {
    log('Practicing...')
    setTimeout(function () {
      reject('Uh oh, JS-foo not perfect')
    }, 2000)
  })
}

const goToMars = {
  name: 'Go to Mars',
  run: new Promise((resolve, reject) => {})
}

// -----------------------------------------------------

console.log()
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
.then((data) => {
  console.log()
  console.log('All done!', data)
})
.catch((error) => {
  console.log()
  console.log(`Failed with error "${error}"`)
})
