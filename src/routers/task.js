const express = require('express')
const router = new express.Router()
const Task = require('../models/task')
const auth = require('../middleware/auth')
//GET /tasks?completed=true&limit=1&skip=2&sort=createdAt&order=asc
router.get('/api/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}
    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }
    if(req.query.sort){
        sort[req.query.sort] = req.query.order === 'desc' ? -1 : 1
    }
    try {
        //const tasks = await Task.find({owner:req.user._id})
        await req.user.populate({
            path: 'tasks',
            match,
            options:{
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort: sort
            }
        }).execPopulate()
        res.status(200).send(req.user.tasks)
    } catch (error) {
        //console.log(error)
        res.status(500).send(error)
    }
})

router.get('/api/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOne({_id:req.params.id, owner:req.user._id})
        if (!task) {
            return res.status(404).send()
        }
        res.status(200).send(task)
    } catch (error) {
        console.log(error)
        res.status(500).send(error)
    }
})

router.post('/api/tasks', auth, async (req, res) => {
    //const task = new Task(req.body)
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.patch('/api/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
    if (!isValidOperation) {
        return res.status(400).send({ code: 400, error: "Invalid field" })
    }
    try {
        const task = await Task.findOne({_id:req.params.id,owner:req.user._id})
        if (!task) {
            return res.status(404).send({ code: 404, error: 'Task not found' })
        }
        updates.forEach((update)=>task[update] = req.body[update])
        task.save()
        res.status(202).send(task)

    } catch (error) {
        res.status(500).send(error)
    }
})

router.delete('/api/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({_id:req.params.id,owner:req.user._id})
        if (!task) {
            return res.status(404).send({ code: 404, error: 'Task not found' })
        }
        res.status(202).send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router