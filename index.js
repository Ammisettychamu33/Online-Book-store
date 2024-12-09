import express from "express";
import mysql from "mysql";

const app = express();

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "contact_db"
});

// Create table if it does not exist
db.query(`
  CREATE TABLE IF NOT EXISTS cart (
    id INT AUTO_INCREMENT,
    product VARCHAR(255),
    price DECIMAL(10, 2),
    quantity INT,
    total DECIMAL(10, 2),
    PRIMARY KEY (id)
  );
`, (err, results) => {
  if (err) {
    console.error('error creating table:', err);
  } else {
    console.log('Table created successfully');
  }
});

// Create table if it does not exist
db.query(`
  CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT,
    name VARCHAR(255),
    email VARCHAR(255),
    message TEXT,
    PRIMARY KEY (id)
  );
`, (err, results) => {
  if (err) {
    console.error('error creating table:', err);
  } else {
    console.log('Table created successfully');
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Server is ready");
});

app.post("/cart", (req, res) => {
  const { product, price, quantity = 1 } = req.body;

  if (!product || !price) {
    res.status(400).send("Please fill in all the required fields");
    return;
  }

  const total = price * quantity;

  db.query(
    "INSERT INTO cart (product, price, quantity, total) VALUES (?, ?, ?, ?)",
    [product, price, quantity, total],
    (err, results) => {
      if (err) {
        console.error(`Error inserting cart details: ${err.message}`);
        console.error(`Error stack: ${err.stack}`);
        res.status(500).send({ message: "Error submitting your cart" });
      } else {
        res.send({ message: "Your product has been successfully added to cart and will reach you soon!" });
        console.log("Your Product Will Reach you Soon!")
      }
    }
  );
});

app.post("/contact", (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    res.status(400).send("Please fill in all the required fields");
    return;
  }

  db.query(
    "INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)",
    [name, email, message],
    (err, results) => {
      if (err) {
        console.error(`Error inserting contact details: ${err.message}`);
        console.error(`Error stack: ${err.stack}`);
        res.status(500).send("Error submitting your message");
      } else {
        res.send("Thank you for contacting us! We will get back to you soon.");
      }
    }
  );
});

app.get("/cart/display", (req, res) => {
  db.query("SELECT * FROM cart", (err, results) => {
    if (err) {
      console.error(`Error fetching cart data: ${err.message}`);
      console.error(`Error stack: ${err.stack}`);
      res.status(500).send({ message: "Error fetching cart data" });
    } else {
      res.send(results);
    }
  });
});

app.delete("/cart/remove/:id", (req, res) => {
  const id = req.params.id;
  db.query(
    "DELETE FROM cart WHERE id = ?",
    [id],
    (err, results) => {
      if (err) {
        console.error(`Error removing product from cart: ${err.message}`);
        console.error(`Error stack: ${err.stack}`);
        res.status(500).send({ message: "Error removing product from cart" });
      } else {
        res.send({ message: "Product removed from cart successfully" });
      }
    }
  );
});

app.post("/cart/checkout", (req, res) => {
  db.query("SELECT * FROM cart", (err, results) => {
    if (err) {
      console.error(`Error fetching cart data: ${err.message}`);
      console.error(`Error stack: ${err.stack}`);
      res.status(500).send({ message: "Error fetching cart data" });
    } else {
      res.send({ message: "Checkout successful", data: results });
    }
  });
});

const port = process.env.PORT || 3001; // Change the port number

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});