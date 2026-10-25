require("dotenv").config();

const dns = require("dns");
const mongoose = require("mongoose");

dns.setServers(["8.8.8.8"]);

const cleanDatabase = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      throw new Error("MONGO_URI is missing from .env file");
    }

    console.log("Connecting to MongoDB Atlas...");

    await mongoose.connect(mongoURI);

    console.log("Connected to MongoDB!");

    const collections = await mongoose.connection.db.collections();

    for (const collection of collections) {
      await collection.deleteMany({});
      console.log(`Cleared: ${collection.collectionName}`);
    }

    console.log(
      "\nAll Doctor, Patient, Appointment, Bill, and User data cleared successfully!"
    );

    await mongoose.connection.close();

    process.exit(0);
  } catch (error) {
    console.error("Error wiping database:", error);

    try {
      await mongoose.connection.close();
    } catch (closeError) {}

    process.exit(1);
  }
};

cleanDatabase();