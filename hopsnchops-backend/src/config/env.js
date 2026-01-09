const dotenv = require("dotenv");

// Load environment variables from the .env file
dotenv.config();

module.exports = {
    // Port
    PORT: process.env.PORT,
    SERVER_URL: process.env.NODE_ENV === "production" ? process.env.Production_server : process.env.Development_server,
    Development_server: process.env.Development_server,
    Production_server: process.env.Production_server,

    // Database
    MONGODB_URL: process.env.MONGODB_URL,

    // EMAIL CONFIGURATION
    EMAIL_USERNAME: process.env.EMAIL_USERNAME,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,

    // Client-Side URL
    CLIENT_URL: process.env.NODE_ENV === "production" ? process.env.Production_CLIENT_URL : process.env.Development_CLIENT_URL,
    Development_CLIENT_URL: process.env.Development_CLIENT_URL,
    Production_CLIENT_URL: process.env.Production_CLIENT_URL,
    Development_CLIENT_URL_TEST: process.env.Development_CLIENT_URL_TEST,
    // JWT Secret
    JWT_TOKEN_SECRET: process.env.JWT_TOKEN_SECRET,

    // Cloudinary
    CLOUD_NAME: process.env.CLOUD_NAME,
    API_KEY: process.env.API_KEY,
    API_SECRET: process.env.API_SECRET,

};