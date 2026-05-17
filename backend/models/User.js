const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
},
    {
        timestamps: true
    }
);

module.exports = mongoose.model("User", userSchema);


/*
This file defines: How User data will look inside the MongoDB database. It uses Mongoose to create a schema for the User model, which includes fields for name, email, and password. The email field is set to be unique to prevent duplicate entries. The timestamps option automatically adds createdAt and updatedAt fields to the schema.

Terminologies:
1. MongoDB: A NoSQL database that stores data in flexible, JSON-like documents.
2. Mongoose: Tool to interact with MongoDB, allowing us to define schemas and models for our data.
3. Schema: A blueprint for how data should be structured in the database.
4. Model: A compiled version of the schema that provides an interface to interact with the database.
*/