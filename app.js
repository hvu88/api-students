const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const PORT = 8000;

// Middleware para leer datos del body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Conexión a la base de datos
const db = new sqlite3.Database('./students.sqlite', (err) => {
  if (err) return console.error(err.message);
  console.log('Conectado a la base de datos SQLite.');
});

// Crear tabla si no existe
db.run(`CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  firstname TEXT NOT NULL,
  lastname TEXT NOT NULL,
  gender TEXT NOT NULL,
  age TEXT
)`);

// GET y POST /students
app.route('/students')
  .get((req, res) => {
    const sql = 'SELECT * FROM students';
    db.all(sql, [], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  })
  .post((req, res) => {
    const { firstname, lastname, gender, age } = req.body;
    const sql = `INSERT INTO students (firstname, lastname, gender, age) VALUES (?, ?, ?, ?)`;
    const params = [firstname, lastname, gender, age];
    db.run(sql, params, function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).send(`Student with id: ${this.lastID} created successfully`);
    });
  });

// GET, PUT y DELETE /student/:id
app.route('/student/:id')
  .get((req, res) => {
    const id = req.params.id;
    const sql = 'SELECT * FROM students WHERE id = ?';
    db.get(sql, [id], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (row) res.json(row);
      else res.status(404).send('Student not found');
    });
  })
  .put((req, res) => {
    const id = req.params.id;
    const { firstname, lastname, gender, age } = req.body;
    const sql = `UPDATE students SET firstname = ?, lastname = ?, gender = ?, age = ? WHERE id = ?`;
    const params = [firstname, lastname, gender, age, id];
    db.run(sql, params, function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        id,
        firstname,
        lastname,
        gender,
        age
      });
    });
  })
  .delete((req, res) => {
    const id = req.params.id;
    const sql = 'DELETE FROM students WHERE id = ?';
    db.run(sql, [id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.send(`The Student with id: ${id} has been deleted.`);
    });
  });

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
