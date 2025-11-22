

export enum NodeType {
  // --- 1. SUBJECTS (主体) ---
  ENTITY = 'ENTITY', // Person / Target
  ORGANIZATION = 'ORGANIZATION', // Company, NGO
  THREAT_ACTOR = 'THREAT_ACTOR', // Hacker Group, APT
  IDENTITY = 'IDENTITY', // Fake ID, Alias
  MILITARY_UNIT = 'MILITARY_UNIT', // New: Military specific
  GOV_AGENCY = 'GOV_AGENCY', // New: Government specific

  // --- 2. NETWORK INFRA (网络基础) ---
  IP_ADDRESS = 'IP_ADDRESS',
  MAC_ADDRESS = 'MAC_ADDRESS',
  DOMAIN = 'DOMAIN',
  URL = 'URL',
  SERVER = 'SERVER', 
  C2_SERVER = 'C2_SERVER', // New: Command & Control
  CLOUD_SERVICE = 'CLOUD_SERVICE', 
  WIFI = 'WIFI', 
  ASN = 'ASN',
  SSL_CERT = 'SSL_CERT',
  BOTNET = 'BOTNET', // New
  
  // --- 3. COMMUNICATION & ACCOUNTS (通讯与账号) ---
  EMAIL = 'EMAIL',
  PHONE_NUMBER = 'PHONE_NUMBER',
  SOCIAL_PROFILE = 'SOCIAL_PROFILE',
  MESSAGING_ID = 'MESSAGING_ID', 
  FORUM_ACCOUNT = 'FORUM_ACCOUNT', 
  APP = 'APP', 

  // --- 4. FINANCIAL (金融) ---
  CRYPTO_WALLET = 'CRYPTO_WALLET',
  BANK_ACCOUNT = 'BANK_ACCOUNT',
  CREDIT_CARD = 'CREDIT_CARD',
  TRANSACTION = 'TRANSACTION',

  // --- 5. PHYSICAL WORLD (物理世界) ---
  GEO_LOCATION = 'GEO_LOCATION',
  FACILITY = 'FACILITY', 
  VEHICLE = 'VEHICLE',
  DEVICE = 'DEVICE', 
  WEAPON = 'WEAPON', 
  SIM_CARD = 'SIM_CARD',

  // --- 6. TRAVEL & LOGISTICS (差旅与物流 - NEW) ---
  FLIGHT = 'FLIGHT',
  HOTEL = 'HOTEL',
  SHIPPING = 'SHIPPING', // Container / Cargo
  PASSPORT = 'PASSPORT',
  VISA = 'VISA',

  // --- 7. CONTENT & MEDIA (内容与媒体) ---
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  DOCUMENT = 'DOCUMENT',
  SOCIAL_POST = 'SOCIAL_POST', 
  NEWS_ARTICLE = 'NEWS_ARTICLE',
  DARKWEB_SITE = 'DARKWEB_SITE', 
  FILE_HASH = 'FILE_HASH',
  CODE_SNIPPET = 'CODE_SNIPPET',
  EXPLOIT = 'EXPLOIT', // New
  PHISHING_KIT = 'PHISHING_KIT', // New

  // --- 8. INTELLIGENCE COLLECTION (情报搜集 - NEW) ---
  SOURCE_HUMINT = 'SOURCE_HUMINT', // Human Intelligence Source
  SOURCE_SIGINT = 'SOURCE_SIGINT', // Signals Intelligence
  SOURCE_IMINT = 'SOURCE_IMINT',   // Imagery / Satellite
  SOURCE_GEOINT = 'SOURCE_GEOINT', // Geospatial
  SOURCE_OSINT = 'SOURCE_OSINT',   // Open Source generic
  SOURCE_MASINT = 'SOURCE_MASINT', // Measurement & Signature

  // --- 9. INTELLIGENCE & ANALYSIS (情报与分析) ---
  REPORT = 'REPORT',
  NOTE = 'NOTE',
  EVENT = 'EVENT', 
  CAMPAIGN = 'CAMPAIGN', 
  VULNERABILITY = 'VULNERABILITY',
  MALWARE = 'MALWARE',
  TOPIC = 'TOPIC', 
  HYPOTHESIS = 'HYPOTHESIS', 
  LEGAL_CASE = 'LEGAL_CASE', 
  
  // --- 10. OPS (操作节点) ---
  SEARCH_QUERY = 'SEARCH_QUERY',
  DATA_SOURCE = 'DATA_SOURCE',
  LEAK_DUMP = 'LEAK_DUMP',
  SENSOR = 'SENSOR'
}

export enum ToolCategory {
  AGENT = 'AGENT', // Pure Prompt / Reasoning
  API = 'API',     // External Data Fetching
  MCP = 'MCP'      // Function Calling / Capability
}

// NATO / Admiralty Code System
export interface IntelligenceRating {
  reliability: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  credibility: '1' | '2' | '3' | '4' | '5' | '6';
}

export interface Position {
  x: number;
  y: number;
}

export interface IntelNode {
  id: string;
  type: NodeType;
  title: string;
  content: string; // Short summary
  position: Position;
  rating?: IntelligenceRating;
  // Flexible KV store for entity properties
  data: Record<string, string | number | boolean>; 
  meta?: {
    sourceName?: string;
    tags?: string[];
    imageUrl?: string;
  };
  w?: number;
  h?: number;
  status?: 'NEW' | 'PROCESSED' | 'ERROR' | 'PROCESSING';
  depth: number;
}

export interface Connection {
  id: string;
  sourceId: string;
  targetId: string;
  label?: string;
  type?: 'CONFIRMED' | 'SUSPECTED' | 'CONTRADICTS';
}

// Plugin / Tool Definition (MCP Style)
export interface Tool {
  id: string;
  name: string;
  category: ToolCategory;
  version: string;
  author: string;
  description: string;
  targetTypes: NodeType[]; // Empty = Global Tool
  autoExpand: boolean;
  isCustom?: boolean;
  isSimulated?: boolean; // To mark if the tool uses mock data or real AI/Search
  
  // 1. Agent Config
  promptTemplate?: string; 

  // 2. API Config
  apiConfig?: {
    endpoint: string;
    method: 'GET' | 'POST';
    mockResponse?: any; // For simulation purposes
  };

  // 3. MCP Config (Function Calling)
  mcpConfig?: {
    functionName: string;
    parameters?: any;
  };
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  action: string;
  status: 'info' | 'success' | 'error' | 'warning';
}

export interface AIModelConfig {
  modelId: string;
  temperature: number;
  enableThinking: boolean;
  thinkingBudget: number;
}