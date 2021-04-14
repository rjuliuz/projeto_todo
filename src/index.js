const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());

app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find(user => user.username === username);

  //Fazendo verificação se não existir user.
  if(!user){
    return response.status(404).json({ error: "User not found"});
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { username, name } = request.body;

  // Validação se existe já um username cadastrado e deixando prosseguir ou não.
  const userAlreadyExists = users.find(user => user.username === username);

  if(userAlreadyExists) {
    return response.status(400).json({error: "User Already Exists!"})
  };

  //cadastrando novo usuário.
  const user = {
    id: uuidv4(),
    name,
    username,   
    todos: []
  };

  users.push(user);

  return response.status(201).json(user);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;  

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  //Adicionando novo TODO na Lista.
  const addNewTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(addNewTodo);

  return response.status(201).json(addNewTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const todo = user.todos.find( todo => todo.id === id);

  if(!todo) {
    return response.status(404).json({error: 'Todo not found'});
  }

  //Fazendo troca de titulo e data no todo existente.
  todo.title = title;
  todo.deadline = new Date(deadline);
  
  return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;  
  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id ===id);

  if(!todo) {
    return response.status(404).json({error: 'Todo not found'});
  }

  //Marcando um TODO como feito.
  todo.done = true;

  return response.json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoIndex = user.todos.findIndex(todo => todo.id === id);

  if(todoIndex === -1) {
    return response.status(404).json({error: 'Todo not found'});
  }

  //Deletando um todo da lista.
  user.todos.splice(todoIndex, 1);

  return response.status(204).json();  
});

module.exports = app;