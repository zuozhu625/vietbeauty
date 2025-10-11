// 前端API调用工具
const API_BASE_URL = 'http://localhost:5002/api';

// 通用API请求函数
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API请求失败');
    }
    
    return data;
  } catch (error) {
    console.error('API请求错误:', error);
    throw error;
  }
}

// 用户分享API
export const userShareAPI = {
  // 获取用户分享列表
  async getList(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/user-shares?${queryString}`);
  },

  // 获取单个用户分享
  async getById(id) {
    return apiRequest(`/user-shares/${id}`);
  },

  // 获取用户分享详情 (别名)
  async getDetail(id) {
    return apiRequest(`/user-shares/${id}`);
  },

  // 点赞用户分享
  async like(id) {
    return apiRequest(`/user-shares/${id}/like`, {
      method: 'POST',
    });
  },
};

// 知识问答API
export const knowledgeAPI = {
  // 获取知识问答列表
  async getList(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/knowledge?${queryString}`);
  },

  // 获取单个知识问答
  async getById(id) {
    return apiRequest(`/knowledge/${id}`);
  },

  // 获取知识问答详情 (别名)
  async getDetail(id) {
    return apiRequest(`/knowledge/${id}`);
  },

  // 点赞知识问答
  async like(id) {
    return apiRequest(`/knowledge/${id}/like`, {
      method: 'POST',
    });
  },
};

// 医院API
export const hospitalAPI = {
  // 获取医院列表
  async getList(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/hospitals?${queryString}`);
  },

  // 获取单个医院
  async getById(id) {
    return apiRequest(`/hospitals/${id}`);
  },

  // 获取医院详情 (别名)
  async getDetail(id) {
    return apiRequest(`/hospitals/${id}`);
  },
};

// 服务API
export const serviceAPI = {
  // 获取服务列表
  async getList(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/services?${queryString}`);
  },

  // 获取单个服务
  async getById(id) {
    return apiRequest(`/services/${id}`);
  },
};

// 联系API
export const contactAPI = {
  // 创建联系记录
  async create(data) {
    return apiRequest('/contacts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Webhook API
export const webhookAPI = {
  // 发送数据到N8N
  async sendToN8N(data) {
    return apiRequest('/webhooks/n8n', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 批量发送数据
  async sendBatch(items) {
    return apiRequest('/webhooks/batch', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  },

  // 获取同步状态
  async getSyncStatus() {
    return apiRequest('/webhooks/sync-status');
  },
};

export default {
  userShareAPI,
  knowledgeAPI,
  hospitalAPI,
  serviceAPI,
  contactAPI,
  webhookAPI,
};
