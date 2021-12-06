const express = require("express");
const cors = require("cors");
const { v4: uuid } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

// Fake database
const users = [];

// This function checks if the user account already exists
function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).json({ error: "User not found!" });
  }

  request.user = user;

  return next();
}

// This function creates a user to the system
app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists!" });
  }

  const newUser = { id: uuid(), name: name, username: username, todos: [] };

  users.push(newUser);

  return response.status(201).json(newUser);
});

// This function returns the user's todos array
app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

// Function to create a to-do
app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuid(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

// This function update the title and the deadline of a to-do with an specific id
app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const todo = user.todos.find((user) => user.id === id);

  if (!todo) {
    return response.status(404).json({ error: "To-do not found" });
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(201).json(todo);
});

// This function updates the "done" status from a to-do
app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((user) => user.id === id);

  if (!todo) {
    return response.status(404).json({ error: "To-do not found" });
  }

  todo.done = true;

  return response.status(201).json(todo);
});

// This function removes a to-do from the array and returns the remaining to-dos
app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((user) => user.id === id);

  if (!todo) {
    return response.status(404).json({ error: "To-do not found" });
  }

  user.todos.splice(user.todos.indexOf(todo), 1);

  return response.status(204).json(user.todos);
});

module.exports = app;
