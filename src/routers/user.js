const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const router = new express.Router()
const auth = require('../middleware/auth')
const User = require('../models/user')
const {sendWelcomeEmail, sendGoodByeEmail} = require('../emails/account')
const upload = new multer({
    limits:{
        fileSize: 1000000
    },
    fileFilter(req, file, callback){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return callback(new Error('File format is not supported'))
        }
        callback(undefined,true)
    }
})

router.get('/api/users/me', auth, async (req, res) => {
    await res.send(req.user)
})

router.post('/api/users', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/api/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.status(200).send({ user, token })
    } catch (error) {
        // console.log(error)
        res.status(401).send({ code: 401, error: 'Unauthorized' })
    }
})

router.post('/api/users/logout', auth, async (req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        })
        await req.user.save()
        res.status(204).send()
    }catch(e){
        res.status(500).send(e)
    }
})

router.post('/api/users/logoutAll', auth, async (req,res)=>{
    try{
        req.user.tokens = []
        await req.user.save()
        res.status(204).send()
    }catch(e){
        res.status(500).send(e)
    }
})

router.patch('/api/users/me', auth,async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'age', 'email', 'password']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).send({ code: 400, error: "Invalid field" })
    }

    try {
        const user = req.user
        updates.forEach((update) => user[update] = req.body[update])
        user.save()
        res.status(202).send(user)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/api/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        sendGoodByeEmail(req.user.email, req.user.name)
        res.status(202).send(req.user)
    } catch (error) {
        console.log(error)
        res.status(500).send()
    }
})

router.post('/api/users/me/avatar', auth, upload.single('avatar'), async (req,res)=>{
    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req,res, next)=>{
    res.status(400).send({code: 400, error: error.message})
})

router.get('/api/users/me/avatar', auth, async (req,res)=>{
    try{
        if(!req.user.avatar){
            throw new Error('Avatar not found')
        }
        res.set('Content-Type','image/png')
        res.send(req.user.avatar)
    }catch(error){
        res.status(404).send({code:404, error: 'Avatar not found'})
    }
})

router.delete('/api/users/me/avatar', auth, async (req,res)=>{
    req.user.avatar = undefined
    await req.user.save()
    res.status(204).send()
})



module.exports = router