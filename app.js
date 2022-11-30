const express = require('express');
const { main } = require('./src/index');

const app = express();
const port = 5000;

app.get('/webhook', (req, res) => {
    main(req, res)
})

app.listen(port, () => {
    console.log(`Now listening on port ${port}`);
}); 