// (1) Require Modules 
const express = require('express');

// (2) create app
const app = express();

// (3) configure app
let port = 3000;
let host = 'localhost';
app.set('view engine', 'ejs');


// (4) Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// (5) Routes
app.get('/', (req, res) => {
    res.render('index');
});

// (6) Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

