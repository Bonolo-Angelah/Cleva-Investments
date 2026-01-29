const { Sequelize } = require('sequelize');
const mongoose = require('mongoose');
const neo4j = require('neo4j-driver');
require('dotenv').config();

// PostgreSQL Connection (User data & goals)
const sequelize = new Sequelize(
  process.env.POSTGRES_DB,
  process.env.POSTGRES_USER,
  process.env.POSTGRES_PASSWORD,
  {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// MongoDB Connection (Articles & market data)
const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ MongoDB connected successfully');
  } catch (error) {
    console.error('✗ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Neo4j Connection (Graph relationships)
const neo4jDriver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD),
  {
    maxConnectionPoolSize: 50,
    connectionAcquisitionTimeout: 2 * 60 * 1000
  }
);

// Test Neo4j connection
const testNeo4jConnection = async () => {
  const session = neo4jDriver.session();
  try {
    await session.run('RETURN 1');
    console.log('✓ Neo4j connected successfully');
  } catch (error) {
    console.error('✗ Neo4j connection error:', error);
  } finally {
    await session.close();
  }
};

// Test PostgreSQL connection
const testPostgresConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ PostgreSQL connected successfully');
  } catch (error) {
    console.error('✗ PostgreSQL connection error:', error);
    process.exit(1);
  }
};

// Initialize all databases
const initializeDatabases = async () => {
  await testPostgresConnection();
  await connectMongoDB();
  await testNeo4jConnection();
};

// Graceful shutdown
const closeConnections = async () => {
  await sequelize.close();
  await mongoose.connection.close();
  await neo4jDriver.close();
  console.log('All database connections closed');
};

module.exports = {
  sequelize,
  mongoose,
  neo4jDriver,
  initializeDatabases,
  closeConnections
};
