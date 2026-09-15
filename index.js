import express from "express";
import "dotenv/config";

const app = express();
const PORT = 3000;

app.get("/", async (req, res) => {
  try {
    res.send("Hello Bitch!");
  } catch (err) {
    console.log(err.message);
  }
});

app.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
  } catch (error) {}
});

app.listen(PORT, () =>
  console.info(`Server ready on http://localhost:${PORT}`),
);
