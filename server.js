const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const multer = require("multer");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const upload = multer({ dest: "uploads/" });

// SIMPLE ADMIN CREDENTIALS (change later)
const ADMIN_USER = "admin";
const ADMIN_PASS = "1234";

let loggedIn = false;

const db = new sqlite3.Database("admissions.db");

db.run(`
CREATE TABLE IF NOT EXISTS applications (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 student_name TEXT,
 parent_name TEXT,
 school TEXT,
 document TEXT
)
`);

app.post("/login", (req,res)=>{
 if(req.body.username === ADMIN_USER && req.body.password === ADMIN_PASS){
   loggedIn = true;
   res.redirect("/admin.html");
 } else {
   res.send("Wrong credentials");
 }
});

app.post("/apply", upload.single("document"), (req, res) => {

 const student_name = req.body.student_name;
 const parent_name = req.body.parent_name;
 const school = req.body.school;
 const document = req.file.filename;

 db.run(
   "INSERT INTO applications VALUES (NULL,?,?,?,?)",
   [student_name, parent_name, school, document]
 );

 res.send("Application Submitted Successfully!");
});

app.get("/admin-data",(req,res)=>{
 if(!loggedIn){
   return res.sendStatus(401);
 }

 db.all("SELECT * FROM applications",(err,rows)=>{
   res.json(rows);
 });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});

