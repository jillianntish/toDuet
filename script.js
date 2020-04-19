//The Model only deals with the actual data and modifies it
class Model {
  constructor() {
    // The state of the model begins with an array of todo objects, prepopulated with some data
    //Just like what comes back from an API!
    this.todos = JSON.parse(localStorage.getItem('todos')) || []
  }

  //CRUD Functionality
  //CREATE

  _commit(todos) {
    this.onTodoListChanged(todos)
    localStorage.setItem('todos', JSON.stringify(todos))
  }

  addTodo(userAddedToDoItem) {
    const todo = {
      id: this.todos.length > 0 ? this.todos[this.todos.length - 1].id + 1 : 1,
      text: userAddedToDoItem,
      complete: false,
    }
    //sets up new todo objects to add to the data
    this.todos.push(todo)
    console.log(`Hurray! '${userAddedToDoItem}' is now on your list of things to do`)
    this.onTodoListChanged(this.todos)
    this._commit(this.todos)

  }
//UPDATE
  editTodo(id, updatedText) {
    this.todos = this.todos.map(todo =>
      todo.id === id ? { id: todo.id, text: updatedText, complete: todo.complete } : todo
    )
    this.onTodoListChanged(this.todos)
    this._commit(this.todos)

  }

  // Filters a todo out of the array by id
  deleteTodo(id) {
    this.todos = this.todos.filter(todo => todo.id !== id)
    this.onTodoListChanged(this.todos)
    this._commit(this.todos)
  }
  
  // Flip the "complete" boolean on the specified todo
  toggleTodoStatus(id) {
    this.todos = this.todos.map(todo =>
      todo.id === id ? { id: todo.id, text: todo.text, complete: !todo.complete } : todo
    )
    this.onTodoListChanged(this.todos)
    this._commit(this.todos)

  }

  bindTodoListChanged(callback) {
    this.onTodoListChanged = callback
  }
}
//The Data as it appears to the User
//Anything related to the DOM lives in the View
//Looking at you event listeners
class View {
  constructor() {
    // attach the app to the HTML 'root' element 
    this.app = this.getElement('#root')

    // The title of the app
    //TODO: fix the title to separate concerns
    this.title = this.createElement('h1')
    this.title.textContent = 'To Duet:'

    // The form, with a [type="text"] input, and a submit button
    this.form = this.createElement('form')

    this.input = this.createElement('input')
    this.input.type = 'text'
    this.input.placeholder = 'What should we do next?'
    this.input.name = 'todo'

    this.submitButton = this.createElement('button')
    this.submitButton.textContent = 'Submit'

    // The visual representation of the todo list
    this.todoList = this.createElement('ul', 'todo-list')

    // Append the input and submit button to the form
    this.form.append(this.input, this.submitButton)

    // Append the title, form, and todo list to the app
    this.app.append(this.title, this.form, this.todoList)

    this._temporaryTodoText
  this._initLocalListeners()
  }

  // Update temporary state
_initLocalListeners() {
  this.todoList.addEventListener('input', event => {
    if (event.target.className === 'editable') {
      this._temporaryTodoText = event.target.innerText
    }
  })
}

  // Send the completed value to the model
bindEditTodo(handler) {
  this.todoList.addEventListener('focusout', event => {
    if (this._temporaryTodoText) {
      const id = parseInt(event.target.parentElement.id)

      handler(id, this._temporaryTodoText)
      this._temporaryTodoText = ''
    }
  })
}
    createElement(tag, className){
      const element = document.createElement(tag)
      if (className) element.classList.add(className)
      return element;
    }
    // Retrieve an element from the DOM
  getElement(selector) {
    const element = document.querySelector(selector)
    return element
  }

  get _todoText() {
    return this.input.value
  }
  
  _resetInput() {
    this.input.value = ''
  }

  bindAddTodo(handler) {
    this.form.addEventListener('submit', event => {
      event.preventDefault()
  
      if (this._todoText) {
        handler(this._todoText)
        this._resetInput()
      }
    })
  }
  
  bindDeleteTodo(handler) {
    this.todoList.addEventListener('click', event => {
      if (event.target.className === 'delete') {
        const id = parseInt(event.target.parentElement.id)
  
        handler(id)
      }
    })
  }
  
  bindToggleTodo(handler) {
    this.todoList.addEventListener('change', event => {
      if (event.target.type === 'checkbox') {
        const id = parseInt(event.target.parentElement.id)
  
        handler(id)
      }
    })
  }

  displayTodos(todos) {
// Delete all nodes
while (this.todoList.firstChild) {
  this.todoList.removeChild(this.todoList.firstChild)
}

// Show default message
if (todos.length === 0) {
  const p = this.createElement('p')
  p.textContent = 'Nothing to do! Add a task?'
  this.todoList.append(p)
} else {
    // Create todo item nodes for each todo in state
    todos.forEach(todo => {
      const li = this.createElement('li')
      li.id = todo.id
  
      // Each todo item will have a checkbox you can toggle
      const checkbox = this.createElement('input')
      checkbox.type = 'checkbox'
      checkbox.checked = todo.complete
  
      // The todo item text will be in a contenteditable span
      const span = this.createElement('span')
      span.contentEditable = true
      span.classList.add('editable')
  
      // If the todo is complete, it will have a strikethrough
      if (todo.complete) {
        const strike = this.createElement('s')
        strike.textContent = todo.text
        span.append(strike)
      } else {
        // Otherwise just display the text
        span.textContent = todo.text
      }
      // The todos will also have a delete button
      const deleteButton = this.createElement('button', 'delete')
      deleteButton.textContent = 'Delete'
      li.append(checkbox, span, deleteButton)
      // Append nodes to the todo list
      this.todoList.append(li)
    })
  }
}
}

class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.model.bindTodoListChanged(this.onTodoListChanged)
    this.onTodoListChanged(this.model.todos);
    this.view.bindAddTodo(this.handleAddTodo)
    this.view.bindDeleteTodo(this.handleDeleteTodo)
    this.view.bindToggleTodo(this.handleToggleTodo)
    this.view.bindEditTodo(this.handleEditTodo)
  }
  onTodoListChanged = todos => {
    this.view.displayTodos(todos)
  }
  handleAddTodo = todoText => {
    this.model.addTodo(todoText)
  }
  
  handleEditTodo = (id, todoText) => {
    this.model.editTodo(id, todoText)
  }
  
  handleDeleteTodo = id => {
    this.model.deleteTodo(id)
  }
  
  handleToggleTodo = id => {
    this.model.toggleTodoStatus(id)
  }
}

const app = new Controller(new Model(), new View())