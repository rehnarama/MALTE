// index.ts

import express from 'express';

const app = express();
const port = 4000;

app.get('/', (req, res) => {
  res.send('YAY! It actually works!');
});

app.listen(port, err => {
  if (err) {
    return console.error(err);
  }
  return console.log(`Server is listening on ${port}`);
});
