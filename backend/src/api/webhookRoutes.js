import express from 'express';
import { models } from '../models/index.js';
import Joi from 'joi';

const router = express.Router();
const { UserShare, Knowledge, Hospital, Service, Contact } = models;

// N8N Webhook 验证模式
const n8nWebhookSchema = Joi.object({
  type: Joi.string().valid('user_share', 'knowledge', 'hospital', 'service', 'contact').required(),
  data: Joi.object().required(),
  source: Joi.string().default('n8n'),
  timestamp: Joi.date().default(() => new Date())
});

// 处理N8N Webhook
router.post('/n8n', async (req, res) => {
  try {
    const { error, value } = n8nWebhookSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Webhook数据验证失败',
        errors: error.details
      });
    }

    const { type, data, source } = value;
    let result;

    switch (type) {
      case 'user_share':
        result = await processUserShare(data, source);
        break;
      case 'knowledge':
        result = await processKnowledge(data, source);
        break;
      case 'hospital':
        result = await processHospital(data, source);
        break;
      case 'service':
        result = await processService(data, source);
        break;
      case 'contact':
        result = await processContact(data, source);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: '不支持的数据类型'
        });
    }

    res.json({
      success: true,
      message: `${type}数据处理成功`,
      data: result
    });
  } catch (error) {
    console.error('Webhook处理失败:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook处理失败',
      error: error.message
    });
  }
});

// 处理用户分享数据
async function processUserShare(data, source) {
  const userShareData = {
    title: data.title,
    content: data.content,
    author_name: data.author_name,
    author_avatar: data.author_avatar,
    surgery_type: data.surgery_type,
    hospital_name: data.hospital_name,
    rating: data.rating,
    images: data.images || [],
    tags: data.tags || [],
    source,
    external_id: data.external_id || data.id
  };

  // 检查是否已存在
  const existing = await UserShare.findOne({
    where: { external_id: userShareData.external_id }
  });

  if (existing) {
    return await existing.update(userShareData);
  } else {
    return await UserShare.create(userShareData);
  }
}

// 处理知识问答数据
async function processKnowledge(data, source) {
  const knowledgeData = {
    question: data.question,
    answer: data.answer,
    category: data.category || 'Tư vấn chung',
    subcategory: data.subcategory,
    doctor_name: data.doctor_name || 'Bác sĩ chuyên khoa',
    doctor_title: data.doctor_title,
    doctor_avatar: data.doctor_avatar,
    hospital_name: data.hospital_name,
    tags: data.tags || [],
    difficulty_level: data.difficulty_level || 'beginner',
    source,
    external_id: data.external_id || data.id || `knowledge_${Date.now()}`
  };

  // 如果有 external_id，尝试查找现有记录
  let existing = null;
  if (knowledgeData.external_id) {
    existing = await Knowledge.findOne({
      where: { external_id: knowledgeData.external_id }
    });
  }

  if (existing) {
    return await existing.update(knowledgeData);
  } else {
    return await Knowledge.create(knowledgeData);
  }
}

// 处理医院数据
async function processHospital(data, source) {
  const hospitalData = {
    name: data.name,
    description: data.description,
    address: data.address,
    city: data.city,
    district: data.district,
    phone: data.phone,
    email: data.email,
    website: data.website,
    logo_url: data.logo_url,
    images: data.images || [],
    rating: data.rating,
    specialties: data.specialties || [],
    services: data.services || [],
    facilities: data.facilities || [],
    certifications: data.certifications || [],
    level: data.level,
    type: data.type || 'private',
    source,
    external_id: data.external_id || data.id
  };

  const existing = await Hospital.findOne({
    where: { external_id: hospitalData.external_id }
  });

  if (existing) {
    return await existing.update(hospitalData);
  } else {
    return await Hospital.create(hospitalData);
  }
}

// 处理服务数据
async function processService(data, source) {
  const serviceData = {
    name: data.name,
    description: data.description,
    category: data.category,
    subcategory: data.subcategory,
    price_min: data.price_min,
    price_max: data.price_max,
    currency: data.currency || 'USD',
    duration: data.duration,
    recovery_time: data.recovery_time,
    difficulty_level: data.difficulty_level || 'intermediate',
    icon: data.icon,
    images: data.images || [],
    features: data.features || [],
    requirements: data.requirements || [],
    risks: data.risks || [],
    tags: data.tags || [],
    is_popular: data.is_popular || false,
    is_recommended: data.is_recommended || false,
    source,
    external_id: data.external_id || data.id
  };

  const existing = await Service.findOne({
    where: { external_id: serviceData.external_id }
  });

  if (existing) {
    return await existing.update(serviceData);
  } else {
    return await Service.create(serviceData);
  }
}

// 处理联系数据
async function processContact(data, source) {
  const contactData = {
    name: data.name,
    email: data.email,
    phone: data.phone,
    subject: data.subject,
    message: data.message,
    inquiry_type: data.inquiry_type || 'general',
    preferred_contact: data.preferred_contact || 'email',
    hospital_interest: data.hospital_interest,
    service_interest: data.service_interest,
    budget_range: data.budget_range,
    timeline: data.timeline,
    source,
    external_id: data.external_id || data.id
  };

  return await Contact.create(contactData);
}

// 批量处理数据
router.post('/batch', async (req, res) => {
  try {
    const { items } = req.body;
    
    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: '数据格式错误，期望数组格式'
      });
    }

    const results = [];
    const errors = [];

    for (const item of items) {
      try {
        const { type, data, source = 'api' } = item;
        let result;

        switch (type) {
          case 'user_share':
            result = await processUserShare(data, source);
            break;
          case 'knowledge':
            result = await processKnowledge(data, source);
            break;
          case 'hospital':
            result = await processHospital(data, source);
            break;
          case 'service':
            result = await processService(data, source);
            break;
          case 'contact':
            result = await processContact(data, source);
            break;
          default:
            errors.push({ item, error: '不支持的数据类型' });
            continue;
        }

        results.push({ type, id: result.id, success: true });
      } catch (error) {
        errors.push({ item, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `批量处理完成，成功: ${results.length}, 失败: ${errors.length}`,
      results,
      errors
    });
  } catch (error) {
    console.error('批量处理失败:', error);
    res.status(500).json({
      success: false,
      message: '批量处理失败',
      error: error.message
    });
  }
});

// 数据同步状态检查
router.get('/sync-status', async (req, res) => {
  try {
    const stats = {
      user_shares: await UserShare.count(),
      knowledge: await Knowledge.count(),
      hospitals: await Hospital.count(),
      services: await Service.count(),
      contacts: await Contact.count()
    };

    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('获取同步状态失败:', error);
    res.status(500).json({
      success: false,
      message: '获取同步状态失败',
      error: error.message
    });
  }
});

export default router;
