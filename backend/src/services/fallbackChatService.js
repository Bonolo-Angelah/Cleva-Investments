/**
 * Fallback chat service for when AI APIs are unavailable
 * Provides intelligent rule-based responses for common investment questions
 */

class FallbackChatService {
  /**
   * Generate intelligent fallback response
   */
  generateResponse(userMessage, systemPrompt) {
    const message = userMessage.toLowerCase();

    // Extract user profile from system prompt
    const riskMatch = systemPrompt.match(/Risk Tolerance: (\w+)/);
    const experienceMatch = systemPrompt.match(/Investment Experience: (\w+)/);
    const riskTolerance = riskMatch ? riskMatch[1] : 'moderate';
    const experience = experienceMatch ? experienceMatch[1] : 'beginner';

    // Market status questions
    if (message.includes('market') && (message.includes('today') || message.includes('doing') || message.includes('trading') || message.includes('how') || message.includes('status'))) {
      return `Based on general South African market conditions, here's what you should know:

📊 **JSE Market Overview:**
The Johannesburg Stock Exchange (JSE) remains one of Africa's largest and most sophisticated markets. Key sectors include:
- **Financial Services** (banks, insurance) - Major players: Standard Bank, FirstRand, Capitec
- **Mining & Resources** - Gold, platinum, coal exports
- **Industrial & Consumer Goods** - Shoprite, Pick n Pay, Woolworths

💡 **For Your Profile** (${riskTolerance} risk, ${experience} experience):
${this.getRiskBasedAdvice(riskTolerance, experience)}

📈 **General Investment Options:**
- **JSE Top 40 Index Funds/ETFs** - Diversified exposure to largest companies
- **Satrix 40 (STX40)** - Popular low-cost JSE Top 40 tracker
- **Bond ETFs** - For conservative portfolios
- **Property/REIT funds** - Real estate exposure

Would you like specific recommendations based on your risk profile?`;
    }

    // Investment recommendations
    if (message.includes('recommend') || message.includes('invest') || message.includes('buy') || message.includes('stock') || message.includes('should i')) {
      return `Based on your ${riskTolerance} risk tolerance and ${experience} experience level:

${this.getRiskBasedAdvice(riskTolerance, experience)}

**Popular JSE Investment Options:**

🏦 **Blue Chip Stocks (Lower Risk):**
- **Standard Bank (SBK)** - Major banking institution
- **Capitec (CPI)** - Growing retail bank
- **Shoprite (SHP)** - Largest food retailer
- **Sasol (SOL)** - Chemicals and energy

📊 **ETFs for Diversification:**
- **Satrix 40 (STX40)** - Tracks top 40 JSE companies
- **CoreShares Top 50** - Diversified equity exposure
- **Satrix RAFI 40** - Fundamentally weighted

💰 **Growth Sectors:**
- Technology & Fintech
- Renewable Energy
- Healthcare
- E-commerce

⚠️ **Important:** Always diversify your portfolio and consider consulting a certified financial advisor for personalized advice. Past performance doesn't guarantee future results.

What type of investment interests you most?`;
    }

    // Strategy questions
    if (message.includes('strategy') || message.includes('plan') || message.includes('how to') || message.includes('start')) {
      return `Here's an investment strategy tailored to your profile:

**Investment Strategy for ${experience} Investor with ${riskTolerance} Risk Tolerance:**

${this.getStrategyAdvice(riskTolerance, experience)}

**Key Principles:**
1. **Diversification** - Don't put all eggs in one basket
2. **Time Horizon** - Longer = more aggressive potential
3. **Regular Contributions** - Dollar-cost averaging
4. **Review & Rebalance** - Quarterly or bi-annually

**South African Investment Mix:**
${this.getPortfolioMix(riskTolerance)}

Would you like me to explain any of these investment types in more detail?`;
    }

    // ETF questions
    if (message.includes('etf')) {
      return `**Exchange Traded Funds (ETFs) in South Africa:**

ETFs are excellent for South African investors because they offer:
- Low costs compared to unit trusts
- Diversification across multiple stocks
- Easy trading on the JSE
- Transparency in holdings

**Popular JSE ETFs:**
- **Satrix 40 (STX40)** - Top 40 companies
- **Satrix DIVI (STXDIV)** - Dividend-focused
- **Satrix Property (STXPRO)** - Real estate exposure
- **NewFunds MAPPS** - Multi-asset portfolio

**For ${riskTolerance} risk investors:**
${riskTolerance === 'conservative' ? 'Focus on bond ETFs and dividend-paying equity ETFs' :
  riskTolerance === 'aggressive' ? 'Consider growth ETFs and sectoral ETFs' :
  'Mix of equity ETFs (60-70%) and bond ETFs (30-40%)'}

ETFs are great for beginners! Would you like to know more about any specific ETF?`;
    }

    // Retirement/TFSA questions
    if (message.includes('retirement') || message.includes('tfsa') || message.includes('tax')) {
      return `**Tax-Efficient Investing in South Africa:**

🎯 **Tax-Free Savings Account (TFSA):**
- Contribute up to R36,000 per year (R500,000 lifetime)
- All gains are tax-free
- Perfect for long-term wealth building
- Available at most banks and investment platforms

💼 **Retirement Annuity (RA):**
- Tax deductible contributions (up to 27.5% of income)
- Tax-free growth until retirement
- Cannot access until age 55
- Ideal for retirement planning

**Recommended for ${experience} investors:**
${experience === 'beginner' ? '1. Start with TFSA - more flexible\n2. Max out TFSA before RA\n3. Use low-cost ETFs in your TFSA' :
  '1. Max out both TFSA and RA contributions\n2. Strategic asset allocation across accounts\n3. Tax-loss harvesting opportunities'}

Would you like help choosing investments for your TFSA or RA?`;
    }

    // Risk/diversification questions
    if (message.includes('risk') || message.includes('diversif') || message.includes('safe')) {
      return `**Understanding Investment Risk and Diversification:**

Your risk profile: **${riskTolerance}**

${this.getRiskExplanation(riskTolerance)}

**Diversification Strategies:**
1. **Asset Classes** - Mix stocks, bonds, property, cash
2. **Sectors** - Don't concentrate in one industry
3. **Geography** - Local and international exposure
4. **Time Diversification** - Regular contributions over time

**Recommended Mix for ${riskTolerance} Risk:**
${this.getPortfolioMix(riskTolerance)}

**Risk Management Tips:**
- Only invest what you can afford to lose
- Keep 3-6 months expenses in emergency fund
- Rebalance portfolio annually
- Understand each investment before buying

Need help balancing risk and returns in your portfolio?`;
    }

    // Default helpful response
    return `I'm here to help with your investment questions!

Based on your profile (${riskTolerance} risk, ${experience} level), I can assist with:

📊 **Market Information**
- JSE market trends and sectors
- Blue chip stock overviews
- ETF recommendations

💡 **Investment Strategies**
- Portfolio diversification
- Risk management
- Long-term vs short-term investing

📈 **Specific Topics**
- South African stocks and ETFs
- Tax-efficient investing (TFSA, RA)
- Retirement planning
- Property vs equity investing

What would you like to know more about? Feel free to ask specific questions about investing in South Africa!`;
  }

  getRiskBasedAdvice(risk, experience) {
    if (risk === 'conservative') {
      return `**Conservative Strategy:**
- 70% fixed income (bonds, money market)
- 20% blue chip equities (banks, retailers)
- 10% property/REITs
- Focus on dividend-paying stocks
- Consider government bonds and quality corporate bonds`;
    } else if (risk === 'aggressive') {
      return `**Aggressive Growth Strategy:**
- 80-90% equities (stocks, growth ETFs)
- 10-15% alternative investments
- 5% cash reserves
- Focus on growth sectors: tech, renewable energy
- Consider emerging market exposure`;
    } else {
      return `**Balanced Strategy:**
- 60% equities (mix of blue chip and growth stocks)
- 30% bonds (government and corporate)
- 10% property/alternative investments
- Good mix of stability and growth potential`;
    }
  }

  getStrategyAdvice(risk, experience) {
    if (experience === 'beginner') {
      return `**Beginner-Friendly Approach:**
1. Start with ETFs for instant diversification
2. Use a low-cost platform (EasyEquities, Satrix)
3. Begin with R500-R1000 monthly contributions
4. Learn while you invest - start small
5. Focus on JSE Top 40 and dividend ETFs`;
    } else if (experience === 'advanced') {
      return `**Advanced Strategy:**
1. Build a core-satellite portfolio (70% index, 30% active)
2. Use technical and fundamental analysis
3. Consider options and derivatives for hedging
4. Optimize for tax efficiency (TFSA, RA)
5. Rebalance quarterly based on market conditions`;
    } else {
      return `**Intermediate Approach:**
1. Mix of index ETFs (60%) and individual stocks (40%)
2. Research companies before investing
3. Use stop-losses to manage risk
4. Diversify across sectors and asset classes
5. Review portfolio performance monthly`;
    }
  }

  getPortfolioMix(risk) {
    if (risk === 'conservative') {
      return `- 30% equities (blue chip stocks)
- 50% bonds (government & corporate)
- 15% property (REITs)
- 5% cash`;
    } else if (risk === 'aggressive') {
      return `- 85% equities (mix of large & small cap)
- 10% alternative investments
- 5% cash reserve`;
    } else {
      return `- 60% equities (JSE Top 40 + growth stocks)
- 25% bonds
- 10% property
- 5% cash`;
    }
  }

  getRiskExplanation(risk) {
    if (risk === 'conservative') {
      return `As a **conservative investor**, you prioritize capital preservation over high returns:
- Lower volatility, more stability
- Focus on income generation (dividends, interest)
- Slower but steadier growth
- Better suited for short-term goals or near-retirement`;
    } else if (risk === 'aggressive') {
      return `As an **aggressive investor**, you're willing to accept higher volatility for potential higher returns:
- Greater price swings in the short term
- Focus on capital appreciation
- Best for long-term goals (10+ years)
- Requires emotional discipline during downturns`;
    } else {
      return `As a **moderate investor**, you seek balanced growth with manageable risk:
- Moderate volatility and returns
- Mix of growth and income
- Suitable for medium-term goals (5-10 years)
- Good balance for most investors`;
    }
  }
}

module.exports = new FallbackChatService();
