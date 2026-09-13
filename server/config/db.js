const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (mongoUri && mongoUri.trim() !== '') {
      console.log('Connecting to provided MongoDB URI...');
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('MongoDB Connected successfully to:', mongoUri.split('@').pop() || mongoUri);
      return;
    }
  } catch (error) {
    console.warn('Could not connect to external MongoDB URI:', error.message);
    console.log('Falling back to local in-memory MongoDB instance...');
  }

  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log('In-Memory MongoDB Started & Connected successfully at:', uri);
  } catch (err) {
    console.error('Fatal Database Connection Error:', err.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
};

module.exports = { connectDB, disconnectDB };
