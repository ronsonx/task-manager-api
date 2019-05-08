const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('../../src/models/user')
const Task = require('../../src/models/task')

const userOneId  = new mongoose.Types.ObjectId()
const userOne = {
    _id: userOneId,
    name: 'Ronson Xaviour',
    email: 'ronson2@exapmple.com',
    password: 'MyPass772!',
    age: 25,
    tokens: [{
        token: jwt.sign({_id:userOneId},process.env.JWT_SECRET)
    }]
}

const userTwo = {
    name: 'Ronson',
    email: 'ronson.xaviour@exapmple.com',
    age: 25
}

const userThreeId  = new mongoose.Types.ObjectId()
const userThree = {
    _id: userThreeId,
    name: 'Avratanu',
    email: 'avra@exapmple.com',
    password: 'Avrapass#45$@!',
    age: 27,
    tokens: [{
        token: jwt.sign({_id:userThreeId},process.env.JWT_SECRET)
    }]
}

const taskOne = {
    _id: new mongoose.Types.ObjectId,
    description: 'First task',
    completed: false,
    owner: userOne._id
}

const taskTwo = {
    _id: new mongoose.Types.ObjectId,
    description: 'Second task',
    completed: true,
    owner: userOne._id
}

const taskThree = {
    _id: new mongoose.Types.ObjectId,
    description: 'Third task',
    completed: false,
    owner: userThree._id
}

const setUpDatabase = async () =>{
    await User.deleteMany()
    await Task.deleteMany()
    await new User(userOne).save()
    await new User(userThree).save()
    await new Task(taskOne).save()
    await new Task(taskTwo).save()
    await new Task(taskThree).save()
}

module.exports = {userOneId, userOne, userTwo, userThree, taskOne, taskTwo, taskThree, setUpDatabase}