// =====================================================
// CLEVA INVESTMENT PLATFORM
// Neo4j Graph Database Schema & Initialization
// Version: 1.0
// =====================================================

// =====================================================
// CLEAR EXISTING DATA (for clean reinstall)
// WARNING: This will delete all nodes and relationships!
// =====================================================
MATCH (n)
DETACH DELETE n;

// =====================================================
// CREATE CONSTRAINTS
// Ensures data integrity and improves query performance
// =====================================================

// User constraints
CREATE CONSTRAINT user_id_unique IF NOT EXISTS
FOR (u:User)
REQUIRE u.userId IS UNIQUE;

// Investment constraints
CREATE CONSTRAINT investment_symbol_unique IF NOT EXISTS
FOR (i:Investment)
REQUIRE i.symbol IS UNIQUE;

// Sector constraints
CREATE CONSTRAINT sector_name_unique IF NOT EXISTS
FOR (s:Sector)
REQUIRE s.name IS UNIQUE;

// =====================================================
// CREATE INDEXES
// Improves query performance
// =====================================================

// User indexes
CREATE INDEX user_risk_index IF NOT EXISTS
FOR (u:User)
ON (u.riskTolerance);

CREATE INDEX user_experience_index IF NOT EXISTS
FOR (u:User)
ON (u.investmentExperience);

// Investment indexes
CREATE INDEX investment_type_index IF NOT EXISTS
FOR (i:Investment)
ON (i.type);

CREATE INDEX investment_risk_index IF NOT EXISTS
FOR (i:Investment)
ON (i.riskLevel);

// Relationship indexes for performance
CREATE INDEX viewed_timestamp_index IF NOT EXISTS
FOR ()-[r:VIEWED]-()
ON (r.timestamp);

CREATE INDEX owns_timestamp_index IF NOT EXISTS
FOR ()-[r:OWNS]-()
ON (r.timestamp);

// =====================================================
// NODE LABELS AND PROPERTIES
// =====================================================

// USER NODES
// Properties:
// - userId: UUID from PostgreSQL
// - riskTolerance: conservative, moderate, aggressive
// - investmentExperience: beginner, intermediate, advanced
// - country: ISO country code
// - createdAt: timestamp

// INVESTMENT NODES
// Properties:
// - symbol: Stock/ETF symbol (e.g., AAPL, STX40)
// - name: Investment name
// - type: stock, etf, bond, crypto
// - sector: Technology, Finance, etc.
// - riskLevel: low, medium, high
// - averageReturn: Historical average return
// - volatility: Price volatility measure
// - marketCap: Market capitalization
// - country: Primary listing country
// - currency: Trading currency
// - createdAt: timestamp

// SECTOR NODES
// Properties:
// - name: Sector name (Technology, Healthcare, etc.)
// - description: Sector description
// - riskLevel: low, medium, high
// - averageReturn: Historical sector return
// - createdAt: timestamp

// GOAL NODES (optional - for advanced recommendations)
// Properties:
// - goalId: UUID from PostgreSQL
// - goalType: retirement, education, house, etc.
// - targetAmount: Goal target
// - timeHorizon: short, medium, long
// - createdAt: timestamp

// =====================================================
// RELATIONSHIP TYPES
// =====================================================

// User -> Investment Relationships:
// - VIEWED: User viewed investment details
// - QUERIED: User asked about investment in chat
// - OWNS: User owns this investment in portfolio
// - BOOKMARKED: User saved investment for later
// - RECOMMENDED: System recommended this to user

// Investment -> Investment Relationships:
// - SIMILAR_TO: Investments with similar characteristics
// - COMPETES_WITH: Competing investments in same sector
// - CORRELATES_WITH: Price correlation relationship

// Investment -> Sector Relationships:
// - BELONGS_TO: Investment belongs to sector

// User -> User Relationships:
// - SIMILAR_PROFILE: Users with similar risk/experience profiles

// =====================================================
// SEED DATA - SECTORS
// =====================================================

CREATE (tech:Sector {
  name: 'Technology',
  description: 'Technology and software companies',
  riskLevel: 'high',
  averageReturn: 0.12,
  createdAt: datetime()
});

CREATE (finance:Sector {
  name: 'Financial Services',
  description: 'Banks, insurance, and financial institutions',
  riskLevel: 'medium',
  averageReturn: 0.08,
  createdAt: datetime()
});

CREATE (healthcare:Sector {
  name: 'Healthcare',
  description: 'Healthcare providers and pharmaceutical companies',
  riskLevel: 'medium',
  averageReturn: 0.09,
  createdAt: datetime()
});

CREATE (consumer:Sector {
  name: 'Consumer Goods',
  description: 'Retail and consumer products',
  riskLevel: 'medium',
  averageReturn: 0.07,
  createdAt: datetime()
});

CREATE (energy:Sector {
  name: 'Energy & Resources',
  description: 'Oil, gas, mining, and renewable energy',
  riskLevel: 'high',
  averageReturn: 0.10,
  createdAt: datetime()
});

CREATE (industrial:Sector {
  name: 'Industrials',
  description: 'Manufacturing and industrial companies',
  riskLevel: 'medium',
  averageReturn: 0.08,
  createdAt: datetime()
});

CREATE (property:Sector {
  name: 'Real Estate',
  description: 'REITs and property companies',
  riskLevel: 'low',
  averageReturn: 0.06,
  createdAt: datetime()
});

// =====================================================
// SEED DATA - SOUTH AFRICAN INVESTMENTS
// =====================================================

// JSE Top 40 ETF
CREATE (stx40:Investment {
  symbol: 'STX40',
  name: 'Satrix 40',
  type: 'etf',
  sector: 'Diversified',
  riskLevel: 'medium',
  averageReturn: 0.08,
  volatility: 0.15,
  marketCap: 500000000000,
  country: 'ZA',
  currency: 'ZAR',
  description: 'Tracks the JSE Top 40 Index',
  createdAt: datetime()
});

// Banking Stocks
CREATE (sbk:Investment {
  symbol: 'SBK',
  name: 'Standard Bank',
  type: 'stock',
  sector: 'Financial Services',
  riskLevel: 'medium',
  averageReturn: 0.09,
  volatility: 0.20,
  marketCap: 250000000000,
  country: 'ZA',
  currency: 'ZAR',
  description: 'Major South African banking group',
  createdAt: datetime()
});

CREATE (cpi:Investment {
  symbol: 'CPI',
  name: 'Capitec Bank',
  type: 'stock',
  sector: 'Financial Services',
  riskLevel: 'medium',
  averageReturn: 0.12,
  volatility: 0.22,
  marketCap: 180000000000,
  country: 'ZA',
  currency: 'ZAR',
  description: 'Retail banking and microfinance',
  createdAt: datetime()
});

CREATE (fsr:Investment {
  symbol: 'FSR',
  name: 'FirstRand',
  type: 'stock',
  sector: 'Financial Services',
  riskLevel: 'medium',
  averageReturn: 0.08,
  volatility: 0.19,
  marketCap: 200000000000,
  country: 'ZA',
  currency: 'ZAR',
  description: 'Diversified financial services group',
  createdAt: datetime()
});

// Retail Stocks
CREATE (shp:Investment {
  symbol: 'SHP',
  name: 'Shoprite Holdings',
  type: 'stock',
  sector: 'Consumer Goods',
  riskLevel: 'medium',
  averageReturn: 0.07,
  volatility: 0.18,
  marketCap: 150000000000,
  country: 'ZA',
  currency: 'ZAR',
  description: 'Largest food retailer in Africa',
  createdAt: datetime()
});

// Mining & Resources
CREATE (agl:Investment {
  symbol: 'AGL',
  name: 'Anglo American',
  type: 'stock',
  sector: 'Energy & Resources',
  riskLevel: 'high',
  averageReturn: 0.11,
  volatility: 0.28,
  marketCap: 400000000000,
  country: 'ZA',
  currency: 'ZAR',
  description: 'Diversified mining company',
  createdAt: datetime()
});

CREATE (sol:Investment {
  symbol: 'SOL',
  name: 'Sasol',
  type: 'stock',
  sector: 'Energy & Resources',
  riskLevel: 'high',
  averageReturn: 0.09,
  volatility: 0.30,
  marketCap: 120000000000,
  country: 'ZA',
  currency: 'ZAR',
  description: 'Integrated energy and chemicals company',
  createdAt: datetime()
});

// Property/REITs
CREATE (nvt:Investment {
  symbol: 'NVT',
  name: 'Nepi Rockcastle',
  type: 'reit',
  sector: 'Real Estate',
  riskLevel: 'low',
  averageReturn: 0.06,
  volatility: 0.12,
  marketCap: 80000000000,
  country: 'ZA',
  currency: 'ZAR',
  description: 'Retail property investment',
  createdAt: datetime()
});

// =====================================================
// CREATE RELATIONSHIPS - Investment to Sector
// =====================================================

MATCH (i:Investment {symbol: 'SBK'}), (s:Sector {name: 'Financial Services'})
CREATE (i)-[:BELONGS_TO]->(s);

MATCH (i:Investment {symbol: 'CPI'}), (s:Sector {name: 'Financial Services'})
CREATE (i)-[:BELONGS_TO]->(s);

MATCH (i:Investment {symbol: 'FSR'}), (s:Sector {name: 'Financial Services'})
CREATE (i)-[:BELONGS_TO]->(s);

MATCH (i:Investment {symbol: 'SHP'}), (s:Sector {name: 'Consumer Goods'})
CREATE (i)-[:BELONGS_TO]->(s);

MATCH (i:Investment {symbol: 'AGL'}), (s:Sector {name: 'Energy & Resources'})
CREATE (i)-[:BELONGS_TO]->(s);

MATCH (i:Investment {symbol: 'SOL'}), (s:Sector {name: 'Energy & Resources'})
CREATE (i)-[:BELONGS_TO]->(s);

MATCH (i:Investment {symbol: 'NVT'}), (s:Sector {name: 'Real Estate'})
CREATE (i)-[:BELONGS_TO]->(s);

// =====================================================
// CREATE RELATIONSHIPS - Similar Investments
// =====================================================

// Banks are similar to each other
MATCH (sbk:Investment {symbol: 'SBK'}), (cpi:Investment {symbol: 'CPI'})
CREATE (sbk)-[:SIMILAR_TO {similarity: 0.85}]->(cpi);

MATCH (sbk:Investment {symbol: 'SBK'}), (fsr:Investment {symbol: 'FSR'})
CREATE (sbk)-[:SIMILAR_TO {similarity: 0.90}]->(fsr);

MATCH (cpi:Investment {symbol: 'CPI'}), (fsr:Investment {symbol: 'FSR'})
CREATE (cpi)-[:SIMILAR_TO {similarity: 0.82}]->(fsr);

// Mining stocks are similar
MATCH (agl:Investment {symbol: 'AGL'}), (sol:Investment {symbol: 'SOL'})
CREATE (agl)-[:SIMILAR_TO {similarity: 0.75}]->(sol);

// =====================================================
// UTILITY QUERIES FOR RECOMMENDATIONS
// =====================================================

// Query 1: Get recommendations for a user based on similar users
// MATCH (u:User {userId: $userId})-[:SIMILAR_PROFILE]->(similar:User)
// -[:OWNS|VIEWED]->(i:Investment)
// WHERE NOT (u)-[:OWNS]->(i)
// RETURN i.symbol, i.name, COUNT(similar) as recommendedByUsers
// ORDER BY recommendedByUsers DESC
// LIMIT 5

// Query 2: Get investments similar to user's current holdings
// MATCH (u:User {userId: $userId})-[:OWNS]->(owned:Investment)
// -[:SIMILAR_TO]->(similar:Investment)
// WHERE NOT (u)-[:OWNS]->(similar)
// RETURN similar.symbol, similar.name, COUNT(owned) as similarityScore
// ORDER BY similarityScore DESC
// LIMIT 5

// Query 3: Get sector-based recommendations
// MATCH (u:User {userId: $userId})-[:OWNS]->(i:Investment)-[:BELONGS_TO]->(s:Sector)
// WITH u, s, COUNT(i) as holdings
// MATCH (s)<-[:BELONGS_TO]-(rec:Investment)
// WHERE NOT (u)-[:OWNS]->(rec)
// AND rec.riskLevel = u.riskTolerance
// RETURN rec.symbol, rec.name, s.name as sector
// LIMIT 5

// Query 4: Record user interest
// MATCH (u:User {userId: $userId})
// MATCH (i:Investment {symbol: $symbol})
// MERGE (u)-[r:VIEWED]->(i)
// ON CREATE SET r.count = 1, r.timestamp = datetime()
// ON MATCH SET r.count = r.count + 1, r.timestamp = datetime()

// Query 5: Find similar users for collaborative filtering
// MATCH (u1:User {userId: $userId})
// MATCH (u2:User)
// WHERE u1 <> u2
// AND u1.riskTolerance = u2.riskTolerance
// AND u1.investmentExperience = u2.investmentExperience
// MERGE (u1)-[r:SIMILAR_PROFILE]->(u2)
// SET r.similarity = 1.0

// =====================================================
// SAMPLE DATA - Create a test user
// =====================================================

CREATE (testUser:User {
  userId: '00000000-0000-0000-0000-000000000000',
  riskTolerance: 'moderate',
  investmentExperience: 'intermediate',
  country: 'ZA',
  createdAt: datetime()
});

// Create some sample interactions
MATCH (u:User {userId: '00000000-0000-0000-0000-000000000000'})
MATCH (i:Investment {symbol: 'STX40'})
CREATE (u)-[:VIEWED {timestamp: datetime(), count: 3}]->(i);

MATCH (u:User {userId: '00000000-0000-0000-0000-000000000000'})
MATCH (i:Investment {symbol: 'SBK'})
CREATE (u)-[:OWNS {
  timestamp: datetime(),
  quantity: 100,
  averageCost: 150.00
}]->(i);

// =====================================================
// VERIFICATION QUERIES
// =====================================================

// Count nodes
MATCH (n) RETURN labels(n)[0] as Label, COUNT(n) as Count;

// Count relationships
MATCH ()-[r]->() RETURN type(r) as Type, COUNT(r) as Count;

// Show sample recommendations (replace with actual userId)
// MATCH (u:User {userId: '00000000-0000-0000-0000-000000000000'})
// -[:OWNS|VIEWED]->(i:Investment)-[:SIMILAR_TO]->(rec:Investment)
// WHERE NOT (u)-[:OWNS]->(rec)
// RETURN rec.symbol, rec.name, rec.sector, rec.riskLevel
// LIMIT 5;

// =====================================================
// END OF SCRIPT
// =====================================================
