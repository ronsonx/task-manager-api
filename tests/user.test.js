const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const {userOneId, userOne, userTwo, setUpDatabase} = require('./fixtures/db')


beforeEach(setUpDatabase)

test('Should not signup user with invalid email', async ()=>{
    await request(app)
    .post('/api/users')
    .send({
        name: 'Ronson',
        email: 'ronsondigitalapicraft.com',
        password: 'passD@123',
        age: 34
    }).expect(400)
})

test('Should not signup user with invalid password', async ()=>{
    await request(app)
    .post('/api/users')
    .send({
        name: 'Ronson',
        email: 'ronson@digitalapicraft.com',
        password: 'passwordD@123',
        age: 34
    }).expect(400)
})

test('Should signup a new user', async ()=>{
    const response = await request(app).post('/api/users').send({
        name: 'Ronson Xaviour',
        email: 'ronson@exapmple.com',
        password: 'MyPass772!',
        age: 25
    }).expect(201)

    //assert that the database was changed correctly
    //console.log(response.body)
    const user = await User.findById(response.body.user._id)
    //console.log(user)
    expect(user).not.toBeNull()

    //assertions about response
    expect(response.body).toMatchObject({
        user: {
            name: 'Ronson Xaviour',
            email: 'ronson@exapmple.com',
            age: 25
        },
        token: user.tokens[0].token
    })

})

test('Should login existing user', async()=>{
    const response = await request(app).post('/api/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    //Assert that the new token in response matches with the second token in database
    const user = await User.findById(response.body.user._id)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not login nonexistent user', async ()=>{
    await request(app).post('/api/users/login').send({
        email: 'bademail@err.com',
        password: 'badpassword@112'
    }).expect(401)
})

test('Should get profile for user', async ()=>{
    await request(app)
    .get('/api/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

test('Should not get profile for unauthenticated user', async ()=>{
    await request(app)
    .get('/api/users/me')
    .send()
    .expect(401)
})

test('Should upload avatar image', async ()=>{
    await request(app)
    .post('/api/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar','tests/fixtures/Ronson.jpeg')

    const user  = await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update valid user fields', async()=>{
    const response = await request(app)
    .patch('/api/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send(userTwo)
    .expect(202)
    
    //assert that the database is changed accordingly
    const user  = await User.findById(response.body._id)
    expect(user).toMatchObject({
        name: userTwo.name,
        email: userTwo.email,
        age: userTwo.age
    })
})

test('Should not update invalid user fileds', async ()=>{
    await request(app)
    .patch('/api/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({location: 'Bengaluru'})
    .expect(400)
})

test('Should not update user if unauthenticated', async ()=>{
    await request(app)
    .patch('/api/users/me')
    .send({name: 'Ronson X'})
    .expect(401)
})

test('Should not delete account if not authenticated', async ()=>{
    await request(app)
    .delete('/api/users/me')
    .send()
    .expect(401)
})

test('Should delete account for logged in user', async()=>{
    await request(app)
    .delete('/api/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(202)

    //assert the user is removed from database
    //console.log(response.body)
    const user = await User.findById(userOneId)
    expect(user).toBeNull()
})

test('Should not delete account for unauthenticated user',async ()=>{
    await request(app)
    .delete('/api/users/me')
    .send()
    .expect(401)
})

