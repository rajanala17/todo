const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'todoApplication.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()
const pristat = reqestQuery => {
  return reqestQuery.priority !== undefined && reqestQuery.status !== undefined
}
const pri = reqestQuery => {
  return reqestQuery.priority !== undefined
}
const stat = requestQuery => {
  return requestQuery.status !== undefined
}
app.get('/todos/', async (request, response) => {
  let data = null
  let getTodosQuery = ''
  const {search_q = '', priority, status} = request.query
  switch (true) {
    case pristat(request.query):
      getTodosQuery = `
  SELECT 
  *
  FROM 
  todo
  WHERE
  todo LIKE '${search_q}'
  AND status = '${status}'
  AND priority = '${priority}';`
      break
    case pri(request.query):
      getTodosQuery = `
  SELECT 
  *
  FROM 
  todo
  WHERE
  todo LIKE '%${search_q}%'
  AND priority = '${priority}';`
      break
    case stat(request.query):
      getTodosQuery = `
  SELECT 
  *
  FROM 
  todo
  WHERE
  todo LIKE '%${search_q}%'
  AND status = '${status}';`
      break
    default:
      getTodosQuery = `
  SELECT 
  *
  FROM 
  todo
  WHERE
  todo LIKE '%${search_q}%';`
  }
  data =await db.all(getTodosQuery)
  response.send(data)
})
//API2
app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const api2 = `
  SELECT 
  * 
  FROM 
  todo
  WHERE
  id = '${todoId}';`
  const a =await db.get(api2)
  response.send(a)
})
//API3
app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status} = request.body
  const api3 = `
  INSERT 
  INTO 
  todo (id,todo,priority,status)
  VALUES
  ('${id}','${todo}','${priority}','${status}');`
  await db.run(api3)
  response.send('Todo Successfully Added')
})
//PUT
app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  let update = ''
  const requestBody = request.body
  switch (true) {
    case requestBody.status !== undefined:
      update = 'Status'
      break
    case requestBody.priority !== undefined:
      update = 'Priority'
      break
    case requestBody.todo !== undefined:
      update = 'Todo'
      break
  }
  const pre = `
  SELECT 
  *
  FROM 
  todo
  WHERE
  id = '${todoId}';`
  const a = await db.get(pre)

  const {todo = a.todo, priority = a.priority, status = a.status} = request.body
  const updateTodo = `
UPDATE
todo
SET
todo = '${todo}',
priority = '${priority}',
status = '${status}'
WHERE
id = '${todoId}';`
  await db.run(updateTodo)
  response.send(`${update} Updated`)
})
//DELETE
app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const api5 = `
  DELETE
  FROM 
  todo
  WHERE
  id ='${todoId}';`
  await db.run(api5)
  response.send('Todo Deleted')
})
module.exports = app
