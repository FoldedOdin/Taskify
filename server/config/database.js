import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Require MONGODB_URI environment variable - no fallback for security
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error(
        'MONGODB_URI environment variable is required. ' +
        'Please set it in your .env file or environment variables.'
      );
    }

    const conn = await mongoose.connect(mongoURI, {});

    console.log(`📦 MongoDB Connected: ${conn.connection.host}`);
    console.log(`🗄️  Database: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on('error', err => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('📦 MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('📦 MongoDB connection closed through app termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

export default connectDB;
