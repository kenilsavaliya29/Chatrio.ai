import mongoose from 'mongoose';

// Track connection state to avoid reconnecting
let isConnected = false;

const connectDB = async () => {
  // If already connected, return early
  if (isConnected) {
    return;
  }

  // Check if MONGODB_URI exists
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false, // Disable command buffering
    });
    
    isConnected = true;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.log('MongoDB disconnected');
    });
    
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    isConnected = false;
    // Instead of process.exit(), throw the error to be handled by the API route
    throw new Error(`Database connection failed: ${error.message}`);
  }
};

export default connectDB; 