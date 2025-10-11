import { logger } from '../utils/logger.js';
import hospitalDataExtractor from './hospitalDataExtractor.js';

/**
 * DQA问答内容生成器
 * 自动根据医院信息生成各类问答内容
 */
class DQAGenerator {
  /**
   * 问题模板类型
   */
  questionTemplates = {
    // 医院资质相关问题
    certification: [
      {
        template: '{hospital_name} có những chứng nhận y tế nào?',
        generator: (hospital) => this.generateCertificationAnswer(hospital)
      },
      {
        template: '{hospital_name} có đủ tiêu chuẩn hoạt động không?',
        generator: (hospital) => this.generateStandardAnswer(hospital)
      },
      {
        template: 'Giấy phép hoạt động của {hospital_name} như thế nào?',
        generator: (hospital) => this.generateLicenseAnswer(hospital)
      }
    ],

    // 医院等级相关问题
    level: [
      {
        template: '{hospital_name} là bệnh viện hạng nào?',
        generator: (hospital) => this.generateLevelAnswer(hospital)
      },
      {
        template: 'Đánh giá cấp độ của {hospital_name}?',
        generator: (hospital) => this.generateRatingAnswer(hospital)
      }
    ],

    // 服务内容相关问题
    services: [
      {
        template: '{hospital_name} cung cấp những dịch vụ gì?',
        generator: (hospital) => this.generateServicesAnswer(hospital)
      },
      {
        template: 'Các dịch vụ chuyên khoa tại {hospital_name}?',
        generator: (hospital) => this.generateSpecialtiesAnswer(hospital)
      },
      {
        template: '{hospital_name} có dịch vụ {service_type} không?',
        generator: (hospital, service) => this.generateSpecificServiceAnswer(hospital, service)
      }
    ],

    // 地址相关问题
    location: [
      {
        template: '{hospital_name} ở đâu?',
        generator: (hospital) => this.generateLocationAnswer(hospital)
      },
      {
        template: 'Địa chỉ cụ thể của {hospital_name}?',
        generator: (hospital) => this.generateAddressAnswer(hospital)
      },
      {
        template: 'Làm sao để đến {hospital_name}?',
        generator: (hospital) => this.generateDirectionsAnswer(hospital)
      }
    ],

    // 联系方式相关问题
    contact: [
      {
        template: 'Số điện thoại của {hospital_name} là gì?',
        generator: (hospital) => this.generatePhoneAnswer(hospital)
      },
      {
        template: 'Cách liên hệ với {hospital_name}?',
        generator: (hospital) => this.generateContactAnswer(hospital)
      },
      {
        template: 'Làm sao để đặt lịch tại {hospital_name}?',
        generator: (hospital) => this.generateAppointmentAnswer(hospital)
      }
    ],

    // 医生团队相关问题
    doctors: [
      {
        template: 'Đội ngũ bác sĩ tại {hospital_name} như thế nào?',
        generator: (hospital) => this.generateDoctorsAnswer(hospital)
      },
      {
        template: '{hospital_name} có bác sĩ chuyên môn cao không?',
        generator: (hospital) => this.generateExpertiseAnswer(hospital)
      }
    ]
  };

  /**
   * 服务类型列表
   */
  serviceTypes = [
    'nâng mũi', 'cắt mí', 'gọt mặt', 'nâng ngực', 
    'hút mỡ', 'làm đẹp da', 'căng da mặt', 'botox'
  ];

  /**
   * 生成单个DQA问答
   * @param {Object} hospital 医院对象
   * @param {string} questionType 问题类型
   * @returns {Object} 问答对象
   */
  async generateSingleDQA(hospital, questionType = null) {
    try {
      // 如果没有指定类型，随机选择
      if (!questionType) {
        const types = Object.keys(this.questionTemplates);
        questionType = types[Math.floor(Math.random() * types.length)];
      }

      const templates = this.questionTemplates[questionType];
      if (!templates || templates.length === 0) {
        throw new Error(`无效的问题类型: ${questionType}`);
      }

      // 随机选择一个模板
      const templateObj = templates[Math.floor(Math.random() * templates.length)];
      
      // 生成问题
      let question = templateObj.template.replace('{hospital_name}', hospital.name);
      
      // 如果是服务类型问题，添加具体服务
      if (questionType === 'services' && question.includes('{service_type}')) {
        const service = this.serviceTypes[Math.floor(Math.random() * this.serviceTypes.length)];
        question = question.replace('{service_type}', service);
      }

      // 生成答案
      const answer = await templateObj.generator(hospital);

      return {
        question,
        answer,
        category: 'Tư vấn bệnh viện',
        subcategory: this.getCategoryLabel(questionType),
        hospital_name: hospital.name,
        doctor_name: 'Chuyên gia tư vấn',
        doctor_title: 'Bác sĩ chuyên khoa',
        tags: ['bệnh viện', hospital.city || 'Việt Nam', questionType],
        difficulty_level: 'beginner',
        status: 'published',
        source: 'api'
      };
    } catch (error) {
      logger.error('生成DQA失败:', error);
      throw error;
    }
  }

  /**
   * 获取分类标签
   */
  getCategoryLabel(type) {
    const labels = {
      certification: 'Chứng nhận',
      level: 'Đánh giá',
      services: 'Dịch vụ',
      location: 'Địa chỉ',
      contact: 'Liên hệ',
      doctors: 'Đội ngũ'
    };
    return labels[type] || 'Khác';
  }

  // ========== 答案生成方法 ==========

  generateCertificationAnswer(hospital) {
    const certs = hospital.certifications || [];
    if (certs.length > 0) {
      const certList = certs.map(c => `- ${c}`).join('\n');
      return `${hospital.name} đã được cấp các chứng nhận sau:\n\n${certList}\n\nTất cả chứng nhận đều được Bộ Y tế Việt Nam công nhận và đảm bảo tiêu chuẩn chất lượng cao.`;
    }
    return `${hospital.name} là bệnh viện được cấp phép hoạt động hợp pháp bởi Bộ Y tế Việt Nam. Bệnh viện tuân thủ đầy đủ các quy định về an toàn y tế và chất lượng dịch vụ.`;
  }

  generateStandardAnswer(hospital) {
    const level = hospital.level || 'B';
    return `${hospital.name} đáp ứng đầy đủ tiêu chuẩn hoạt động của bệnh viện hạng ${level}. Cơ sở y tế được kiểm tra định kỳ và duy trì các tiêu chuẩn về: cơ sở vật chất, trang thiết bị y tế, đội ngũ nhân viên chuyên môn, và quy trình điều trị an toàn.`;
  }

  generateLicenseAnswer(hospital) {
    return `${hospital.name} có giấy phép hoạt động hợp pháp được cấp bởi Sở Y tế và Bộ Y tế Việt Nam. Giấy phép được gia hạn định kỳ và tuân thủ các quy định hiện hành về hoạt động phẫu thuật thẩm mỹ.`;
  }

  generateLevelAnswer(hospital) {
    const level = hospital.level || 'B';
    const rating = hospital.rating || 4.0;
    const levelDesc = {
      'A': 'hạng A (cao nhất)',
      'B': 'hạng B (tiêu chuẩn cao)',
      'C': 'hạng C (tiêu chuẩn tốt)',
      'D': 'hạng D (tiêu chuẩn cơ bản)'
    };
    return `${hospital.name} là bệnh viện ${levelDesc[level] || 'hạng B'}. Với đánh giá ${rating}/5.0 từ người dùng, bệnh viện cung cấp dịch vụ chất lượng và đáng tin cậy.`;
  }

  generateRatingAnswer(hospital) {
    const rating = hospital.rating || 4.0;
    const reviewCount = hospital.review_count || 0;
    let desc = '';
    if (rating >= 4.5) desc = 'xuất sắc';
    else if (rating >= 4.0) desc = 'rất tốt';
    else if (rating >= 3.5) desc = 'tốt';
    else desc = 'ổn định';
    
    return `${hospital.name} được đánh giá ${desc} với ${rating}/5.0 sao từ ${reviewCount} lượt đánh giá. Bệnh viện cam kết cung cấp dịch vụ chất lượng và chăm sóc khách hàng tận tâm.`;
  }

  generateServicesAnswer(hospital) {
    const services = hospital.services || [];
    const specialties = hospital.specialties || [];
    
    if (services.length > 0) {
      const serviceList = services.slice(0, 8).map(s => `- ${s}`).join('\n');
      return `${hospital.name} cung cấp các dịch vụ phẫu thuật thẩm mỹ:\n\n${serviceList}\n\nVà nhiều dịch vụ khác. Vui lòng liên hệ để được tư vấn chi tiết.`;
    }
    
    return `${hospital.name} cung cấp đa dạng dịch vụ phẫu thuật thẩm mỹ bao gồm: phẫu thuật khuôn mặt, nâng ngực, hút mỡ, làm đẹp da, và nhiều dịch vụ khác. Vui lòng liên hệ ${hospital.phone || 'bệnh viện'} để được tư vấn chi tiết.`;
  }

  generateSpecialtiesAnswer(hospital) {
    const specialties = hospital.specialties || [];
    if (specialties.length > 0) {
      const specList = specialties.map(s => `- ${s}`).join('\n');
      return `Các chuyên khoa tại ${hospital.name}:\n\n${specList}\n\nĐội ngũ bác sĩ giàu kinh nghiệm, trang thiết bị hiện đại.`;
    }
    return `${hospital.name} chuyên về các lĩnh vực phẫu thuật thẩm mỹ toàn diện, với đội ngũ bác sĩ chuyên môn cao và trang thiết bị y tế hiện đại.`;
  }

  generateSpecificServiceAnswer(hospital, service) {
    const services = hospital.services || [];
    const hasService = services.some(s => s.toLowerCase().includes(service.toLowerCase()));
    
    if (hasService) {
      return `Có, ${hospital.name} có cung cấp dịch vụ ${service}. Đây là một trong những dịch vụ chuyên môn của bệnh viện với đội ngũ bác sĩ giàu kinh nghiệm. Vui lòng liên hệ ${hospital.phone || 'bệnh viện'} để đặt lịch tư vấn.`;
    }
    return `${hospital.name} cung cấp nhiều dịch vụ phẫu thuật thẩm mỹ. Về dịch vụ ${service}, vui lòng liên hệ trực tiếp ${hospital.phone || 'bệnh viện'} để được tư vấn chi tiết nhất.`;
  }

  generateLocationAnswer(hospital) {
    const city = hospital.city || 'Việt Nam';
    const district = hospital.district || '';
    return `${hospital.name} tọa lạc tại ${district ? district + ', ' : ''}${city}. ${hospital.address ? `Địa chỉ cụ thể: ${hospital.address}` : 'Vui lòng liên hệ để biết địa chỉ chi tiết.'}`;
  }

  generateAddressAnswer(hospital) {
    if (hospital.address) {
      return `Địa chỉ: ${hospital.address}\nThành phố: ${hospital.city || 'N/A'}\n${hospital.phone ? `Điện thoại: ${hospital.phone}` : ''}\n\nBạn có thể tìm đường bằng Google Maps hoặc liên hệ hotline để được hướng dẫn.`;
    }
    return `${hospital.name} tọa lạc tại ${hospital.city || 'Việt Nam'}. Vui lòng liên hệ ${hospital.phone || 'bệnh viện'} để được hướng dẫn đường đi chi tiết.`;
  }

  generateDirectionsAnswer(hospital) {
    const city = hospital.city || 'thành phố';
    return `Để đến ${hospital.name}:\n\n1. Sử dụng Google Maps tìm kiếm "${hospital.name}"\n2. Đi xe bus/taxi đến ${city}\n3. Liên hệ hotline ${hospital.phone || 'bệnh viện'} để được hướng dẫn\n\n${hospital.address ? `Địa chỉ: ${hospital.address}` : ''}`;
  }

  generatePhoneAnswer(hospital) {
    if (hospital.phone) {
      return `Số điện thoại liên hệ ${hospital.name}: ${hospital.phone}\n\nThời gian làm việc: 8:00 - 20:00 (Thứ 2 - Chủ nhật)\nBạn có thể gọi để đặt lịch tư vấn hoặc hỏi thông tin chi tiết.`;
    }
    return `Để liên hệ ${hospital.name}, bạn có thể truy cập website ${hospital.website || 'của bệnh viện'} hoặc đến trực tiếp tại ${hospital.address || hospital.city || 'địa chỉ bệnh viện'}.`;
  }

  generateContactAnswer(hospital) {
    const contacts = [];
    if (hospital.phone) contacts.push(`📞 Điện thoại: ${hospital.phone}`);
    if (hospital.email) contacts.push(`📧 Email: ${hospital.email}`);
    if (hospital.website) contacts.push(`🌐 Website: ${hospital.website}`);
    if (hospital.address) contacts.push(`📍 Địa chỉ: ${hospital.address}`);

    if (contacts.length > 0) {
      return `Thông tin liên hệ ${hospital.name}:\n\n${contacts.join('\n')}\n\nThời gian làm việc: 8:00 - 20:00 hàng ngày.`;
    }
    return `Bạn có thể liên hệ ${hospital.name} tại ${hospital.city || 'địa chỉ bệnh viện'}. Vui lòng truy cập website hoặc đến trực tiếp để được tư vấn.`;
  }

  generateAppointmentAnswer(hospital) {
    return `Để đặt lịch tại ${hospital.name}:\n\n1. Gọi hotline: ${hospital.phone || 'xem website'}\n2. Đăng ký qua website: ${hospital.website || 'đang cập nhật'}\n3. Đến trực tiếp tại: ${hospital.address || hospital.city || 'địa chỉ bệnh viện'}\n\nĐội ngũ tư vấn sẽ hỗ trợ bạn lựa chọn thời gian phù hợp và chuẩn bị các thủ tục cần thiết.`;
  }

  generateDoctorsAnswer(hospital) {
    return `Đội ngũ bác sĩ tại ${hospital.name} gồm các chuyên gia giàu kinh nghiệm:\n\n- Bác sĩ chuyên khoa phẫu thuật thẩm mỹ\n- Chứng chỉ hành nghề quốc tế\n- Nhiều năm kinh nghiệm\n- Thường xuyên cập nhật kỹ thuật mới\n\nTất cả bác sĩ đều được đào tạo bài bản và có chứng chỉ hành nghề hợp lệ.`;
  }

  generateExpertiseAnswer(hospital) {
    const rating = hospital.rating || 4.0;
    return `${hospital.name} tự hào có đội ngũ bác sĩ chuyên môn cao với:\n\n- Bằng cấp chuyên khoa sâu\n- Kinh nghiệm thực tế phong phú\n- Kỹ thuật phẫu thuật tiên tiến\n- Đánh giá ${rating}/5.0 từ khách hàng\n\nBệnh viện luôn đặt chất lượng và an toàn lên hàng đầu.`;
  }

  /**
   * 批量生成DQA内容
   * @param {number} count 生成数量
   * @returns {Promise<Array>} DQA列表
   */
  async generateBatchDQA(count = 10) {
    try {
      logger.info(`开始批量生成 ${count} 条DQA...`);
      
      const hospitals = await hospitalDataExtractor.getAllHospitals();
      if (hospitals.length === 0) {
        throw new Error('没有可用的医院数据');
      }

      const dqas = [];
      const questionTypes = Object.keys(this.questionTemplates);

      for (let i = 0; i < count; i++) {
        // 随机选择医院
        const hospital = hospitals[Math.floor(Math.random() * hospitals.length)];
        // 随机选择问题类型
        const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
        
        const dqa = await this.generateSingleDQA(hospital, questionType);
        dqas.push(dqa);
      }

      logger.info(`成功生成 ${dqas.length} 条DQA`);
      return dqas;
    } catch (error) {
      logger.error('批量生成DQA失败:', error);
      throw error;
    }
  }
}

export default new DQAGenerator();

