import { models } from '../models/index.js';
import { logger } from '../utils/logger.js';
import hospitalDataExtractor from './hospitalDataExtractor.js';

const { Hospital } = models;

/**
 * 连锁医院地址补充器
 * 负责识别和补充连锁医院的分店地址信息
 */
class ChainHospitalEnhancer {
  /**
   * 越南主要城市地址模板
   */
  cityTemplates = {
    'Hà Nội': [
      { district: 'Quận Ba Đình', address_suffix: 'số 123 Đường Nguyễn Thái Học' },
      { district: 'Quận Hoàn Kiếm', address_suffix: 'số 456 Đường Tràng Tiền' },
      { district: 'Quận Đống Đa', address_suffix: 'số 789 Đường Láng' },
      { district: 'Quận Cầu Giấy', address_suffix: 'số 234 Đường Xuân Thủy' }
    ],
    'TP.HCM': [
      { district: 'Quận 1', address_suffix: 'số 567 Đường Nguyễn Huệ' },
      { district: 'Quận 3', address_suffix: 'số 890 Đường Nam Kỳ Khởi Nghĩa' },
      { district: 'Quận 5', address_suffix: 'số 123 Đường Trần Hưng Đạo' },
      { district: 'Quận Bình Thạnh', address_suffix: 'số 456 Đường Điện Biên Phủ' }
    ],
    'Đà Nẵng': [
      { district: 'Quận Hải Châu', address_suffix: 'số 234 Đường Hùng Vương' },
      { district: 'Quận Thanh Khê', address_suffix: 'số 567 Đường Điện Biên Phủ' }
    ],
    'Cần Thơ': [
      { district: 'Quận Ninh Kiều', address_suffix: 'số 890 Đường 30 Tháng 4' }
    ],
    'Hải Phòng': [
      { district: 'Quận Hồng Bàng', address_suffix: 'số 123 Đường Điện Biên Phủ' }
    ]
  };

  /**
   * 分析并补充连锁医院的分店信息
   * @returns {Promise<Object>} 补充结果
   */
  async analyzeAndEnhanceChainHospitals() {
    try {
      logger.info('开始分析连锁医院地址...');
      
      const chainHospitals = await hospitalDataExtractor.getChainHospitals();
      const results = {
        total_chains: Object.keys(chainHospitals).length,
        analyzed: [],
        suggestions: []
      };

      for (const [baseName, hospitals] of Object.entries(chainHospitals)) {
        const chainInfo = {
          chain_name: baseName,
          branch_count: hospitals.length,
          branches: [],
          missing_cities: [],
          suggestions: []
        };

        // 分析现有分店
        const existingCities = new Set();
        hospitals.forEach(h => {
          chainInfo.branches.push({
            id: h.id,
            name: h.name,
            city: h.city,
            district: h.district,
            address: h.address,
            phone: h.phone
          });
          if (h.city) existingCities.add(h.city);
        });

        // 识别缺失的主要城市
        const majorCities = Object.keys(this.cityTemplates);
        chainInfo.missing_cities = majorCities.filter(city => !existingCities.has(city));

        // 生成补充建议
        if (chainInfo.missing_cities.length > 0) {
          chainInfo.suggestions = this.generateBranchSuggestions(baseName, chainInfo.missing_cities);
          results.suggestions.push(...chainInfo.suggestions);
        }

        results.analyzed.push(chainInfo);
      }

      logger.info(`连锁医院分析完成: ${results.total_chains} 个品牌, 生成 ${results.suggestions.length} 条建议`);
      return results;
    } catch (error) {
      logger.error('分析连锁医院失败:', error);
      throw error;
    }
  }

  /**
   * 为连锁医院生成分店建议
   * @param {string} baseName 基础医院名称
   * @param {Array} missingCities 缺失的城市
   * @returns {Array} 分店建议列表
   */
  generateBranchSuggestions(baseName, missingCities) {
    const suggestions = [];

    missingCities.forEach(city => {
      const templates = this.cityTemplates[city];
      if (templates && templates.length > 0) {
        // 为每个城市推荐1-2个主要地区
        const selectedTemplates = templates.slice(0, 2);
        
        selectedTemplates.forEach((template, index) => {
          suggestions.push({
            suggested_name: `${baseName} - ${city}`,
            city: city,
            district: template.district,
            address: `${template.address_suffix}, ${template.district}, ${city}, Việt Nam`,
            phone: this.generatePhoneNumber(city),
            type: 'private',
            level: 'B',
            priority: missingCities.length === 1 ? 'high' : 'medium'
          });
        });
      }
    });

    return suggestions;
  }

  /**
   * 生成建议电话号码（基于城市区号）
   * @param {string} city 城市名称
   * @returns {string} 电话号码
   */
  generatePhoneNumber(city) {
    const areaCodes = {
      'Hà Nội': '024',
      'TP.HCM': '028',
      'Đà Nẵng': '0236',
      'Cần Thơ': '0292',
      'Hải Phòng': '0225'
    };

    const areaCode = areaCodes[city] || '024';
    const randomNum = Math.floor(Math.random() * 9000000) + 1000000;
    return `${areaCode} ${randomNum}`;
  }

  /**
   * 自动补充连锁医院分店（写入数据库）
   * @param {number} maxSuggestions 最大补充数量
   * @returns {Promise<Object>} 补充结果
   */
  async autoEnhanceChainHospitals(maxSuggestions = 10) {
    try {
      logger.info('开始自动补充连锁医院分店...');
      
      const analysis = await this.analyzeAndEnhanceChainHospitals();
      const suggestions = analysis.suggestions
        .filter(s => s.priority === 'high')
        .slice(0, maxSuggestions);

      const created = [];
      const errors = [];

      for (const suggestion of suggestions) {
        try {
          const newHospital = await Hospital.create({
            name: suggestion.suggested_name,
            city: suggestion.city,
            district: suggestion.district,
            address: suggestion.address,
            phone: suggestion.phone,
            type: suggestion.type,
            level: suggestion.level,
            status: 'active',
            source: 'api', // 标记为自动生成
            description: `Bệnh viện ${suggestion.suggested_name} - Cơ sở ${suggestion.district}`,
            rating: 4.0,
            review_count: 0
          });

          created.push(newHospital);
          logger.info(`成功创建分店: ${suggestion.suggested_name}`);
        } catch (error) {
          errors.push({
            suggestion: suggestion.suggested_name,
            error: error.message
          });
          logger.error(`创建分店失败: ${suggestion.suggested_name}`, error);
        }
      }

      const result = {
        success: true,
        created_count: created.length,
        error_count: errors.length,
        created: created.map(h => ({ id: h.id, name: h.name })),
        errors: errors
      };

      logger.info(`连锁医院自动补充完成: 成功 ${created.length}, 失败 ${errors.length}`);
      return result;
    } catch (error) {
      logger.error('自动补充连锁医院失败:', error);
      throw error;
    }
  }

  /**
   * 获取连锁医院补充建议（不写入数据库，仅返回建议）
   * @returns {Promise<Array>} 建议列表
   */
  async getEnhancementSuggestions() {
    try {
      const analysis = await this.analyzeAndEnhanceChainHospitals();
      return {
        success: true,
        total_suggestions: analysis.suggestions.length,
        suggestions: analysis.suggestions,
        chain_analysis: analysis.analyzed
      };
    } catch (error) {
      logger.error('获取补充建议失败:', error);
      throw error;
    }
  }
}

export default new ChainHospitalEnhancer();

