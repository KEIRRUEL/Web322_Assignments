// Import the 'fs' module for interacting with the file system
const fs = require("fs");
const { parse } = require("path");
const { Pool } = require('pg');
const pool = new Pool({
  user: 'neondb_owner',
  host: 'ep-lively-poetry-a5o8h4hu.us-east-2.aws.neon.tech',
  database: 'neondb',
  password: '7PcjRBb5vQCM',
  port: 5432, // Use Neon.tech's port if different
  ssl: { rejectUnauthorized: false }, // Required for Neon.tech
  });
// Arrays to store categories and articles data loaded from JSON files
let categories = [];
let articles = [];

// Function to initialize data by loading categories and articles from JSON files
function initialize() {
  return new Promise((resolve, reject) => {
    // Read the categories data from categories.json file
    fs.readFile("./data/categories.json", "utf8", (err, cat) => {
      if (err) return reject(err); // Reject the promise if an error occurs during file read
      categories = JSON.parse(cat); // Parse and store categories data
      categories.forEach(item=>{
        const text = 'INSERT INTO categories(id,name) VALUES($1,$2)';
        const values = [item.id,item.name];
      });
      // Nested readFile for articles.json
      // We nest the second file read inside the first because we want to ensure that categories.json
      // is successfully read and parsed before moving on to articles.json.
      // This way, we load both files sequentially and can handle any errors independently.
      fs.readFile("./data/articles.json", "utf8", (err, art) => {
        if (err) return reject(err); // Reject the promise if an error occurs during file read
        articles = JSON.parse(art); // Parse and store articles data
        articles.forEach(item=>{
          const text = 'INSERT INTO articles(id,title,content,author,published,category,articleDate) VALUES($1,$2,$3,$4,$5,$6,$7)';
          const values = [item.id,item.title,item.content,item.author,item.published,item.category,item.articledate];
        });
        // We call resolve() only once, after both files have been successfully read and parsed.
        // Calling resolve() here signifies that initialization is complete and both categories
        // and articles data are ready for use. If we called resolve() earlier, it would
        // prematurely indicate that initialization was complete before loading both files.
        resolve();
      });
    });
  });
}

// Function to get category name by ID
function getCategoryName(categoryId) {
  const category = categories.find(cat => cat.Id === categoryId);
  return category ? category.name : "Unknown";
}

async function addArticle(item) {
  const text = 'INSERT INTO articles(id,title,content,author,published,category,articleDate) VALUES($1,$2,$3,$4,$5,$6,$7)';
  const values = [item.id,item.title,item.content,item.author,item.published,item.category,item.articleDate]; 
  try {
    const res = await pool.query(text, values);
    return res.rows[0];
  } catch (err) {
    return await Promise.reject('No results returned');
  }
}

// Function to get articles by category and include the category name
function getArticlesByCategory(categoryId) {
  return new Promise((resolve, reject) => {
    const filteredArticles = articles.filter(
      (article) => article.category === parseInt(categoryId)
    );
    if (filteredArticles.length > 0) {
      // Add category name to each article
      const articlesWithCategoryName = filteredArticles.map(article => ({
        ...article,
        categoryName: getCategoryName(article.category) // Add category name
      }));
      resolve(articlesWithCategoryName);
    } else {
      reject("No results found");
    }
  });
}

function getAllArticles() {
  return pool.query('SELECT * FROM articles')
.then(res => res.rows)
.catch(err => Promise.reject('No results returned'));
}


// Function to get articles by minimum date and add category name
function getArticlesByMinDate(minDateStr) {
  return new Promise((resolve, reject) => {
    const minDate = new Date(minDateStr); // Convert the string to a Date object
    const filteredArticles = articles.filter(
      (article) => new Date(article.articleDate) >= minDate
    );

    if (filteredArticles.length > 0) {
      // Add category name to each filtered article
      const articlesWithCategoryName = filteredArticles.map(article => ({
        ...article,
        categoryName: getCategoryName(article.category) // Add category name
      }));
      resolve(articlesWithCategoryName);
    } else {
      reject("No results found");
    }
  });
}
function getArticleById(Id) {
  return new Promise((resolve, reject) => {
    const foundArticle = articles.find((article) => article.Id == parseInt(Id));
    if (foundArticle) resolve(foundArticle);
    else reject("no result returned");
  });
}

// Function to get only published articles by filtering the articles array
function getPublishedArticles() {
  return Promise.resolve(articles.filter((article) => article.published)); // Return only articles with `published: true`
}

// Function to get all categories
function getCategories() {
  return pool.query('SELECT * FROM categories')
.then(res => res.rows)
.catch(err => Promise.reject('No results returned')) // Return the categories array as a resolved promise
}
// Function to get all articles and add category name
function getArticles() {
  return Promise.resolve(articles.map(article => ({
    ...article,
    categoryName: getCategoryName(article.category) // Add categoryName based on categoryId
  })));
}

// Export the functions as an object to make them available to other files
module.exports = {
  initialize,
  getAllArticles,
  getCategories,
  getArticles,
  addArticle,
  getArticlesByCategory,
  getArticlesByMinDate,
  getArticleById,
  getCategoryName
};
