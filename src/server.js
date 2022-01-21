const express = require("express");
const bodyParser = require("body-parser");
const path = require('path');
const app = express();

let { connectToDB, getDBClient } = require('./initDB');

try {
    connectToDB();
} catch {
    console.log("Could not connect to the database");
}

// refactored function for some common code within the routes
async function withDB(operation, res) {
    try {
        let db = getDBClient().db('my-blog');
        await operation(db);
    } catch (error) {
        res.status(500)
            .json({ message: "Error connecting with the database", error });
    }
}

app.use(bodyParser.json());
// where to serve our static assets from
app.use(express.static(path.join(__dirname, '/build')))

// get an article route
app.get('/api/articles/:name', async (req, res) => {
    let articleName = req.params.name;

    await withDB(async (db) => {
        let article = await db
            .collection('articles')
            .findOne({ name: articleName });
        if (article) res.status(200).json(article);
        else res
            .sendStatus(404);
    }, res)
})

// upvote an article
app.post('/api/articles/:name/upvote', async (req, res) => {
    let articleName = req.params.name;

    await withDB(async (db) => {
        let updatedArticle = await db
            .collection('articles')
            // this allows us to update and return the article in the db
            .findOneAndUpdate(
                { name: articleName },
                // use the increment function
                { $inc: { upvotes: 1 } },
                { returnDocument: "after" }
            );
        // the object returned has other info too - the updated article is in the
        // value property (it is null if article could not be found)
        if (updatedArticle.value) res.status(200).json(updatedArticle.value);
        else res
            .status(404)
            .json({ message: "Article not found" });
    }, res)
});

// post a comment
app.post('/api/articles/:name/add-comment', async (req, res) => {
    let { username, comment } = req.body;
    let articleName = req.params.name;

    await withDB(async (db) => {
        let updatedArticle = await db
            .collection('articles')
            // this allows us to update and return the article in the db
            .findOneAndUpdate(
                { name: articleName },
                // use the push function to add the comment
                { $push: { comments: { username, comment } } },
                { returnDocument: "after" }
            );
        // the object returned has other info too - the updated article is in the
        // value property (it is null if article could not be found)
        if (updatedArticle.value) res.status(200).json(updatedArticle.value);
        else res
            .status(404)
            .json({ message: "Article not found" });
    }, res)
})
// this routes all other requests to our app (index.html)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/build/index.html'));
})

app.listen(8000, () => console.log('Listening on port 8000'));