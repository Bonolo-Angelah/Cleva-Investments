// =====================================================
// CLEVA INVESTMENT PLATFORM
// MongoDB Database Schema & Initialization
// Version: 1.0
// =====================================================

// Connect to MongoDB
db = db.getSiblingDB('cleva_investment');

print('==============================================');
print('Initializing Cleva Investment MongoDB Database');
print('==============================================\n');

// =====================================================
// DROP EXISTING COLLECTIONS (for clean reinstall)
// =====================================================
print('Dropping existing collections...');
db.chat_histories.drop();
db.articles.drop();
db.activity_logs.drop();
db.market_data_cache.drop();
print('✓ Collections dropped\n');

// =====================================================
// CHAT_HISTORIES COLLECTION
// Stores AI chat conversations with users
// =====================================================
print('Creating chat_histories collection...');
db.createCollection('chat_histories', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'sessionId', 'messages', 'isActive'],
      properties: {
        userId: {
          bsonType: 'string',
          description: 'User ID from PostgreSQL (UUID)'
        },
        sessionId: {
          bsonType: 'string',
          description: 'Unique session identifier'
        },
        messages: {
          bsonType: 'array',
          description: 'Array of chat messages',
          items: {
            bsonType: 'object',
            required: ['role', 'content', 'timestamp'],
            properties: {
              role: {
                enum: ['user', 'assistant', 'system'],
                description: 'Message sender role'
              },
              content: {
                bsonType: 'string',
                description: 'Message content'
              },
              type: {
                bsonType: 'string',
                description: 'Message type (text, recommendation, etc.)'
              },
              timestamp: {
                bsonType: 'date',
                description: 'Message timestamp'
              },
              metadata: {
                bsonType: 'object',
                description: 'Additional message metadata'
              }
            }
          }
        },
        isActive: {
          bsonType: 'bool',
          description: 'Whether session is active'
        },
        lastMessageAt: {
          bsonType: 'date',
          description: 'Timestamp of last message'
        },
        createdAt: {
          bsonType: 'date',
          description: 'Session creation timestamp'
        },
        updatedAt: {
          bsonType: 'date',
          description: 'Last update timestamp'
        }
      }
    }
  }
});

// Create indexes for chat_histories
db.chat_histories.createIndex({ userId: 1, sessionId: 1 }, { unique: true });
db.chat_histories.createIndex({ userId: 1, isActive: 1 });
db.chat_histories.createIndex({ lastMessageAt: -1 });
db.chat_histories.createIndex({ createdAt: -1 });
print('✓ chat_histories collection created with indexes\n');

// =====================================================
// ARTICLES COLLECTION
// Stores financial news and market analysis articles
// =====================================================
print('Creating articles collection...');
db.createCollection('articles', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'url', 'source', 'publishedAt'],
      properties: {
        title: {
          bsonType: 'string',
          description: 'Article title'
        },
        url: {
          bsonType: 'string',
          description: 'Article URL'
        },
        source: {
          bsonType: 'string',
          description: 'News source'
        },
        author: {
          bsonType: 'string',
          description: 'Article author'
        },
        description: {
          bsonType: 'string',
          description: 'Article summary'
        },
        content: {
          bsonType: 'string',
          description: 'Full article content'
        },
        imageUrl: {
          bsonType: 'string',
          description: 'Article image URL'
        },
        publishedAt: {
          bsonType: 'date',
          description: 'Publication timestamp'
        },
        category: {
          bsonType: 'string',
          description: 'Article category (e.g., stocks, crypto, economy)'
        },
        relatedSymbols: {
          bsonType: 'array',
          description: 'Stock symbols mentioned in article',
          items: {
            bsonType: 'string'
          }
        },
        sentiment: {
          enum: ['positive', 'neutral', 'negative'],
          description: 'Sentiment analysis result'
        },
        relevanceScore: {
          bsonType: 'double',
          description: 'Article relevance score (0-1)'
        },
        tags: {
          bsonType: 'array',
          description: 'Article tags',
          items: {
            bsonType: 'string'
          }
        },
        createdAt: {
          bsonType: 'date',
          description: 'Record creation timestamp'
        }
      }
    }
  }
});

// Create indexes for articles
db.articles.createIndex({ url: 1 }, { unique: true });
db.articles.createIndex({ publishedAt: -1 });
db.articles.createIndex({ source: 1, publishedAt: -1 });
db.articles.createIndex({ relatedSymbols: 1 });
db.articles.createIndex({ category: 1 });
db.articles.createIndex({ sentiment: 1 });
// Text index for full-text search
db.articles.createIndex({
  title: 'text',
  description: 'text',
  content: 'text',
  tags: 'text'
});
print('✓ articles collection created with indexes\n');

// =====================================================
// ACTIVITY_LOGS COLLECTION
// Stores user and system activity for audit trail
// =====================================================
print('Creating activity_logs collection...');
db.createCollection('activity_logs', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'action', 'timestamp'],
      properties: {
        userId: {
          bsonType: 'string',
          description: 'User ID from PostgreSQL (UUID)'
        },
        action: {
          bsonType: 'string',
          description: 'Action performed'
        },
        actionType: {
          enum: [
            'user.register',
            'user.login',
            'user.logout',
            'user.profile.update',
            'user.password.change',
            'goal.create',
            'goal.update',
            'goal.delete',
            'goal.complete',
            'portfolio.create',
            'portfolio.update',
            'portfolio.delete',
            'holding.add',
            'holding.update',
            'holding.remove',
            'transaction.create',
            'chat.message',
            'chat.session.start',
            'market.data.fetch',
            'admin.report.generate',
            'admin.user.manage'
          ],
          description: 'Categorized action type'
        },
        entityType: {
          bsonType: 'string',
          description: 'Entity affected (user, goal, portfolio, etc.)'
        },
        entityId: {
          bsonType: 'string',
          description: 'ID of affected entity'
        },
        details: {
          bsonType: 'object',
          description: 'Additional action details'
        },
        metadata: {
          bsonType: 'object',
          description: 'Request metadata (IP, user agent, etc.)',
          properties: {
            ipAddress: {
              bsonType: 'string'
            },
            userAgent: {
              bsonType: 'string'
            },
            device: {
              bsonType: 'string'
            },
            location: {
              bsonType: 'string'
            }
          }
        },
        status: {
          enum: ['success', 'failure', 'error'],
          description: 'Action execution status'
        },
        errorMessage: {
          bsonType: 'string',
          description: 'Error message if action failed'
        },
        timestamp: {
          bsonType: 'date',
          description: 'Action timestamp'
        }
      }
    }
  }
});

// Create indexes for activity_logs
db.activity_logs.createIndex({ userId: 1, timestamp: -1 });
db.activity_logs.createIndex({ actionType: 1, timestamp: -1 });
db.activity_logs.createIndex({ timestamp: -1 });
db.activity_logs.createIndex({ entityType: 1, entityId: 1 });
db.activity_logs.createIndex({ status: 1 });
// TTL index - automatically delete logs older than 90 days
db.activity_logs.createIndex({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days
print('✓ activity_logs collection created with indexes (90-day TTL)\n');

// =====================================================
// MARKET_DATA_CACHE COLLECTION
// Caches market data to reduce API calls
// =====================================================
print('Creating market_data_cache collection...');
db.createCollection('market_data_cache', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['symbol', 'data', 'source', 'cachedAt'],
      properties: {
        symbol: {
          bsonType: 'string',
          description: 'Stock/ETF symbol'
        },
        data: {
          bsonType: 'object',
          description: 'Cached market data',
          properties: {
            name: { bsonType: 'string' },
            currentPrice: { bsonType: 'double' },
            priceChange: { bsonType: 'double' },
            priceChangePercent: { bsonType: 'double' },
            volume: { bsonType: 'long' },
            marketCap: { bsonType: 'long' },
            peRatio: { bsonType: 'double' },
            dividendYield: { bsonType: 'double' },
            high52Week: { bsonType: 'double' },
            low52Week: { bsonType: 'double' },
            sector: { bsonType: 'string' },
            industry: { bsonType: 'string' }
          }
        },
        source: {
          bsonType: 'string',
          description: 'Data source (FMP, Yahoo, etc.)'
        },
        cachedAt: {
          bsonType: 'date',
          description: 'Cache timestamp'
        },
        expiresAt: {
          bsonType: 'date',
          description: 'Cache expiration timestamp'
        }
      }
    }
  }
});

// Create indexes for market_data_cache
db.market_data_cache.createIndex({ symbol: 1 }, { unique: true });
db.market_data_cache.createIndex({ cachedAt: -1 });
// TTL index - automatically delete cache older than 1 hour
db.market_data_cache.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
print('✓ market_data_cache collection created with indexes (1-hour TTL)\n');

// =====================================================
// SEED DATA (Optional - for testing)
// =====================================================
print('Inserting sample data...');

// Sample articles
db.articles.insertMany([
  {
    title: 'JSE Top 40 Reaches New Heights in Q1 2026',
    url: 'https://example.com/jse-top-40-q1-2026',
    source: 'Financial Times',
    author: 'John Smith',
    description: 'The JSE Top 40 index shows strong performance in the first quarter of 2026.',
    publishedAt: new Date(),
    category: 'stocks',
    relatedSymbols: ['STX40', 'SBK', 'CPI'],
    sentiment: 'positive',
    relevanceScore: 0.95,
    tags: ['JSE', 'Top 40', 'South Africa', 'stock market'],
    createdAt: new Date()
  },
  {
    title: 'Banking Sector Shows Resilience Amid Economic Uncertainty',
    url: 'https://example.com/banking-sector-2026',
    source: 'Business Day',
    author: 'Jane Doe',
    description: 'South African banks demonstrate strong fundamentals despite global headwinds.',
    publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    category: 'stocks',
    relatedSymbols: ['SBK', 'FSR', 'NED', 'ABSA'],
    sentiment: 'positive',
    relevanceScore: 0.88,
    tags: ['banking', 'finance', 'South Africa'],
    createdAt: new Date()
  }
]);

print('✓ Sample articles inserted\n');

// =====================================================
// COLLECTION STATISTICS
// =====================================================
print('==============================================');
print('Collection Statistics:');
print('==============================================');
print('chat_histories: ' + db.chat_histories.countDocuments() + ' documents');
print('articles: ' + db.articles.countDocuments() + ' documents');
print('activity_logs: ' + db.activity_logs.countDocuments() + ' documents');
print('market_data_cache: ' + db.market_data_cache.countDocuments() + ' documents');

// =====================================================
// UTILITY FUNCTIONS FOR MAINTENANCE
// =====================================================

print('\n==============================================');
print('Utility Commands:');
print('==============================================');
print('View collections: show collections');
print('Collection stats: db.chat_histories.stats()');
print('Count documents: db.articles.countDocuments()');
print('Find recent logs: db.activity_logs.find().sort({timestamp: -1}).limit(10)');
print('Clear old cache: db.market_data_cache.deleteMany({cachedAt: {$lt: new Date(Date.now() - 3600000)}})');
print('==============================================\n');

print('✓ MongoDB initialization complete!');

// =====================================================
// END OF SCRIPT
// =====================================================
