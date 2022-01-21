const { MongoClient } = require("mongodb");

// Replace the following with values for your environment.
const username = encodeURIComponent("blog-app");
const password = encodeURIComponent("blog-app");
const clusterUrl = "localhost:27017";

const authMechanism = "DEFAULT";

// connection string
const uri =
    `mongodb://${ username }:${ password }@${ clusterUrl }/?authMechanism=${ authMechanism }`;

// Create a new MongoClient
const client = new MongoClient(uri);

// Function to connect the client
async function connectToDB() {
    try {
        // Connect the client to the server
        await client.connect();
        console.log("Connected successfully to database");
    } catch (error) {
        throw new Error(error);
    }
}

function getDBClient() {
    return client;
}

module.exports = { connectToDB, getDBClient };