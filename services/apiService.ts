import { Tool, IntelNode, ExternalApiKeys } from '../types';

/**
 * 通用外部 API 调用服务
 * 通过 Electron 主进程代理请求，绕过 CORS 限制
 */

/** 从 node.data 中按路径提取值 */
function getNodeDataValue(node: IntelNode, path: string): string | undefined {
  const value = node.data[path];
  if (value === undefined || value === null) return undefined;
  return String(value).trim();
}

/** 替换 URL 模板中的占位符 */
function interpolateUrl(template: string, params: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), encodeURIComponent(value));
  }
  return result;
}

/** 根据 apiKeyField 配置注入 API Key */
function injectApiKey(
  headers: Record<string, string>,
  queryParams: Record<string, string>,
  apiKeyField: string | undefined,
  apiKey: string | undefined
): { headers: Record<string, string>; queryParams: Record<string, string> } {
  if (!apiKeyField || !apiKey) return { headers, queryParams };
  
  const [location, fieldName] = apiKeyField.split('.');
  if (location === 'headers') {
    return { headers: { ...headers, [fieldName]: apiKey }, queryParams };
  }
  if (location === 'queryParams') {
    return { headers, queryParams: { ...queryParams, [fieldName]: apiKey } };
  }
  return { headers, queryParams };
}

/** 构建查询字符串 */
function buildQueryString(params: Record<string, string>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== '');
  if (entries.length === 0) return '';
  return '?' + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
}

/** 调用真实外部 API */
export async function fetchExternalApi(
  tool: Tool,
  node: IntelNode,
  apiKeys: ExternalApiKeys
): Promise<any> {
  const config = tool.apiConfig!;
  
  // 1. 提取参数值
  const params: Record<string, string> = {};
  if (config.paramMapping) {
    for (const [urlParam, dataPath] of Object.entries(config.paramMapping)) {
      const value = getNodeDataValue(node, dataPath);
      if (value) {
        params[urlParam] = value;
      }
    }
  }
  
  // 2. 提取目标标识符（fallback：title）
  const targetValue = node.title || '';
  if (!params.target && targetValue) {
    params.target = targetValue;
  }
  
  // 3. 确定使用哪个 API Key
  let apiKey: string | undefined;
  if (tool.id.includes('virustotal')) apiKey = apiKeys.virustotal;
  else if (tool.id.includes('shodan')) apiKey = apiKeys.shodan;
  else if (tool.id.includes('flightaware')) apiKey = apiKeys.flightaware;
  else if (tool.id.includes('hibp') || tool.id.includes('breach')) apiKey = apiKeys.hibp;
  else if (tool.id.includes('urlscan')) apiKey = apiKeys.urlscan;
  else if (tool.id.includes('etherscan') || tool.id.includes('blockchain')) apiKey = apiKeys.etherscan;
  else if (tool.id.includes('securitytrails') || tool.id.includes('ssl_subdomains') || tool.id.includes('dns_resolve')) apiKey = apiKeys.securitytrails;
  else if (tool.id.includes('otx') || tool.id.includes('threat')) apiKey = apiKeys.otx;
  else if (tool.id.includes('opencorporates') || tool.id.includes('company_graph')) apiKey = apiKeys.opencorporates;
  else if (tool.id.includes('serpapi') || tool.id.includes('search')) apiKey = apiKeys.serpapi;
  
  // 4. 注入 API Key
  let { headers, queryParams } = injectApiKey(
    { ...(config.headers || {}) },
    { ...(config.queryParams || {}) },
    config.apiKeyField,
    apiKey
  );
  
  // 5. 构建最终 URL
  let url = interpolateUrl(config.endpoint, params);
  const qs = buildQueryString(queryParams);
  if (qs) url += qs;
  
  // 6. 通过 Electron IPC 代理请求
  const electronAPI = (window as any).electronAPI;
  if (!electronAPI?.fetchExternalApi) {
    throw new Error('Electron API 不可用，无法发起外部请求');
  }
  
  console.log(`[External API] ${config.method} ${url}`);
  
  const result = await electronAPI.fetchExternalApi({
    url,
    method: config.method,
    headers,
    body: config.body
  });
  
  if (!result.ok) {
    // HIBP returns 404 when account has no breaches — this is expected, not an error
    if ((tool.id.includes('hibp') || tool.id.includes('breach')) && result.status === 404) {
      return { noBreaches: true, message: '该邮箱未出现在已知泄露事件中' };
    }
    const errMsg = result.status === 401 
      ? `API 认证失败 (401)，请检查 ${tool.name} 的 API Key 是否有效`
      : result.status === 429
      ? `API 请求频率限制 (429)，请稍后重试`
      : `API 请求失败 [${result.status}]: ${result.statusText}`;
    throw new Error(errMsg);
  }
  
  return result.data;
}

/** DoH (DNS over HTTPS) 多记录类型查询 — 无需 API Key */
async function fetchDoH(domain: string): Promise<any> {
  const electronAPI = (window as any).electronAPI;
  if (!electronAPI?.fetchExternalApi) {
    throw new Error('Electron API 不可用');
  }
  
  const types = ['A', 'AAAA', 'MX', 'NS', 'TXT'];
  const results: Record<string, any> = {};
  
  for (const type of types) {
    const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${type}`;
    const res = await electronAPI.fetchExternalApi({
      url,
      method: 'GET',
      headers: { accept: 'application/dns-json' }
    });
    if (res.ok && res.data) {
      results[type] = res.data;
    }
  }
  
  return { DoH: true, domain, records: results };
}

/** Mock 数据回退（当真实 API 不可用时） */
export async function fetchApiWithFallback(
  tool: Tool,
  node: IntelNode,
  apiKeys: ExternalApiKeys
): Promise<any> {
  try {
    // 特殊处理：DoH 不需要 API Key
    if (tool.id.includes('dns_resolve')) {
      const domain = node.title || node.data['域名'] || '';
      if (domain) {
        return await fetchDoH(domain);
      }
      return tool.apiConfig?.mockResponse || {};
    }
    
    // 如果没有配置 API Key，直接返回 mock
    const hasKey = (tool.id.includes('virustotal') && apiKeys.virustotal) ||
                   (tool.id.includes('shodan') && apiKeys.shodan) ||
                   (tool.id.includes('flightaware') && apiKeys.flightaware) ||
                   ((tool.id.includes('hibp') || tool.id.includes('breach')) && apiKeys.hibp) ||
                   (tool.id.includes('urlscan') && apiKeys.urlscan) ||
                   ((tool.id.includes('etherscan') || tool.id.includes('blockchain')) && apiKeys.etherscan) ||
                   ((tool.id.includes('securitytrails') || tool.id.includes('ssl_subdomains')) && apiKeys.securitytrails) ||
                   ((tool.id.includes('otx') || tool.id.includes('threat')) && apiKeys.otx) ||
                   ((tool.id.includes('opencorporates') || tool.id.includes('company_graph')) && apiKeys.opencorporates) ||
                   ((tool.id.includes('serpapi') || tool.id.includes('search')) && apiKeys.serpapi);
    
    if (!hasKey) {
      console.warn(`[${tool.name}] 未配置 API Key，使用模拟数据`);
      return tool.apiConfig?.mockResponse || {};
    }
    
    return await fetchExternalApi(tool, node, apiKeys);
  } catch (error) {
    console.warn(`[${tool.name}] 真实 API 调用失败，回退到模拟数据:`, error);
    if (tool.apiConfig?.mockResponse) {
      return tool.apiConfig.mockResponse;
    }
    throw error;
  }
}
