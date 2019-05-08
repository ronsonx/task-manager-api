const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const {userOneId, userOne, userTwo, userThree, taskOne, taskTwo, taskThree, setUpDatabase} = require('./fixtures/db')

beforeEach(setUpDatabase)

test('Should create task for user', async ()=>{
    const response = await request(app)
    .post('/api/tasks/')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({description: 'Test task'})
    .expect(201)

    //assert that the task is created in database
    const task = await  Task.findById(response.body._id)
    // console.log(response)
    expect(task).not.toBeNull()
    expect(task.completed).toEqual(false)
})

test('Should not create task with invalid description/completed', async ()=>{
    await request(app)
    .post('/api/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({completed: 123})
    .expect(400)
})

test('Should get tasks created by a user', async ()=>{
    const response = await request(app)
    .get('/api/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    // assert the number of tasks created
    expect(response.body.length).toBe(2)
    //assert that the data base is updated
    // const tasks = Task.find({owner:userOne._id})
    // console.log(tasks)
    // expect(tasks.length).toBe(2)
})

test('Should fetch user task by id', async ()=>{
    await request(app)
    .get('/api/tasks/'+taskOne._id)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

test('Should not fetch user task by id if not authenticated', async ()=>{
    await request(app)
    .get('/api/tasks/'+taskOne._id)
    .send()
    .expect(401)
})

test('Should not fetch other users task by id', async () =>{
    await request(app)
    .get('/api/tasks/'+taskOne._id)
    .set('Authorization', `Bearer ${userThree.tokens[0].token}`)
    .send()
    .expect(404)
})

test('Should fetch only completed tasks when applied completed filter', async ()=>{
    const response = await request(app)
    .get('/api/tasks?completed=true')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    //assert that the response has only completed tasks
    const isValidResponse = response.body.every((task)=>{
        return task.completed === true
    })
    expect(isValidResponse).toBe(true)
})

test('Should fetch only incomplete tasks when applied completed filter', async ()=>{
    const response = await request(app)
    .get('/api/tasks?completed=false')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

    //assert that the response has only completed tasks
    const isValidResponse = response.body.every((task)=>{
        return task.completed === false
    })
    expect(isValidResponse).toBe(true)
})

test('Should not update other users task', async ()=>{
    await request(app)
    .patch('/api/tasks/'+taskThree._id)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({description: 'Test description'})
    .expect(404)
})

test('Logged in user should be able to delete his task', async ()=>{
    await request(app)
    .delete('/api/tasks/'+taskOne._id)
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(202)
})

test('Logged out user should not be able to delete task', async ()=>{
    await request(app)
    .delete('/api/tasks/'+taskOne._id)
    .send()
    .expect(401)
})

test('Task created by userOne should not be deleted by UserTwo', async()=>{
    await request(app)
    .delete('/api/tasks/'+taskOne._id)
    .set('Authorization', `Bearer ${userThree.tokens[0].token}`)
    .send()
    .expect(404)

    //assert task is not delete from database
    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})