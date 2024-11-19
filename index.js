const path = require('path');
const express = require('express');
const app = express();
const HTTP_PORT = process.env.PORT || 4545;
const blog = require("./content-service");
app.use(express.static(path.join(__dirname, '/public')));

const multer = require("multer"); 
const cloudinary = require('cloudinary').v2; 
const streamifier = require('streamifier'); 

cloudinary.config({ 
   cloud_name: 'dilreqd3n', 
   api_key: '923798686465718', 
   api_secret: 'RC9LSh6GmnViR_l23qFOSFWBjVI', 
   secure: true 
});

const upload = multer(); // No disk storage, files are stored in memory 
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
    let filter = {};
    if (req.query.getArticlesByCategory){
        filter.getArticlesByCategory = req.query.getArticlesByCategory;
    }
    if (req.query.getArticlesByMinDate){
        filter.getArticlesByMinDate =req.query.getArticlesByMinDate;
    }
    blog.getArticles(filter).then(articles => res.json(articles))
    .catch((err) => {"Error"});
});

app.get('/articles/id',(req,res) =>{
    blog.getArticleById(req.params.id).then(articles => res.json(articles))
    .catch((err) => {"Error"});
});

app.get('/categories',(req,res) =>{
    blog.getCategories().then(categories => res.json(categories))
    .catch((err) => {"Error"});
});

app.get('/articles/add', (req, res) => { 
    res.sendFile(path.join(__dirname, 'views', 'addArticle.html')); 
 });

 app.post('/articles/add', upload.single("image"), (req, res) => { // Add article to content-service 
     if (req.file) { // request file exists 
         let streamUpload = (req) => { // made streamupload request 
             return new Promise((resolve, reject) => { // made a promise for the streamupload 
                 let stream = cloudinary.uploader.upload_stream( // declared stream for cloudinary 
                     (error, result) => { // error and result 
                         if (result) resolve(result); // if result id a success contibue to the output
                         else reject(error); // if failed, reject the promise 
                     } 
                 ); 
                 streamifier.createReadStream(req.file.buffer).pipe(stream); // streamifier the request file to the stream 
             }); 
         };

         async function upload(req) { // async upload request 
             let result = await streamUpload(req); // declare result from the stream upload 
             return result; // Return the uploaded image url 
         } 
         upload(req).then((uploaded) => { // Upload successful, add article to content-service 
             processArticle(uploaded.url); // Redirect to articles page after successful upload 
         }).catch(err => res.status(500).json({ message: "Image upload failed", error: err })); // Error uploading
     } else { 
         processArticle(""); // Redirect to articles page without image if no image was provided 
     }
     function processArticle(imageUrl) { // Get the image
            req.body.image = imageUrl; // Set the image URL in the request body 
            // Add article to content-service 
            blog.addArticle((req.body))  // Replace with actual content service method
            .then(() => res.redirect('/articles')) // Redirect to articles page after successful article creation 
            .catch(err => res.status(500).json({ message: "Article creation failed", error: err })); // Error creating article
    } 
 });
});
app.listen(HTTP_PORT, () => console.log(`Express http server listening on port ${HTTP_PORT}`));