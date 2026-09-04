export interface LessonData {
  id: number;
  order: number;
  title: string;
  description: string;
  content: string;
  example: string;
  why_matters: string;
  key_takeaway: string;
  quiz_question: string;
  quiz_options: string[];
  quiz_correct_index: number;
  quiz_explanation: string;
}

export const LESSONS: LessonData[] = [
  {
    id: 1,
    order: 1,
    title: "What Is a Stock?",
    description: "Understand fractional ownership in a business and how companies divide equity.",
    content: "When a company wants to raise capital to build products, hire talent, or expand operations, it can divide ownership into millions or billions of tiny equal slices called shares of stock.\n\nWhen you buy 1 share of a company, you become a legal part-owner (shareholder). If the company prospers, your slice becomes more valuable. If the company struggles, the value of your slice can decline.",
    example: "Imagine a neighborhood bakery worth ₹10,00,000 divided into 10,000 shares of ₹100 each. If you buy 100 shares for ₹10,000, you own exactly 1% of that bakery and are entitled to 1% of its dividends.",
    why_matters: "Beginners often think stocks are lottery tickets or abstract digital chips. In reality, every ticker represents a living enterprise with real revenues, costs, and assets.",
    key_takeaway: "Buying a stock means purchasing actual fractional ownership in a real-world enterprise.",
    quiz_question: "When you buy one share of stock in a public company, what have you acquired?",
    quiz_options: [
      "A loan that the company must pay back with interest",
      "A fractional ownership share in the business",
      "A guaranteed daily dividend payout",
      "A physical product voucher for the company's store",
    ],
    quiz_correct_index: 1,
    quiz_explanation: "A share represents fractional equity ownership in the corporation.",
  },
  {
    id: 2,
    order: 2,
    title: "How Stock Prices Move (Supply & Demand)",
    description: "Discover why prices fluctuate minute by minute based on buyer eagerness and seller availability.",
    content: "A stock's price is not decided by a computer algorithm or the company's CEO. It is determined continuously by auctions between thousands of human buyers and sellers.\n\nIf positive news breaks (like record quarterly revenues), hundreds of buyers compete to buy, outbidding each other and driving the price UP. If negative news breaks, sellers rush for the exit, accepting lower offers and driving the price DOWN.",
    example: "Think of an auction for a vintage cricket bat. If 50 passionate collectors want it, bidding escalates rapidly. If nobody is interested, the seller must drop the price to make a deal.",
    why_matters: "Prices fluctuate on expectations and crowd sentiment, not just historical facts.",
    key_takeaway: "Prices rise when buyers are more aggressive than sellers, and fall when sellers outnumber buyers.",
    quiz_question: "What directly drives a stock's market price higher during trading hours?",
    quiz_options: [
      "A mandate published by the exchange regulator",
      "Buyers bidding higher prices because demand exceeds willing supply",
      "The CEO manually setting a higher share price on the company website",
      "The total amount of tax paid by the company",
    ],
    quiz_correct_index: 1,
    quiz_explanation: "Price increases occur when eager buyers outbid sellers, shifting the auction equilibrium upwards.",
  },
  {
    id: 3,
    order: 3,
    title: "What Is Trading Volume?",
    description: "Learn how volume reveals market conviction and distinguishes genuine moves from temporary noise.",
    content: "Trading volume is the total number of shares bought and sold during a given period (such as a single trading day).\n\nVolume acts as the market's conviction meter. A +5% price increase on huge volume (e.g., 2.5x normal) means major institutions (mutual funds, pension funds) are aggressively accumulating shares. Conversely, a price swing on very low volume is often just random noise.",
    example: "If a local market sells 10 mangoes in a day, one person paying double doesn't represent real demand. But if 100,000 mangoes sell out in 15 minutes, strong demand is confirmed.",
    why_matters: "Watching price without volume is like watching speed without checking how much fuel is in the tank.",
    key_takeaway: "High volume confirms genuine market conviction; low volume signals uncertainty or noise.",
    quiz_question: "Why do experienced traders pay close attention to unusual surges in trading volume?",
    quiz_options: [
      "Volume shows whether a price move is backed by large institutional conviction or low-liquidity noise",
      "High volume automatically guarantees the stock will never decrease in price",
      "Volume indicates how many employees work at the company",
      "It determines the company's government tax rate",
    ],
    quiz_correct_index: 0,
    quiz_explanation: "Volume measures conviction: heavy volume suggests major institutional participation.",
  },
  {
    id: 4,
    order: 4,
    title: "What Is an Order Book? (Bids & Asks)",
    description: "Understand the live auction mechanism of highest willing buyers and lowest willing sellers.",
    content: "At every millisecond, the exchange maintains a ledger called the Order Book. It contains two columns:\n1. Bids: What buyers are willing to pay\n2. Asks (Offers): What sellers are willing to accept\n\nThe difference between the highest Bid and the lowest Ask is known as the Spread. Highly liquid stocks have tight spreads (a few paise or cents), while thinly traded stocks have wide spreads.",
    example: "In a fish market, a customer shouts 'I will pay ₹300' (Bid). The fisherman replies 'I want ₹310' (Ask). The spread is ₹10. When one yields or they meet in the middle, a trade occurs.",
    why_matters: "Using Market Orders on wide-spread stocks causes 'slippage'—where you pay more than you intended.",
    key_takeaway: "Trades execute only when a buyer's Bid matches or crosses a seller's Ask.",
    quiz_question: "What is the 'Spread' in stock trading?",
    quiz_options: [
      "The total profit earned by the company in a fiscal year",
      "The price difference between the highest buyer's Bid and the lowest seller's Ask",
      "The percentage fee paid to the stockbroker",
      "The distance between two stock exchange offices",
    ],
    quiz_correct_index: 1,
    quiz_explanation: "The spread is the difference between the top bid and top ask in the order book.",
  },
  {
    id: 5,
    order: 5,
    title: "What Is a P/E Ratio?",
    description: "Learn how to evaluate whether a stock is cheap or expensive relative to its underlying earnings.",
    content: "The Price-to-Earnings (P/E) ratio compares a company's share price to its annual earnings per share (EPS):\n\nP/E = Share Price / Annual Earnings Per Share\n\nA P/E of 25 means investors are paying ₹25 for every ₹1 of annual profit the company generates. High P/E usually implies investors expect rapid future growth, while low P/E may signify mature, slower-growing businesses or temporary troubles.",
    example: "If House A generates ₹1,00,000 in rental income and sells for ₹20,00,000, its P/E is 20. If House B makes the same ₹1,00,000 but costs ₹60,00,000 (P/E 60), buyers are paying 3x more for the exact same cash generation.",
    why_matters: "A stock price of ₹50 isn't necessarily cheaper than a stock price of ₹5,000. Valuation depends on earnings.",
    key_takeaway: "The P/E ratio reveals how much you are paying for each rupee or dollar of company profits.",
    quiz_question: "If Company A trades at ₹200 and earns ₹10 per share, what is its P/E ratio?",
    quiz_options: ["2", "10", "20", "2,000"],
    quiz_correct_index: 2,
    quiz_explanation: "P/E = 200 / 10 = 20. Investors pay ₹20 for every ₹1 of earnings.",
  },
  {
    id: 6,
    order: 6,
    title: "Stock Market Indices (Nifty 50, S&P 500)",
    description: "Understand benchmark baskets that gauge the overall health and direction of entire economies.",
    content: "Instead of tracking thousands of individual companies, markets create an Index—a curated basket of representative leading companies weighted by market size.\n\nFor example, the Nifty 50 tracks the 50 largest blue-chip companies in India, while the S&P 500 tracks the 500 largest publicly traded corporations in the United States. If the index is up +1.2%, it generally indicates broad economic optimism.",
    example: "A thermometer doesn't measure every single atom in a room; it measures the ambient temperature. An index is the market's economic thermometer.",
    why_matters: "Index funds allow everyday investors to own an entire economy with minimal fees and maximum diversification.",
    key_takeaway: "An index is a weighted basket of top companies representing broad market performance.",
    quiz_question: "What is the primary role of a stock market index like Nifty 50 or S&P 500?",
    quiz_options: [
      "To set the legal minimum price for all consumer goods",
      "To provide a single benchmark measuring the overall performance of the market or economy",
      "To insure investors against any potential financial losses",
      "To collect tax revenue for the federal treasury",
    ],
    quiz_correct_index: 1,
    quiz_explanation: "Indices serve as broad market health thermometers and benchmark indicators.",
  },
];

export interface StockBaseline {
  symbol: string;
  company_name: string;
  base_price: number;
  base_volume: number;
  average_volume: number;
}

export const FEATURED_STOCKS: StockBaseline[] = [
  {
    symbol: "NVDA",
    company_name: "NVIDIA Corporation",
    base_price: 135.5,
    base_volume: 52000000,
    average_volume: 48000000,
  },
  {
    symbol: "AAPL",
    company_name: "Apple Inc.",
    base_price: 228.4,
    base_volume: 41000000,
    average_volume: 45000000,
  },
  {
    symbol: "MSFT",
    company_name: "Microsoft Corporation",
    base_price: 415.8,
    base_volume: 18500000,
    average_volume: 21000000,
  },
  {
    symbol: "TSLA",
    company_name: "Tesla, Inc.",
    base_price: 214.2,
    base_volume: 68000000,
    average_volume: 62000000,
  },
  {
    symbol: "RELIANCE.NS",
    company_name: "Reliance Industries Limited",
    base_price: 2980.0,
    base_volume: 6500000,
    average_volume: 7200000,
  },
  {
    symbol: "TCS.NS",
    company_name: "Tata Consultancy Services Limited",
    base_price: 4220.0,
    base_volume: 2100000,
    average_volume: 2400000,
  },
];
