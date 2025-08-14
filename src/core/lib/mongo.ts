import mongoose, { ConnectOptions } from 'mongoose';

import logger from '@/core/utils/logger';

// Extend the global object with a property `_mongoose`
const globalWithMongoose = global as typeof global & {
  _mongoose?: {
    connection: typeof mongoose | null;
  };
};

// Initialize the `_mongoose` for caching
const cached =
  globalWithMongoose._mongoose ??
  (globalWithMongoose._mongoose = { connection: null });

// Configuration
const getConnectionConfig = (): { uri: string; options: ConnectOptions } => {
  const uri = process.env.DB_CONNECTION_STRING;

  if (!uri) {
    throw new Error('DB_CONNECTION_STRING environment variable is not defined');
  }

  // MongoDB connection options
  const options: ConnectOptions = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
    retryWrites: true,
  };

  return { uri, options };
};

// Connection function
const connect = async (): Promise<MongoDBConnectionResult> => {
  if (cached.connection) return null;

  try {
    const { uri, options } = getConnectionConfig();
    cached.connection = await mongoose.connect(uri, options);
    logger.info(`MongoDB connected`);
    return null;
  } catch (error) {
    console.error(error);
    cached.connection = null;
    const errMsg = `MongoDB connection failed`;
    logger.error(errMsg);
    return errMsg;
  }
};

// Disconnection function
const disconnect = async (): Promise<MongoDBConnectionResult> => {
  try {
    await mongoose.disconnect();
    logger.info(`MongoDB disconnected`);
    cached.connection = null;
    return null;
  } catch (error) {
    console.error(error);
    const errMsg = `Failed to disconnect from MongoDB`;
    logger.error(errMsg);
    return errMsg;
  }
};

// Public API
export const mongoDB = {
  connect,
  disconnect,
  isConnected: (): boolean => {
    return mongoose.connection.readyState === 1;
  },
  getConnectionState: (): string => {
    const states: Record<number, string> = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
      99: 'uninitialized',
    };

    return states[mongoose.connection.readyState] || 'unknown';
  },
};

export type MongoDBConnectionResult = string | null;
