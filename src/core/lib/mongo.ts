import { Db, MongoClient, MongoClientOptions } from 'mongodb';
import mongoose, { ConnectOptions } from 'mongoose';

import logger from '@/core/utils/logger';

// Extend the global object with both mongoose and native client properties
const globalWithMongo = global as typeof global & {
  _mongoose?: {
    connection: typeof mongoose | null;
  };
  _mongoClient?: {
    client: MongoClient | null;
    db: Db | null;
  };
};

// Initialize caches
const mongooseCache =
  globalWithMongo._mongoose ??
  (globalWithMongo._mongoose = { connection: null });

const vectorCache =
  globalWithMongo._mongoClient ??
  (globalWithMongo._mongoClient = { client: null, db: null });

// Shared configuration
const getConnectionConfig = (): {
  uri: string;
  mongooseOptions: ConnectOptions;
  clientOptions: MongoClientOptions;
} => {
  const uri = process.env.DB_CONNECTION_STRING;
  if (!uri) {
    throw new Error(
      'MongoDB: DB_CONNECTION_STRING environment variable is not defined'
    );
  }

  const mongooseOptions: ConnectOptions = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
    retryWrites: true,
  };

  const clientOptions = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  };

  return { uri, mongooseOptions, clientOptions };
};

// Mongoose connection functions
const connect = async (): Promise<MongoDBConnectionResult> => {
  if (mongooseCache.connection) return null; // Already connected

  try {
    const { uri, mongooseOptions } = getConnectionConfig();
    mongooseCache.connection = await mongoose.connect(uri, mongooseOptions);
    logger.info(`MongoDB: (Mongoose) connected`);
    return null;
  } catch (error) {
    console.error(error);
    mongooseCache.connection = null;
    const errMsg = `MongoDB: (Mongoose) connection failed`;
    logger.error(errMsg);
    return errMsg;
  }
};

// Disconnection function
const disconnect = async (): Promise<MongoDBConnectionResult> => {
  try {
    await mongoose.disconnect();
    logger.info(`MongoDB: (Mongoose) disconnected`);
    mongooseCache.connection = null;
    return null;
  } catch (error) {
    console.error(error);
    const errMsg = `MongoDB: Failed to disconnect from MongoDB (Mongoose)`;
    logger.error(errMsg);
    return errMsg;
  }
};

// Vector client connection functions (new)
const connectVectorClient = async (): Promise<MongoDBConnectionResult> => {
  if (vectorCache.client && vectorCache.db) {
    return null; // Already connected
  }

  try {
    const { uri, clientOptions } = getConnectionConfig();

    vectorCache.client = new MongoClient(uri, clientOptions);
    await vectorCache.client.connect();
    vectorCache.db = vectorCache.client.db('chatai');

    logger.info('MongoDB: (Vector Client) connected');
    return null;
  } catch (error) {
    console.error('MongoDB: Vector Client connection error:', error);
    vectorCache.client = null;
    vectorCache.db = null;
    const errMsg = 'MongoDB: (Vector Client) connection failed';
    logger.error(errMsg);
    return errMsg;
  }
};

const disconnectVectorClient = async (): Promise<MongoDBConnectionResult> => {
  try {
    if (vectorCache.client) {
      await vectorCache.client.close();
      vectorCache.client = null;
      vectorCache.db = null;
      logger.info('MongoDB: (Vector Client) disconnected');
    }
    return null;
  } catch (error) {
    console.error('MongoDB: Vector client disconnect error:', error);
    const errMsg = 'Failed to disconnect MongoDB (Vector Client)';
    logger.error(errMsg);
    return errMsg;
  }
};

const getVectorDb = async (): Promise<Db> => {
  const connectionResult = await connectVectorClient();
  if (connectionResult) {
    throw new Error(connectionResult);
  }

  if (!vectorCache.db) {
    throw new Error('MongoDB: Vector database not initialized');
  }

  return vectorCache.db;
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
  connectVectorClient,
  disconnectVectorClient,
  getVectorDb,
  isVectorClientConnected: (): boolean => {
    return vectorCache.client !== null && vectorCache.db !== null;
  },
  // Creates the MongoDB Atlas search index
  createSearchIndex: async (): Promise<void> => {
    try {
      const db = await mongoDB.getVectorDb();
      const collectionName = `person_vectors`;
      // Ensure collection exists by creating it if doesn't
      const collection = db.collection(collectionName);

      // Check if the shared index already exists
      const indexes = await collection.listSearchIndexes().toArray();
      const indexExists = indexes.some(
        (index) => index.name === 'person_vector_index'
      );

      if (indexExists) {
        return;
      }

      // Create the shared search index only if it doesn't exist
      await collection.createSearchIndex({
        name: `person_vector_index`,
        type: 'vectorSearch',
        definition: {
          fields: [
            {
              type: 'vector',
              path: 'embedding',
              numDimensions: 768, // Google Generative AI embeddings dimension
              similarity: 'cosine',
            },
            {
              type: 'filter',
              path: 'category', // Allows to filter docs relevant to category
            },
            {
              type: 'filter',
              path: 'personKey', // Allows to filter docs relevant to person
            },
          ],
        },
      });

      // console.log(`[Debug] MongoDB: Created search index for 'person_vector'.`);
    } catch (error) {
      console.error(
        `MongoDB: Failed to create search index for 'person_vector':`,
        error
      );
    }
  },

  // // Utility method to connect both
  // connectAll: async (): Promise<{
  //   mongoose: MongoDBConnectionResult;
  //   vectorClient: MongoDBConnectionResult;
  // }> => {
  //   const mongooseResult = await connect();
  //   const vectorResult = await connectVectorClient();
  //   return { mongoose: mongooseResult, vectorClient: vectorResult };
  // },

  // // Utility method to disconnect both
  // disconnectAll: async (): Promise<{
  //   mongoose: MongoDBConnectionResult;
  //   vectorClient: MongoDBConnectionResult;
  // }> => {
  //   const mongooseResult = await disconnect();
  //   const vectorResult = await disconnectVectorClient();
  //   return { mongoose: mongooseResult, vectorClient: vectorResult };
  // },
};

export type MongoDBConnectionResult = string | null;
