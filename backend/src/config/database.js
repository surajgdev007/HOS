const mongoose = require('mongoose');
const logger = require('../utils/logger');

const dns = require('dns');

dns.setServers([
  '1.1.1.1',
  '8.8.8.8'
])
 
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    logger.info(`MongoDB Connected`);
  } catch (error) {
    logger.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

mongoose.connection.on("disconnected", () => {
  if (process.env.NODE_ENV !== "seed") {
    logger.warn("MongoDB Disconnected.");
  }
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB Reconnected.');
});

module.exports = connectDB;
