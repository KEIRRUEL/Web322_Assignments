const path = require('path');
const express = require('express');
const app = express();
const HTTP_PORT = process.env.PORT || 4545;
const blog = require("./content-service");
app.use(express.static(path.join(__dirname, '/public')));

app.get('/',(req,res) =>{
    res.redirect('/about');
});

app.get('/about',(req,res) =>{
    res.sendFile(path.join(__dirname, '/views/about.html'));
});

app.get('/Home',(req,res) =>{
    res.sendFile(path.join(__dirname, '/views/home.html'));
});
blog.initialize().then(() =>
{
app.get('/articles',(req,res) =>{
    blog.getAllArticles().then(articles => res.json(articles))
    .catch((err) => {"Error"});
});

app.get('/categories',(req,res) =>{
    blog.getCategories().then(categories => res.json(categories))
    .catch((err) => {"Error"});
});
}).catch((error) => {"Error"});

app.listen(HTTP_PORT, () => console.log(`Express http server listening on port ${HTTP_PORT}`));