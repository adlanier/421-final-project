import dotenv from "dotenv";
import express from "express";
import pkg from "pg";
dotenv.config();



const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.SUPABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  }
});

pool
  .connect()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch(() => {
    console.log("Didn't connect");
  });


// TODO: Uncomment this after we figure out and add schema.

//(async () => {
//  try {
//    await pool.query(`
//    CREATE TABLES HERE!!!
//
//
//
//
//    `);
//    console.log("Tables created successfully");
//  } catch(error){
//    console.error("Error creating tables:", error);
//  }
//})();




// Initialize express app
const app = express();
const PORT = process.env.PORT || 8080;


// Middleware
app.use(express.static("public"));
app.use(express.json());

//TODO: Uncomment once we have frontend, and add frontend URL to .env

//app.use(
//  cors({
//    origin: process.env.FRONTEND_URL,
//    methods: ["GET", "POST", "DELETE"],
//    allowedHeaders: ["Content-Type", "Authorization"],
//  })
//);


// Endpoint to delete a record
app.delete("/delete-record/:id", async (req, res) => {
  //TODO: The record's id that we are deleting should be in the request parameters
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM table WHERE id = $1", [id]);
    res.status(200).json({ message: "Record deleted successfully" })

  } catch(err){
    console.log(err);
    res.status(500).json({ error: "Unable to delete record" })
  }
});

// Endpoint to update a record
app.post("/update-record/:id", async (req, res) => {
  //TODO: The values used to update this record should be sent in the request body
  // from a form. Make a form in the frontend
  const { id } = req.params;

});

// Endpoint to add a record
app.post("/add-record", async (req, res) => {
  try {
    const { } = req.body;

    //TODO: Add check to make sure all fields are found

    //TODO: Update this once we know the schema.

//    const result = await pool.query(
//      "INSERT INTO table (field1, field2, field3....) VALUES ($1, $2, ....) RETURNING *",
//      []
//    )

    res.status(201).json({ message: "Record added successfully" })
  } catch (err){
    console.log(err);
    res.status(500).json({ error: "Unable to add record" })
  }
});




app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
