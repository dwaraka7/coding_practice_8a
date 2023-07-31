const express = require("express");
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");

const app = express();
let db;
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");

let initializeDBandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("TODOs Server running at http:localhost:3000/");
    });
  } catch (e) {
    console.log(`Here is ERRoR:=> ${e.message}`);
    process.exit(1);
  }
};

initializeDBandServer();

//API 1
app.get("/todos/", async (req, res) => {
  const { search_q = "", status, priority } = req.query;
  let todoQuery = "";
  if (req.query.status !== undefined && req.query.priority !== undefined) {
    todoQuery = `
    select * from todo
    WHERE
        todo LIKE "%${search_q}%"
        AND status = '${status}'
    AND priority = '${priority}';`;
  } else if (req.query.priority !== undefined) {
    todoQuery = `
    select * from todo
    WHERE
        todo LIKE "%${search_q}%"
        AND priority = '${priority}';`;
  } else if (req.query.status !== undefined) {
    todoQuery = `
    select * from todo
    WHERE
        todo LIKE "%${search_q}%"
        AND status = '${status}';`;
  } else if (req.query.search_q !== undefined) {
    todoQuery = `
        select * from todo
        WHERE
            todo LIKE "%${search_q}%";`;
  }

  const todoArray = await db.all(todoQuery);
  res.send(todoArray);
});

//API 2
app.get("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const todoIdQuery = `
    select * from todo where id=${todoId};`;
  const todo = await db.get(todoIdQuery);
  res.send(todo);
});

//API 3
app.post("/todos/", async (req, res) => {
  const { todo, priority, status } = req.body;
  const newTodoQuery = `
    INSERT INTO
     todo (todo,priority,status)
    VALUES
        (
        '${todo}',
        '${priority}',
        '${status}'
        );`;
  const todoRes = await db.run(newTodoQuery);
  const todoNewId = todoRes.lastID;
  res.send({ todoId: todoNewId });
  //   res.send("Todo Successfully Added");
});

// API 4
app.put("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  let columnName = "";
  let updateTodoQuery = "";
  //   console.log(req.body.status);
  switch (true) {
    case req.body.todo !== undefined:
      columnName = "Todo";
      updateTodoQuery = `
        update todo
        set
            todo = '${req.body.todo}'
        where id = ${todoId};`;
      res.send(`Todo Updated`);
      break;
    case req.body.status !== undefined:
      columnName = "Status";
      updateTodoQuery = `
        update todo
        set
            status = '${req.body.status}'
        where id = ${todoId};`;
      res.send(`Status Updated`);
      break;
    case req.body.priority !== undefined:
      columnName = "Priority";
      updateTodoQuery = `
        update todo
        set
            priority = '${req.body.priority}'
        where id = ${todoId};`;
      res.send(`Priority Updated`);
      break;
  }

  await db.run(updateTodoQuery);
});

//API 5
app.delete("/todos/:todoId/", async (req, res) => {
  const { todoId } = req.params;
  const deleteQuery = `
    delete from todo where id=${todoId};`;
  await db.run(deleteQuery);
  res.send(`Todo Deleted`);
});

//TEST
app.get("/all/", async (req, res) => {
  const todoIdQuery1 = `
    SELECT * FROM todo ORDER BY id;`;
  const todo1 = await db.all(todoIdQuery1);
  res.send(todo1);
});

module.exports = app;
