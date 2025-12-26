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
   * 拟人化开场白变化（15种）
   */
  personalizedOpenings = [
    'Xin chào! Mình rất vui được tư vấn cho bạn về',
    'Chào bạn! Để mình chia sẻ thông tin về',
    'Hi bạn! Mình có thể giúp bạn tìm hiểu về',
    'Chào bạn nhé! Về vấn đề này, mình muốn chia sẻ rằng',
    'Xin chào! Theo kinh nghiệm của mình thì',
    'Chào bạn! Mình hiểu bạn đang quan tâm đến',
    'Hi! Đây là thông tin mà bạn cần biết về',
    'Chào bạn! Mình sẽ giải đáp thắc mắc của bạn về',
    'Xin chào! Để trả lời câu hỏi này, mình muốn nói rằng',
    'Chào bạn nhé! Về chủ đề này, mình có thể chia sẻ là',
    'Hi bạn! Mình rất sẵn lòng tư vấn cho bạn về',
    'Chào bạn! Dựa trên thông tin mình có thì',
    'Xin chào! Mình hy vọng có thể giúp bạn hiểu rõ về',
    'Chào bạn! Để bạn yên tâm hơn, mình xin chia sẻ về',
    'Hi! Mình sẽ cung cấp thông tin chi tiết về'
  ];

  /**
   * 拟人化结尾语（10种）
   */
  personalizedClosings = [
    'Hy vọng thông tin này hữu ích cho bạn nhé!',
    'Chúc bạn có những lựa chọn tốt nhất!',
    'Nếu còn thắc mắc gì, đừng ngần ngại liên hệ nhé!',
    'Mình hy vọng đã giải đáp được thắc mắc của bạn!',
    'Chúc bạn sức khỏe và làm đẹp thành công!',
    'Hy vọng bạn sẽ tìm được dịch vụ phù hợp!',
    'Mình luôn sẵn sàng hỗ trợ bạn thêm nếu cần!',
    'Chúc bạn có trải nghiệm tuyệt vời!',
    'Hy vọng thông tin này giúp bạn đưa ra quyết định đúng đắn!',
    'Chúc bạn may mắn và thành công!'
  ];

  /**
   * 拟人化过渡词和口头语
   */
  casualExpressions = [
    'À mà', 'Nói thêm là', 'Bạn biết không', 'Thực ra thì', 'Mình nghĩ rằng',
    'Theo mình biết', 'Nói chung là', 'Đặc biệt là', 'Quan trọng nhất là',
    'Bạn nên lưu ý', 'Mình khuyên bạn', 'Thường thì', 'Nhân tiện', 'Ngoài ra'
  ];

  /**
   * 获取随机开场白
   */
  getRandomOpening() {
    return this.personalizedOpenings[Math.floor(Math.random() * this.personalizedOpenings.length)];
  }

  /**
   * 获取随机结尾语
   */
  getRandomClosing() {
    return this.personalizedClosings[Math.floor(Math.random() * this.personalizedClosings.length)];
  }

  /**
   * 获取随机过渡词
   */
  getRandomExpression() {
    return this.casualExpressions[Math.floor(Math.random() * this.casualExpressions.length)];
  }

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
        // 生成答案时传递service参数
        const answer = await templateObj.generator(hospital, service);
        
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
    const opening = this.getRandomOpening();
    const closing = this.getRandomClosing();
    const expression = this.getRandomExpression();
    
    const certs = hospital.certifications || [];
    if (certs.length > 0) {
      const certList = certs.map(c => `- ${c}`).join('\n');
      return `${opening} ${hospital.name}.\n\n${hospital.name} đã được cấp các chứng nhận sau:\n\n${certList}\n\n${expression}, tất cả chứng nhận này đều được Bộ Y tế Việt Nam công nhận và đảm bảo tiêu chuẩn chất lượng cao nhé! ${closing}`;
    }
    return `${opening} ${hospital.name}.\n\n${hospital.name} là bệnh viện được cấp phép hoạt động hợp pháp bởi Bộ Y tế Việt Nam đấy. ${expression}, bệnh viện tuân thủ đầy đủ các quy định về an toàn y tế và chất lượng dịch vụ. ${closing}`;
  }

  generateStandardAnswer(hospital) {
    const opening = this.getRandomOpening();
    const closing = this.getRandomClosing();
    const expression = this.getRandomExpression();
    const level = hospital.level || 'B';
    
    return `${opening} tiêu chuẩn của ${hospital.name}.\n\n${hospital.name} đáp ứng đầy đủ tiêu chuẩn hoạt động của bệnh viện hạng ${level} đấy. ${expression}, cơ sở y tế được kiểm tra định kỳ và duy trì các tiêu chuẩn về: cơ sở vật chất, trang thiết bị y tế, đội ngũ nhân viên chuyên môn, và quy trình điều trị an toàn. ${closing}`;
  }

  generateLicenseAnswer(hospital) {
    const opening = this.getRandomOpening();
    const closing = this.getRandomClosing();
    const expression = this.getRandomExpression();
    
    return `${opening} giấy phép của ${hospital.name}.

${hospital.name} có giấy phép hoạt động hợp pháp được cấp bởi Sở Y tế và Bộ Y tế Việt Nam đấy. ${expression}, giấy phép được gia hạn định kỳ và tuân thủ các quy định hiện hành về hoạt động phẫu thuật thẩm mỹ. ${closing}`;
  }

  generateLevelAnswer(hospital) {
    const opening = this.getRandomOpening();
    const closing = this.getRandomClosing();
    const expression = this.getRandomExpression();
    const level = hospital.level || 'B';
    const rating = hospital.rating || 4.0;
    const levelDesc = {
      'A': 'hạng A (cao nhất)',
      'B': 'hạng B (tiêu chuẩn cao)',
      'C': 'hạng C (tiêu chuẩn tốt)',
      'D': 'hạng D (tiêu chuẩn cơ bản)'
    };
    
    return `${opening} cấp độ của ${hospital.name}.

${hospital.name} là bệnh viện ${levelDesc[level] || 'hạng B'} đấy! ${expression}, với đánh giá ${rating}/5.0 từ người dùng, bệnh viện cung cấp dịch vụ chất lượng và đáng tin cậy lắm. ${closing}`;
  }

  generateRatingAnswer(hospital) {
    const opening = this.getRandomOpening();
    const closing = this.getRandomClosing();
    const expression = this.getRandomExpression();
    const rating = hospital.rating || 4.0;
    const reviewCount = hospital.review_count || 0;
    let desc = '';
    if (rating >= 4.5) desc = 'xuất sắc';
    else if (rating >= 4.0) desc = 'rất tốt';
    else if (rating >= 3.5) desc = 'tốt';
    else desc = 'ổn định';
    
    return `${opening} đánh giá của ${hospital.name}.

${hospital.name} được đánh giá ${desc} với ${rating}/5.0 sao từ ${reviewCount} lượt đánh giá đấy! ${expression}, bệnh viện cam kết cung cấp dịch vụ chất lượng và chăm sóc khách hàng tận tâm. ${closing}`;
  }

  generateServicesAnswer(hospital) {
    const opening = this.getRandomOpening();
    const closing = this.getRandomClosing();
    const expression = this.getRandomExpression();
    const services = hospital.services || [];
    const specialties = hospital.specialties || [];
    
    if (services.length > 0) {
      const serviceList = services.slice(0, 8).map(s => `- ${s}`).join('\n');
      return `${opening} các dịch vụ tại ${hospital.name}.\n\n${hospital.name} cung cấp các dịch vụ phẫu thuật thẩm mỹ sau đây:\n\n${serviceList}\n\n${expression}, còn nhiều dịch vụ khác nữa nhé! Vui lòng liên hệ để được tư vấn chi tiết. ${closing}`;
    }
    
    return `${opening} dịch vụ của ${hospital.name}.\n\n${hospital.name} cung cấp đa dạng dịch vụ phẫu thuật thẩm mỹ bao gồm: phẫu thuật khuôn mặt, nâng ngực, hút mỡ, làm đẹp da, và nhiều dịch vụ khác đấy. ${expression}, vui lòng liên hệ ${hospital.phone || 'bệnh viện'} để được tư vấn chi tiết nhé! ${closing}`;
  }

  generateSpecialtiesAnswer(hospital) {
    const opening = this.getRandomOpening();
    const closing = this.getRandomClosing();
    const expression = this.getRandomExpression();
    const specialties = hospital.specialties || [];
    
    if (specialties.length > 0) {
      const specList = specialties.map(s => `- ${s}`).join('\n');
      return `${opening} các chuyên khoa tại ${hospital.name}.\n\nCác chuyên khoa tại ${hospital.name}:\n\n${specList}\n\n${expression}, đội ngũ bác sĩ giàu kinh nghiệm và trang thiết bị hiện đại lắm! ${closing}`;
    }
    return `${opening} chuyên môn của ${hospital.name}.\n\n${hospital.name} chuyên về các lĩnh vực phẫu thuật thẩm mỹ toàn diện đấy. ${expression}, với đội ngũ bác sĩ chuyên môn cao và trang thiết bị y tế hiện đại. ${closing}`;
  }

  generateSpecificServiceAnswer(hospital, service) {
    const opening = this.getRandomOpening();
    const closing = this.getRandomClosing();
    const expression = this.getRandomExpression();
    const services = hospital.services || [];
    const hasService = services.some(s => s.toLowerCase().includes(service.toLowerCase()));
    
    if (hasService) {
      return `${opening} dịch vụ ${service} tại ${hospital.name}.\n\nCó nhé! ${hospital.name} có cung cấp dịch vụ ${service} đấy. ${expression}, đây là một trong những dịch vụ chuyên môn của bệnh viện với đội ngũ bác sĩ giàu kinh nghiệm. Vui lòng liên hệ ${hospital.phone || 'bệnh viện'} để đặt lịch tư vấn nhé! ${closing}`;
    }
    return `${opening} dịch vụ ${service} tại ${hospital.name}.\n\n${hospital.name} cung cấp nhiều dịch vụ phẫu thuật thẩm mỹ đấy. ${expression}, về dịch vụ ${service} cụ thể, vui lòng liên hệ trực tiếp ${hospital.phone || 'bệnh viện'} để được tư vấn chi tiết nhất nhé! ${closing}`;
  }

  generateLocationAnswer(hospital) {
    const opening = this.getRandomOpening();
    const closing = this.getRandomClosing();
    const expression = this.getRandomExpression();
    const city = hospital.city || 'Việt Nam';
    const district = hospital.district || '';
    
    return `${opening} vị trí của ${hospital.name}.\n\n${hospital.name} tọa lạc tại ${district ? district + ', ' : ''}${city} đấy. ${expression}, ${hospital.address ? `địa chỉ cụ thể là: ${hospital.address}` : 'vui lòng liên hệ để biết địa chỉ chi tiết nhé'}. ${closing}`;
  }

  generateAddressAnswer(hospital) {
    const opening = this.getRandomOpening();
    const closing = this.getRandomClosing();
    const expression = this.getRandomExpression();
    
    if (hospital.address) {
      return `${opening} địa chỉ cụ thể của ${hospital.name}.\n\nĐịa chỉ: ${hospital.address}\nThành phố: ${hospital.city || 'N/A'}\n${hospital.phone ? `Điện thoại: ${hospital.phone}` : ''}\n\n${expression}, bạn có thể tìm đường bằng Google Maps hoặc liên hệ hotline để được hướng dẫn nhé! ${closing}`;
    }
    return `${opening} địa chỉ của ${hospital.name}.\n\n${hospital.name} tọa lạc tại ${hospital.city || 'Việt Nam'} đấy. ${expression}, vui lòng liên hệ ${hospital.phone || 'bệnh viện'} để được hướng dẫn đường đi chi tiết nhé! ${closing}`;
  }

  generateDirectionsAnswer(hospital) {
    const opening = this.getRandomOpening();
    const closing = this.getRandomClosing();
    const expression = this.getRandomExpression();
    const city = hospital.city || 'thành phố';
    
    return `${opening} cách đến ${hospital.name}.\n\nĐể đến ${hospital.name}, bạn có thể làm như sau:\n\n1. Sử dụng Google Maps tìm kiếm "${hospital.name}"\n2. Đi xe bus/taxi đến ${city}\n3. Liên hệ hotline ${hospital.phone || 'bệnh viện'} để được hướng dẫn\n\n${hospital.address ? `Địa chỉ: ${hospital.address}` : ''}\n\n${expression}, đừng ngần ngại hỏi đường nếu cần nhé! ${closing}`;
  }

  generatePhoneAnswer(hospital) {
    const opening = this.getRandomOpening();
    const closing = this.getRandomClosing();
    const expression = this.getRandomExpression();
    
    if (hospital.phone) {
      return `${opening} số điện thoại của ${hospital.name}.\n\nSố điện thoại liên hệ ${hospital.name}: ${hospital.phone}\n\nThời gian làm việc: 8:00 - 20:00 (Thứ 2 - Chủ nhật)\n\n${expression}, bạn có thể gọi để đặt lịch tư vấn hoặc hỏi thông tin chi tiết nhé! ${closing}`;
    }
    return `${opening} cách liên hệ ${hospital.name}.\n\nĐể liên hệ ${hospital.name}, bạn có thể truy cập website ${hospital.website || 'của bệnh viện'} hoặc đến trực tiếp tại ${hospital.address || hospital.city || 'địa chỉ bệnh viện'} đấy. ${expression}, nhân viên sẽ hỗ trợ bạn nhiệt tình! ${closing}`;
  }

  generateContactAnswer(hospital) {
    const opening = this.getRandomOpening();
    const closing = this.getRandomClosing();
    const expression = this.getRandomExpression();
    const contacts = [];
    if (hospital.phone) contacts.push(`📞 Điện thoại: ${hospital.phone}`);
    if (hospital.email) contacts.push(`📧 Email: ${hospital.email}`);
    if (hospital.website) contacts.push(`🌐 Website: ${hospital.website}`);
    if (hospital.address) contacts.push(`📍 Địa chỉ: ${hospital.address}`);

    if (contacts.length > 0) {
      return `${opening} thông tin liên hệ của ${hospital.name}.\n\nThông tin liên hệ ${hospital.name}:\n\n${contacts.join('\n')}\n\nThời gian làm việc: 8:00 - 20:00 hàng ngày.\n\n${expression}, đội ngũ tư vấn luôn sẵn sàng hỗ trợ bạn! ${closing}`;
    }
    return `${opening} cách liên hệ ${hospital.name}.\n\nBạn có thể liên hệ ${hospital.name} tại ${hospital.city || 'địa chỉ bệnh viện'} đấy. ${expression}, vui lòng truy cập website hoặc đến trực tiếp để được tư vấn nhé! ${closing}`;
  }

  generateAppointmentAnswer(hospital) {
    const opening = this.getRandomOpening();
    const closing = this.getRandomClosing();
    const expression = this.getRandomExpression();
    
    return `${opening} cách đặt lịch tại ${hospital.name}.\n\nĐể đặt lịch tại ${hospital.name}, bạn có thể làm theo các cách sau:\n\n1. Gọi hotline: ${hospital.phone || 'xem website'}\n2. Đăng ký qua website: ${hospital.website || 'đang cập nhật'}\n3. Đến trực tiếp tại: ${hospital.address || hospital.city || 'địa chỉ bệnh viện'}\n\n${expression}, đội ngũ tư vấn sẽ hỗ trợ bạn lựa chọn thời gian phù hợp và chuẩn bị các thủ tục cần thiết. ${closing}`;
  }

  generateDoctorsAnswer(hospital) {
    const opening = this.getRandomOpening();
    const closing = this.getRandomClosing();
    const expression = this.getRandomExpression();
    
    return `${opening} đội ngũ bác sĩ tại ${hospital.name}.\n\nĐội ngũ bác sĩ tại ${hospital.name} gồm các chuyên gia giàu kinh nghiệm:\n\n- Bác sĩ chuyên khoa phẫu thuật thẩm mỹ\n- Chứng chỉ hành nghề quốc tế\n- Nhiều năm kinh nghiệm\n- Thường xuyên cập nhật kỹ thuật mới\n\n${expression}, tất cả bác sĩ đều được đào tạo bài bản và có chứng chỉ hành nghề hợp lệ đấy! ${closing}`;
  }

  generateExpertiseAnswer(hospital) {
    const opening = this.getRandomOpening();
    const closing = this.getRandomClosing();
    const expression = this.getRandomExpression();
    const rating = hospital.rating || 4.0;
    
    return `${opening} chuyên môn của đội ngũ bác sĩ tại ${hospital.name}.\n\n${hospital.name} tự hào có đội ngũ bác sĩ chuyên môn cao với:\n\n- Bằng cấp chuyên khoa sâu\n- Kinh nghiệm thực tế phong phú\n- Kỹ thuật phẫu thuật tiên tiến\n- Đánh giá ${rating}/5.0 từ khách hàng\n\n${expression}, bệnh viện luôn đặt chất lượng và an toàn lên hàng đầu! ${closing}`;
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

