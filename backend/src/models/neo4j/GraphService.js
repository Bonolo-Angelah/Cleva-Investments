const neo4j = require('neo4j-driver');
const { neo4jDriver } = require('../../config/database');

class GraphService {
  /**
   * Create or update a user node
   */
  async createUserNode(userId, userData) {
    const session = neo4jDriver.session();
    try {
      const query = `
        MERGE (u:User {id: $userId})
        SET u.riskTolerance = $riskTolerance,
            u.investmentExperience = $investmentExperience,
            u.updatedAt = datetime()
        RETURN u
      `;
      const result = await session.run(query, {
        userId,
        riskTolerance: userData.riskTolerance || 'moderate',
        investmentExperience: userData.investmentExperience || 'beginner'
      });
      return result.records[0]?.get('u').properties;
    } finally {
      await session.close();
    }
  }

  /**
   * Create or update an investment node
   */
  async createInvestmentNode(symbol, investmentData) {
    const session = neo4jDriver.session();
    try {
      const query = `
        MERGE (i:Investment {symbol: $symbol})
        SET i.name = $name,
            i.type = $type,
            i.sector = $sector,
            i.riskLevel = $riskLevel,
            i.updatedAt = datetime()
        RETURN i
      `;
      const result = await session.run(query, {
        symbol,
        name: investmentData.name,
        type: investmentData.type,
        sector: investmentData.sector || 'Unknown',
        riskLevel: investmentData.riskLevel || 'medium'
      });
      return result.records[0]?.get('i').properties;
    } finally {
      await session.close();
    }
  }

  /**
   * Record user interest in an investment
   */
  async recordUserInterest(userId, symbol, interactionType = 'VIEWED', strength = 1) {
    const session = neo4jDriver.session();
    try {
      const query = `
        MATCH (u:User {id: $userId})
        MATCH (i:Investment {symbol: $symbol})
        MERGE (u)-[r:INTERESTED_IN]->(i)
        ON CREATE SET r.strength = $strength,
                     r.firstInteraction = datetime(),
                     r.type = $interactionType,
                     r.count = 1
        ON MATCH SET r.strength = r.strength + $strength,
                    r.lastInteraction = datetime(),
                    r.count = r.count + 1
        RETURN r
      `;
      await session.run(query, { userId, symbol, interactionType, strength });
    } finally {
      await session.close();
    }
  }

  /**
   * Record user investment action
   */
  async recordInvestmentAction(userId, symbol, action, amount = null) {
    const session = neo4jDriver.session();
    try {
      const relationshipType = action === 'invested' ? 'INVESTED_IN' :
                               action === 'researched' ? 'RESEARCHED' : 'INTERESTED_IN';

      const query = `
        MATCH (u:User {id: $userId})
        MATCH (i:Investment {symbol: $symbol})
        MERGE (u)-[r:${relationshipType}]->(i)
        ON CREATE SET r.createdAt = datetime(),
                     r.amount = $amount,
                     r.count = 1
        ON MATCH SET r.lastUpdated = datetime(),
                    r.count = r.count + 1,
                    r.amount = CASE WHEN $amount IS NOT NULL THEN r.amount + $amount ELSE r.amount END
        RETURN r
      `;
      await session.run(query, { userId, symbol, amount });
    } finally {
      await session.close();
    }
  }

  /**
   * Get investment recommendations based on similar users
   */
  async getRecommendations(userId, limit = 10) {
    const session = neo4jDriver.session();
    try {
      const query = `
        MATCH (u:User {id: $userId})-[r1:INTERESTED_IN|INVESTED_IN]->(i:Investment)
        MATCH (similar:User)-[r2:INTERESTED_IN|INVESTED_IN]->(i)
        WHERE u <> similar
          WITH u, similar,
             COUNT(DISTINCT i) as commonInvestments,
             SUM(r1.strength * r2.strength) as similarity
        ORDER BY similarity DESC
        LIMIT 5

        MATCH (similar)-[r:INTERESTED_IN|INVESTED_IN]->(recommended:Investment)
        WHERE NOT EXISTS((u)-[:INTERESTED_IN|INVESTED_IN]->(recommended))

        RETURN DISTINCT recommended.symbol as symbol,
               recommended.name as name,
               recommended.type as type,
               recommended.sector as sector,
               recommended.riskLevel as riskLevel,
               SUM(r.strength) as score,
               COUNT(DISTINCT similar) as recommendedByUsers
        ORDER BY score DESC
        LIMIT $limit
      `;

      const result = await session.run(query, { userId, limit: neo4j.int(limit) });
      return result.records.map(record => ({
        symbol: record.get('symbol'),
        name: record.get('name'),
        type: record.get('type'),
        sector: record.get('sector'),
        riskLevel: record.get('riskLevel'),
        score: record.get('score').toNumber(),
        recommendedByUsers: record.get('recommendedByUsers').toNumber()
      }));
    } finally {
      await session.close();
    }
  }

  /**
   * Get popular investments by category
   */
  async getPopularInvestments(type = null, limit = 10) {
    const session = neo4jDriver.session();
    try {
      const typeFilter = type ? 'AND i.type = $type' : '';
      const query = `
        MATCH (u:User)-[r:INTERESTED_IN|INVESTED_IN]->(i:Investment)
        WHERE 1=1 ${typeFilter}
        WITH i,
             COUNT(DISTINCT u) as userCount,
             SUM(r.strength) as totalInterest
        RETURN i.symbol as symbol,
               i.name as name,
               i.type as type,
               i.sector as sector,
               i.riskLevel as riskLevel,
               userCount,
               totalInterest
        ORDER BY totalInterest DESC, userCount DESC
        LIMIT $limit
      `;

      const result = await session.run(query, { type, limit: neo4j.int(limit) });
      return result.records.map(record => ({
        symbol: record.get('symbol'),
        name: record.get('name'),
        type: record.get('type'),
        sector: record.get('sector'),
        riskLevel: record.get('riskLevel'),
        userCount: record.get('userCount').toNumber(),
        totalInterest: record.get('totalInterest').toNumber()
      }));
    } finally {
      await session.close();
    }
  }

  /**
   * Get user's investment profile
   */
  async getUserInvestmentProfile(userId) {
    const session = neo4jDriver.session();
    try {
      const query = `
        MATCH (u:User {id: $userId})-[r:INTERESTED_IN|INVESTED_IN]->(i:Investment)
        RETURN i.symbol as symbol,
               i.name as name,
               i.type as type,
               i.sector as sector,
               TYPE(r) as relationshipType,
               r.strength as strength,
               r.count as interactions
        ORDER BY r.strength DESC
      `;

      const result = await session.run(query, { userId });
      return result.records.map(record => ({
        symbol: record.get('symbol'),
        name: record.get('name'),
        type: record.get('type'),
        sector: record.get('sector'),
        relationshipType: record.get('relationshipType'),
        strength: record.get('strength')?.toNumber() || 0,
        interactions: record.get('interactions')?.toNumber() || 0
      }));
    } finally {
      await session.close();
    }
  }

  /**
   * Find similar users based on investment preferences
   */
  async findSimilarUsers(userId, limit = 5) {
    const session = neo4jDriver.session();
    try {
      const query = `
        MATCH (u:User {id: $userId})-[r1:INTERESTED_IN|INVESTED_IN]->(i:Investment)
        MATCH (similar:User)-[r2:INTERESTED_IN|INVESTED_IN]->(i)
        WHERE u <> similar
        WITH similar,
             COUNT(DISTINCT i) as commonInvestments,
             SUM(r1.strength * r2.strength) as similarityScore
        WHERE commonInvestments >= 2
        RETURN similar.id as userId,
               similar.riskTolerance as riskTolerance,
               similar.investmentExperience as investmentExperience,
               commonInvestments,
               similarityScore
        ORDER BY similarityScore DESC
        LIMIT $limit
      `;

      const result = await session.run(query, { userId, limit: neo4j.int(limit) });
      return result.records.map(record => ({
        userId: record.get('userId'),
        riskTolerance: record.get('riskTolerance'),
        investmentExperience: record.get('investmentExperience'),
        commonInvestments: record.get('commonInvestments').toNumber(),
        similarityScore: record.get('similarityScore').toNumber()
      }));
    } finally {
      await session.close();
    }
  }

  /**
   * Clear all graph data (use with caution!)
   */
  async clearAllData() {
    const session = neo4jDriver.session();
    try {
      await session.run('MATCH (n) DETACH DELETE n');
      console.log('All graph data cleared');
    } finally {
      await session.close();
    }
  }
}

module.exports = new GraphService();
