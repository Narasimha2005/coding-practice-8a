const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()

app.use(express.json())
const dbPath = path.join(__dirname, 'todoApplication.db')
let db = null

const initializeDbAndserver = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDbAndserver()

app.get('/todos/', async (request, response) => {
  const {status = '', priority = '', search_q = ''} = request.query
  const query = `SELECT * FROM todo WHERE status LIKE '%${status}%' AND priority LIKE '%${priority}%' AND todo LIKE "%${search_q}%";`
  const todos = await db.all(query)
  response.send(todos)
})

app.get('/todos/:todoId', async (request, response) => {
  const {todoId} = request.params
  const query = `SELECT * FROM todo WHERE id=${todoId};`
  const todo = await db.get(query)
  response.send(todo)
})

app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status} = request.body
  const query = `INSERT INTO todo (id,todo, priority, status) VALUES (${id},'${todo}','${status}','${priority}');`
  await db.run(query)
  response.send('Todo Successfully Added')
})

app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const givenTodoGetQuery = `SELECT * FROM todo WHERE id=${todoId}`
  const givenTodo = await db.get(givenTodoGetQuery)
  const {
    id = givenTodo.id,
    todo = givenTodo.todo,
    priority = givenTodo.priority,
    status = givenTodo.status,
  } = request.body
  const query = `UPDATE todo SET id=${id},todo='${todo}',status='${status}',priority='${priority}' WHERE id=${todoId};`
  await db.run(query)
  const updatedWord = Object.keys(request.body)
  if (updatedWord[0] === 'todo') {
    updatedWordcaseChange = 'Todo'
  } else if (updatedWord[0] == 'status') {
    updatedWordcaseChange = 'Status'
  } else {
    updatedWordcaseChange = 'Priority'
  }
  response.send(`${updatedWordcaseChange} Updated`)
})

app.delete('/todos/:todoId', async (request, response) => {
  const {todoId} = request.params
  const query = `DELETE FROM todo WHERE id=${todoId};`
  await db.run(query)
  response.send('Todo Deleted')
})

module.exports = app
