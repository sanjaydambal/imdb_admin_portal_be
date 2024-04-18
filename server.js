const express = require('express');

const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();
const app = express();
const jwt = require('jsonwebtoken');
const PORT = process.env.PORT || 4000;
const cors = require('cors');
app.use(cors());
app.use(express.json())
// PostgreSQL connection pool
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432, // Default PostgreSQL port
    ssl: {
        rejectUnauthorized: false, // Set to false if using self-signed certificates
        // You may need to provide other SSL options such as ca, cert, and key
        // Example:
        // ca: fs.readFileSync('path/to/ca-certificate.crt'),
        // cert: fs.readFileSync('path/to/client-certificate.crt'),
        // key: fs.readFileSync('path/to/client-certificate.key')
    },
  });

  const createTableQuery = `
  CREATE TABLE IF NOT EXISTS movies (
    id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        release_date DATE,
        genre VARCHAR(100),
        poster_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

pool.query(createTableQuery)
  .then(() => console.log('Table created successfully'))
  .catch(err => console.error('Error creating table:', err.message));

  pool.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch(error => console.error('Error connecting to PostgreSQL:', error));

  app.post('/api/movies',async(req,res)=> {
    try{
    const {title,description,release_date,genre,poster_url} = req.body;
    const query = `insert into movies(title,description,release_date,genre,poster_url) values($1,$2,$3,$4,$5) returning *`;
    const result = await pool.query(query,[title,description,release_date,genre,poster_url])
    res.status(201).json({success:true,movie:result.rows[0]})
}catch (error) {
    console.error('Error storing movie details:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
}
});

app.get('/api/movies',async(req,res)=>{
    try{
        const query = `select * from movies`;
        const result = await pool.query(query)
        res.status(201).json({success:true,movie:result.rows})
    }catch(err){
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
})

app.delete('/api/movies/:id',async(req,res)=>{
    const movieId = req.params.id
    try{
const checkQuery = `select * from movies where id=$1`;
const checkRes = await pool.query(checkQuery,[movieId])
if(checkRes.rows.length === 0){
    return res.status(404).json({success:false,error:'movie not found'})
}
const deleteQuery = `delete from movies where id=$1`;
await pool.query(deleteQuery,[movieId])
res.status(201).json({success:true,message:"movie deleted successfully"})
    }catch(err){
res.status(500).json({success:false,err:"internal server error"})
    }
})
app.listen(PORT,()=>{
console.log(`server is running on ${PORT} `)
})