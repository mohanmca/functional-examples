const { Box, Either, Right, Left, fromNullable } = require('../examples/lib')

const { List } = require('immutable-ext')

const Task = require('data.task')

// 'chain' does not exist on the array,
// so we apply natural transformation into the List first
const res = List(['hello', 'world'])
.chain( x => List(x.split('')) )

console.log(res)


// natural tranformation from array to Either
// safe first element
const first = xs =>
  fromNullable(xs[0])


const largeNumbers = xs =>
  xs.filter( x => x > 100 )

const larger = x =>
  x * 2


const app = xs =>

  // map, then first
  first(
    largeNumbers(xs)
    .map(larger)
  )

console.log(app([2, 400, 5, 1000]))

const app1 = xs =>

  // first, then map
  first(
    largeNumbers(xs)
  )
  .map(larger)

console.log(app1([2, 400, 5, 1000]))


// fake user returned by id for testing purposes
const fake = id => ({
  id: id,
  name: 'user1',
  best_friend_id: id + 1
})

const Db = ({
  find: id => new Task(
    (rej, res) =>
      // simulate error 'not found' for id <= 2
      res( id > 2 ? Right(fake(id)) : Left(fake('not found')) )
  )
})

// natural transform Either to Task
const eitherToTask = e =>
  e.fold(Task.rejected, Task.of)


// valid user (id > 2)
// -> Task returns Either
Db.find(3)

// Task result is 'Either' but we want to chain with plain function,
// so apply natural transformation Either to Task first,
.chain(eitherToTask)

// now we have Task returning plain value,
// errors were already sent to Task.rejected,
// now map the result into another Task
.chain(user => Db.find(user.best_friend_id))

// the new result is again an Either,
// so we map it again from Either to Task
.chain(eitherToTask)
.fork(console.error, console.log)


// invalid user (id = 2)
Db.find(2)
.chain(eitherToTask)
.chain(user => Db.find(user.best_friend_id))
.chain(eitherToTask)
.fork(console.error, console.log)



