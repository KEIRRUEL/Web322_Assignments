const path = require('path');
const express = require('express');
const app = express();
const HTTP_PORT = process.env.PORT || 4545;
app.use(express.static('public'));

app.get('/',(req,res) =>{
    res.redirect('/about');
});

app.get('/about',(req,res) =>{
    res.sendFile(path.join(__dirname, '/views/about.html'));
});

app.listen(HTTP_PORT, () => console.log(`Express http server listening on port ${HTTP_PORT}`));