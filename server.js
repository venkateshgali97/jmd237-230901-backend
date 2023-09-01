const express = require('express')
const {config} = require('./config.js')
const app = express()
const sql = require('mssql');
var cors = require('cors')


//For databse connection
const pool = new sql.ConnectionPool(config);
pool.connect(err => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Connected to the database');
  }
});

app.use(express.json());
app.use(cors())



app.get('/',(req,res) =>{
    res.send("Hi from Port number 8000")
})



// for user Details 
app.get('/user',async(req,res) =>{
  const email = req.query.email

  try{
    const findUser = `select * from Employees
    where email = @email`
    const request = pool.request();
    request.input('email', sql.NVarChar(255), email);
    const result = await request.query(findUser);
    res.send(result.recordset)
  }catch(err){
    console.log(err)
  }
  
})

//For creating new user
app.post('/newUser', async (req, res) => {
    console.log(req.body)
   
  try {
    const { name, email, password, phone_number } = req.body;
    // Create a new user query

    const findUser = `select * from Employees
    where email = @email`
    const request = pool.request();
    request.input('email', sql.NVarChar(255), email);
    const result = await request.query(findUser);
    if (result.recordset.length == 0){
      const createNewUserQuery = `
      INSERT INTO Employees (name, email, password, phone_number)
      VALUES ( @name,@email,@password,@phone_number)
    `;
        const request1 = pool.request();
        request1.input('name', sql.NVarChar(255), name);
        request1.input('email', sql.NVarChar(255), email);
        request1.input('password', sql.NVarChar(255), password);
        request1.input('phone_number', sql.NVarChar(255), phone_number);
        const result = await request1.query(createNewUserQuery);
        res.status(201)
        res.send("user created")
          
    }else{
      res.status(404)
      res.send("user existed")
    }
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


//For login 
app.post('/login', async(req,res) =>{
  try{
    const { email, password} = req.body;
    const findUser = `select * from Employees
    where email = @email`
    const request = pool.request();
    request.input('email', sql.NVarChar(255), email);
    const result = await request.query(findUser);
    console.log(result.recordset.length)
    if (result.recordset.length == 0){
      res.status(400).json({mesage : "email not found"})
    }else{
      if (result.recordset[0].password == password){
        res.status(201).json({mesage : "Login Successful"})
      }else{
        res.status(404).json({message:"Login Failed"})
      }
    }
  }catch(error){
    console.error('Error Login user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
})

//For creating the server
app.listen(8001, () => console.log("Server started..."));




























// function createTable() {
//   const createTableQuery = `
//     CREATE TABLE users (
//       id INT IDENTITY(1,1) PRIMARY KEY,
//       email VARCHAR(255) NOT NULL,
//       password VARCHAR(255) NOT NULL,
//       phone_number VARCHAR(20)
//     );
//   `;



//   const request = pool.request();
//   request.query(createTableQuery, (error, results) => {
//     if (error) {
//       console.error('Error creating table:', error);
//     } else {
//       console.log('Table users created or already exists');

//     }

//   });

// }




