// Import the Express library
const express = require("express");

const multer = require("multer");

const cloudinary = require("cloudinary").v2;

const streamifier = require("streamifier");

cloudinary.config({ 
  cloud_name: 'dilreqd3n', 
  api_key: '923798686465718', 
  api_secret: 'RC9LSh6GmnViR_l23qFOSFWBjVI', 
  secure: true 
});
const upload = multer();

// Import the 'path' module to handle file paths
const path = require("path");
// Import the custom data handling module, assumed to manage categories and articles
const contentService = require("./content-service");

// Create an Express application instance
const app = express();

// Set the HTTP port to an environment variable or default to 3838
const HTTP_PORT = process.env.PORT || 3838;

app.set("views",__dirname + "/views");// trying to debug this goofy ahh vercel problem.
app.set('view engine', 'ejs');
// Serve static files from the "public" directory (e.g., CSS, JS files, images)
app.use(express.static("public"));

// Route for the root path, redirecting to the "/about" page
app.get("/", (req, res) => {
  res.redirect("/about");
});

// Route for the "/about" page, serving the "about.html" file
app.get("/about", (req, res) => {
  res.render(path.join(__dirname, "/views/about.ejs"));
});

// Route for the "/categories" endpoint, returning categories in JSON format
app.get("/categories", (req, res) => {
  contentService.getCategories().then((data) => {
    res.render('categories', { categories: data });
  }).catch((err) => {
    res.status(404).json({ message: err });
  });
});

app.get('/articles', (req, res, next) => {
  if (req.query.categoryId) {
      // Handle filtering by category
      contentService.getArticlesByCategory(req.query.categoryId)
          .then((article) => {
            res.render('article', { user: article }); // filtered by category
          })
          .catch((err) => {
              res.status(404).json({ message: err });
          });
  } else if (req.params.minDateStr) {
      // Handle filtering by minDate
      app.get("/article/:?minDateStr", (req, res) => { 
      contentService.getArticlesByMinDate(req.params["?minDateStr"])
      .then((article) => {
        if (article.published) { 
          res.render('article', { user: article}); // updated the getter for the articles.json. Only retrieve the given "Id".
        } else { 
          res.status(404).send('Article not found'); }
      })
      .catch((err) => {
        res.status(404).json({ message: err });
      });
    });
  } else {
      // If no query parameters, fetch all articles
      contentService.getAllArticles()
          .then((data) => {
            res.render('articles', { articles: data }); // rendering all articles
          })
          .catch((err) => {
              res.status(404).json({ message: err });
          });
  }
});

app.get("/article/:id", (req, res) => { 
  contentService.getArticleById(req.params.id)
    .then((article) => {
      if (article.published) { 
        res.render('article', { user: article}); // updated the getter for the articles.json. Only retrieve the given "Id".
      } else { 
        res.status(404).send('Article not found'); }
    })
    .catch((err) => {
      res.status(404).json({ message: err });
    });
});
app.put('/articles/:id', (req, res) => {
  contentService.getArticleById(req.params.id)
  const article = req.body;
  const text = 'UPDATE articles SET title = $1, content = $2, author = $3, published = $4, category = $5, articledate = $6, category_id = $7 WHERE id = $8 RETURNING *';
  const values = [article.title, article.content, article.author, article.published, article.category, article.articledate, article.category_id, id];
  Pool.query(text, values)
    .then(res.render('put', { data: values}))
   .catch(err => Promise.reject('No results returned'));
});

app.delete('/articles/:id', (req, res) => {
  contentService.getArticleById(req.params.id)
  const text = 'DELETE FROM articles WHERE id = $1 RETURNING *';
  const values = [id];
  Pool.query(text, values)
   .then(res.render('delete', { data: values}))
   .catch(err => Promise.reject('No results returned'));
});
app.get("/articles/add", (req, res) => {
  // res.render(path.join(__dirname, "views", "addArticle.ejs"));
  // res.render('addArticle',{ categories });
  contentService.getCategories()
          .then((articleData) => {
            res.render('addArticle', { categories: articleData }); // rendering all articles
          })
          .catch((err) => {
              res.status(404).json({ message: err });
          });
});

app.post('/articles/add', upload.single("featureImage"), (req, res) => {
  if (req.file) {
      let streamUpload = (req) => {
          return new Promise((resolve, reject) => {
              let stream = cloudinary.uploader.upload_stream(
                  { folder: 'articles' }, // Optional: Store in a specific folder
                  (error, result) => {
                      if (result) resolve(result);
                      else reject(error);
                  }
              );
              streamifier.createReadStream(req.file.buffer).pipe(stream);
          });
      };

      async function uploadToCloudinary(req) {
          let result = await streamUpload(req);
          return result.url; // Return the uploaded image URL
      }

      uploadToCloudinary(req)
          .then((imageUrl) => {
              processArticle(imageUrl);
          })
          .catch((err) => {
              res.status(500).json({ message: 'Image upload failed', error: err });
          });
  } else {
      processArticle(""); // If no image uploaded, pass an empty string
  }

  function processArticle(imageUrl) {
      // Build the article object
      const articleData = {
          title: req.body.title,
          content: req.body.content,
          category: req.body.category,
          published: req.body.published === 'on', // Checkbox value
          featureImage: imageUrl || "", // Use the uploaded image URL or empty string
          postDate: new Date().toISOString() // Current timestamp
      };

      // Call content-service to add the article
      contentService.addArticle(articleData)
          .then(() => res.redirect('/articles')) // Redirect to articles page on success
          .catch((err) => res.status(500).json({ message: 'Failed to add article', error: err }));
  }
});


// Initialize the data in the storeData module, then start the server
contentService.initialize().then(() => {
  app.listen(HTTP_PORT); // Start server and listen on specified port
  console.log("server listening @ http://localhost:" + HTTP_PORT);
});

// Export the Express app instance (useful for testing or external usage)
module.exports = app;