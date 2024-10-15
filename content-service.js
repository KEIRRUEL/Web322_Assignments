const fs = require("fs");

let articles =  []
let categories =  []
module.exports = 
{
    initialize: () => 
    {
        return new Promise((resolve,reject) => 
        {
            fs.readFile('./data/articles.json', 'utf8', (err, data) => 
                {
                    if (err)
                    {
                        reject("unable to read file");
                        console.log(data);
                    }
                    try
                    {
                        articles = JSON.parse(data);
                        resolve("success");
                    }
                    catch (Error)
                    {
                        reject("unable to read file");
                        return;
                    }
                })
            fs.readFile('./data/categories.json', 'utf8', (err, data) => 
                {
                    if (err)
                    {
                        reject("unable to read file");
                        console.log(data);
                    }
                    try
                    {
                        categories = JSON.parse(data);
                        resolve("success");
                    }
                    catch (Error)
                    {
                        reject("unable to read file");
                        return;
                    }
                 })
        }
    )},
    getPublishedArticles: () =>
    {
        return new Promise((resolve,reject) =>
        {
            const publishedArticle = articles.filter(article => article.published);
            if(publishedArticle.length > 0)
            {
                resolve(publishedArticle);
            }
            else
            {
                reject("no results returned");
            }
        }
    )},
    getAllArticles: () =>
    {
        return new Promise((resolve, reject) =>
        {
            if(articles.length > 0)
            {
                resolve(articles);
            }
            else
            {
                reject("no results returned");
            }
        }
    )
    },
    getCategories: () =>
        {
            return new Promise((resolve, reject) =>
            {
                if(categories.length > 0)
                {
                    resolve(categories);
                }
                else
                {
                    reject("no results returned");
                }
            }
        )
        }
}