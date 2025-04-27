const express = require('express');
const path = require('path');
const livereload = require('livereload');
const connectLivereload = require('connect-livereload');
const test = require('./backend/database.js')

const Database = require('better-sqlite3');
const db = new Database('tasks.db'); 


const app = express();
const PORT = process.env.PORT || 3000;


const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, 'public'));
liveReloadServer.watch(path.join(__dirname, 'views'));

app.use(connectLivereload());

app.use(express.static(path.join(__dirname, 'public')));

// Route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

//for development only
liveReloadServer.server.once('connection', () => {
  
  setTimeout(() => {
    liveReloadServer.refresh('/');
  }, 100);
});



//create table if it does not exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL,
    due_date TEXT NOT NULL
  )`).run();


//use json 
app.use(express.json()); 

//create task in db
app.post('/api/createTask', async (req, res) => {
  const {title,description,status,due} = req.body;
  const stmt = db.prepare(`INSERT INTO tasks (title, description, status, due_date) VALUES (?, ?, ?, ?)`);
  const result = stmt.run(title, description, status, due);

  if (result.changes > 0) {
    res.json({ message: 'Task created successfully' });
  } else {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

//get specific task by id
app.get('/api/getTaskbyid', (req, res) => {
  const id = req.query.id;
  const stmt = db.prepare(`SELECT * FROM tasks WHERE id = ?`);
  const task = stmt.get(id);

  if (task) {
    res.json(task);
  } else {
    res.status(404).json({ error: 'Task not found' });
  }

});


//get all tasks from db
app.get('/api/getAllTasks', (req, res) => {

  const stmt = db.prepare(`SELECT * FROM tasks`);
  const tasks = stmt.all();

  if (tasks) {
    res.json(tasks);
  } else {
    res.status(404).json({ error: 'No Tasks Found' });
  }

});

//update status of task done via id 

app.put('/api/updateTask', (req, res) => {
  const id = req.query.id;
  const status = req.query.status;
  const stmt = db.prepare(`UPDATE tasks SET status = ? WHERE id = ?`);
  const task = stmt.run(status, id);
  if (task.changes > 0) {
    res.json({ message: 'Success' });
  } else {
    res.status(404).json({ error: 'Task not found' });
  }

}
);

//delete task by id
app.delete('/api/deleteTask', (req, res) => {
  const id = req.query.id;
  const stmt = db.prepare(`DELETE FROM tasks WHERE id = ?`);
  const task = stmt.run(id);
  if (task.changes > 0) {
    res.json({ message: 'Task deleted successfully' });
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
}
);





app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});



