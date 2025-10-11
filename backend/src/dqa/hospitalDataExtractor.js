import { models } from '../models/index.js';
import { logger } from '../utils/logger.js';

const { Hospital } = models;

/**
 * 医院数据提取器
 * 负责从数据库中提取医院信息并生成清单
 */
class HospitalDataExtractor {
  /**
   * 获取所有活跃医院清单
   * @returns {Promise<Array>} 医院清单
   */
  async getAllHospitals() {
    try {
      const hospitals = await Hospital.findAll({
        where: { status: 'active' },
        order: [['id', 'ASC']]
      });

      logger.info(`成功提取 ${hospitals.length} 家医院数据`);
      return hospitals;
    } catch (error) {
      logger.error('提取医院数据失败:', error);
      throw error;
    }
  }

  /**
   * 获取连锁型医院
   * 通过医院名称前缀识别连锁医院
   * @returns {Promise<Object>} 按名称分组的连锁医院
   */
  async getChainHospitals() {
    try {
      const hospitals = await this.getAllHospitals();
      
      // 按名称分组识别连锁医院
      const chainGroups = {};
      
      hospitals.forEach(hospital => {
        // 提取医院名称的核心部分（去除地区后缀）
        const baseName = this.extractBaseName(hospital.name);
        
        if (!chainGroups[baseName]) {
          chainGroups[baseName] = [];
        }
        chainGroups[baseName].push(hospital);
      });

      // 过滤出真正的连锁医院（多于1家分店）
      const chainHospitals = Object.entries(chainGroups)
        .filter(([name, hospitals]) => hospitals.length > 1)
        .reduce((acc, [name, hospitals]) => {
          acc[name] = hospitals;
          return acc;
        }, {});

      logger.info(`识别出 ${Object.keys(chainHospitals).length} 个连锁医院品牌`);
      return chainHospitals;
    } catch (error) {
      logger.error('获取连锁医院失败:', error);
      throw error;
    }
  }

  /**
   * 提取医院基础名称（去除城市/地区后缀）
   * @param {string} fullName 完整医院名称
   * @returns {string} 基础名称
   */
  extractBaseName(fullName) {
    // 常见的地区后缀模式
    const patterns = [
      /\s*-\s*(?:Hà Nội|TP\.HCM|Đà Nẵng|Hải Phòng|Cần Thơ|Nha Trang|Huế|Vũng Tàu|Biên Hòa)/i,
      /\s*(?:Chi nhánh|Cơ sở)\s*\d+/i,
      /\s*(?:Quận|Huyện)\s*\d+/i
    ];

    let baseName = fullName;
    patterns.forEach(pattern => {
      baseName = baseName.replace(pattern, '');
    });

    return baseName.trim();
  }

  /**
   * 生成医院信息摘要清单（用于查看）
   * @returns {Promise<Array>} 医院摘要清单
   */
  async generateHospitalSummary() {
    try {
      const hospitals = await this.getAllHospitals();
      
      const summary = hospitals.map((h, index) => ({
        序号: index + 1,
        ID: h.id,
        医院名称: h.name,
        城市: h.city || '未知',
        地区: h.district || '未知',
        等级: h.level || '未知',
        类型: h.type || '未知',
        电话: h.phone || '未知',
        评分: h.rating || '未评分',
        认证数量: h.certifications ? h.certifications.length : 0,
        服务项目数: h.services ? h.services.length : 0
      }));

      logger.info(`生成医院摘要清单完成，共 ${summary.length} 家`);
      return summary;
    } catch (error) {
      logger.error('生成医院摘要失败:', error);
      throw error;
    }
  }

  /**
   * 获取指定ID的医院
   * @param {number} hospitalId 医院ID
   * @returns {Promise<Object>} 医院信息
   */
  async getHospitalById(hospitalId) {
    try {
      const hospital = await Hospital.findByPk(hospitalId);
      if (!hospital) {
        throw new Error(`医院ID ${hospitalId} 不存在`);
      }
      return hospital;
    } catch (error) {
      logger.error(`获取医院ID ${hospitalId} 失败:`, error);
      throw error;
    }
  }

  /**
   * 按城市统计医院分布
   * @returns {Promise<Object>} 城市分布统计
   */
  async getCityDistribution() {
    try {
      const hospitals = await this.getAllHospitals();
      
      const distribution = {};
      hospitals.forEach(h => {
        const city = h.city || '未知城市';
        if (!distribution[city]) {
          distribution[city] = 0;
        }
        distribution[city]++;
      });

      logger.info('医院城市分布统计完成');
      return distribution;
    } catch (error) {
      logger.error('统计医院分布失败:', error);
      throw error;
    }
  }
}

export default new HospitalDataExtractor();

