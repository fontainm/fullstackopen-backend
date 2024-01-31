import { useState, useEffect } from 'react'
import personService from './services/persons'

const Filter = ({ filter, change }) => {
  return (
    <div>
      filter shown with: <input value={filter} onChange={change} />
    </div>
  )
}

const PersonForm = ({ submit, name, changeName, number, changeNumber }) => {
  return (
    <form onSubmit={submit}>
      <div>
        <div>
          name: <input value={name} onChange={changeName} />
        </div>
        <div>
          number: <input value={number} onChange={changeNumber} />
        </div>
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  )
}

const Persons = ({ persons, filter, deletePerson }) => {
  return (
    <ul>
      {persons
        .filter((person) =>
          person.name.toLowerCase().includes(filter.toLowerCase())
        )
        .map((person) => (
          <li key={person.id}>
            {person.name} {person.number}
            <button onClick={() => deletePerson(person)}>delete</button>
          </li>
        ))}
    </ul>
  )
}

const Notification = ({ notification }) => {
  if (notification === null) {
    return null
  }

  return (
    <div className={`notification ${notification.type}`}>
      {notification.message}
    </div>
  )
}

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    personService.getAll().then((response) => {
      setPersons(response.data)
    })
  }, [])

  const addPerson = (event) => {
    event.preventDefault()

    const person = persons.find((person) => person.name === newName)
    if (person) {
      if (
        confirm(
          `${newName} is already added to phonebook, replace old number with new one?`
        )
      ) {
        const changedPerson = { ...person, number: newNumber }
        updatePerson(changedPerson)
        return
      } else {
        return
      }
    }

    const newPerson = {
      name: newName,
      number: newNumber,
    }

    personService
      .create(newPerson)
      .then((response) => {
        setPersons(persons.concat(response.data))
        setNewName('')
        setNewNumber('')
        setNotification({
          message: `Added ${response.data.name}`,
          type: 'success',
        })
        setTimeout(() => {
          setNotification(null)
        }, 3000)
      })
      .catch((error) => {
        setNotification({
          message: error.response.data.error,
          type: 'error',
        })
        setTimeout(() => {
          setNotification(null)
        }, 3000)
      })
  }

  const handleNameChange = (event) => {
    event.preventDefault()
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    event.preventDefault()
    setNewNumber(event.target.value)
  }

  const handleFilterChange = (event) => {
    event.preventDefault()
    setFilter(event.target.value)
  }

  const handleDelete = (person) => {
    if (!confirm(`Delete ${person.name}?`)) {
      return
    }

    personService.remove(person.id).then(() => {
      setPersons(persons.filter((p) => p.id !== person.id))
      setNotification({ message: `Deleted ${person.name}`, type: 'success' })
      setTimeout(() => {
        setNotification(null)
      }, 2000)
    })
  }

  const updatePerson = (person) => {
    personService
      .update(person.id, person)
      .then((response) => {
        setPersons(persons.map((p) => (p.id !== person.id ? p : response.data)))
        setNewName('')
        setNewNumber('')
        setNotification({
          message: `Updated ${response.data.name}`,
          type: 'success',
        })
        setTimeout(() => {
          setNotification(null)
        }, 3000)
      })
      .catch((error) => {
        setNotification({
          message: error.response.data.error,
          type: 'error',
        })
        setTimeout(() => {
          setNotification(null)
        }, 3000)
      })
  }

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification notification={notification} />
      <Filter filter={filter} change={handleFilterChange} />
      <h2>add a new</h2>
      <PersonForm
        submit={addPerson}
        name={newName}
        changeName={handleNameChange}
        number={newNumber}
        changeNumber={handleNumberChange}
      />
      <h2>Numbers</h2>
      <Persons persons={persons} filter={filter} deletePerson={handleDelete} />
    </div>
  )
}

export default App
