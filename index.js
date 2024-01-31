require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const Person = require('./models/person')
const app = express()

morgan.token('request-body', function (req) {
  return JSON.stringify(req.body)
})

app.use(cors())
app.use(express.json())
app.use(express.static('dist'))
app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :request-body'
  )
)

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => next(error))
})

app.delete('/api/persons/:id', (request, response) => {
  Person.findByIdAndDelete(request.params.id)
    .then((result) => {
      response.status(204).end()
    })
    .catch((error) => next(error))
})

app.post('/api/persons', (request, response) => {
  if (!request.body || !request.body.name || !request.body.number) {
    return response.status(400).json({
      error: 'data missing',
    })
  }

  const person = new Person({
    name: request.body.name,
    number: request.body.number,
  })

  person.save().then((savedPerson) => {
    response.json(savedPerson)
  })
})

app.put('/api/persons/:id', (request, response) => {
  Person.findByIdAndUpdate(request.params.id, request.body)
    .then((result) => {
      response.json(request.body)
    })
    .catch((error) => next(error))
})

app.get('/api/info', (request, response) => {
  Person.countDocuments({})
    .then((result) => {
      response.send(`
        <p>Phonebook has info for ${result} people</p>
        <p>${new Date()}</p>
      `)
    })
    .catch((error) => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
