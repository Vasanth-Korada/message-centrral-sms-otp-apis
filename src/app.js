const express = require('express');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/routes');

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.use('/auth', authRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
