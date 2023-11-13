// 1. import packages

import cors from 'cors'
import express from 'express'
import { MongoClient, ObjectId } from 'mongodb'
import 'dotenv/config'
import bcrypt from 'bcrypt'

// 2. use packages
const app = express()
app.use(cors())
app.use(express.json())

const client = new MongoClient(process.env.MONGO_URI as string)
client.connect()
const db = client.db('dino-store')
const users = db.collection('users')

// 3. listen on port
app.listen(process.env.PORT, () => console.log('listening to api running here'))


// 4. create a get endpoint
app.get('/', async (req, res) => {
  const allUsers = await users.find().toArray()
  res.status(201).send(allUsers)
})

app.post('/', async (req, res) => {
  const userEmail = req.body.email
  const userPassword = req.body.password

  const hashedPass = await bcrypt.hash(userPassword, 10)
  const userAdded = await users.insertOne({ email: userEmail, password: hashedPass })
  res.status(201).send(userAdded)
})

// Create Delete endpoint with params
app.delete('/:_id', async (req, res) => {
  const cleanId = new ObjectId(req.params._id)
  const userDeleted = await users.findOneAndDelete({ _id: cleanId })
  res.send(userDeleted)
})

// Create a patch endpoint by email with params
app.patch('/:_id', async (req, res) => {
  const updatedId = new ObjectId(req.params._id)
  const itemUpdated = await users.findOneAndUpdate({ _id: updatedId }, { $set: req.body })
  res.send(itemUpdated)
})

// Login endpoint
app.post('/login', async (req, res) => {
  const userPassword = req.body.password
  const foundUser = await users.findOne({ email: req.body.email })

  if (foundUser) {
    const passInDb = foundUser?.password
    const result = bcrypt.compare(userPassword, passInDb)
    res.send(foundUser)
  } else {
    res.json('❌ User not found! ❌')
  }
})
