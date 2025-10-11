import { models } from '../models/index.js';
import { logger } from '../utils/logger.js';

const { Hospital } = models;

// 10家胡志明市医院数据
const hospitalsData = [
  {
    name: 'Bệnh viện Da liễu TP.HCM',
    description: 'Bệnh viện chuyên khoa da liễu tuyến thành phố, có Khoa Thẩm mỹ Da cung cấp dịch vụ tiêm botox, filler, chăm sóc – trẻ hóa da theo quy chuẩn y tế. Đơn vị y tế công lập uy tín với đội ngũ bác sĩ chuyên môn cao và thiết bị hiện đại.',
    address: 'Số 2 Nguyễn Thông, Phường 6, Quận 3, TP.HCM',
    city: 'TP.HCM',
    district: 'Quận 3',
    phone: '+84 28 3930 2222',
    email: 'bvdl@hcm.gov.vn',
    website: 'https://bvdl.org.vn/',
    rating: 4.7,
    review_count: 856,
    specialties: ['Thẩm mỹ khuôn mặt', 'Chăm sóc da', 'Tiêm Botox & Filler', 'Trẻ hóa da'],
    services: [
      'Tiêm Botox - Xóa nhăn, nâng cơ mặt',
      'Tiêm Filler - Làm đầy rãnh nhăn, tạo khối',
      'Laser trị nám, tàn nhang',
      'Peel da hóa học',
      'Mesotherapy - Trẻ hóa da',
      'Thread lift - Căng da chỉ'
    ],
    facilities: [
      'Phòng tiêm chích vô trùng đạt chuẩn',
      'Máy laser Nd:YAG, CO2 fractional',
      'Thiết bị điều trị da hiện đại',
      'Khu vực chăm sóc hậu phẫu riêng biệt'
    ],
    certifications: [
      'Chứng nhận bệnh viện hạng A',
      'ISO 9001:2015',
      'Giấy phép hoạt động của Sở Y tế TP.HCM'
    ],
    level: 'A',
    type: 'public',
    status: 'active',
    source: 'manual'
  },
  {
    name: 'Khoa Tạo hình Thẩm mỹ – Bệnh viện Đại học Y Dược TP.HCM',
    description: 'Đơn vị tạo hình – thẩm mỹ thuộc bệnh viện đại học, đội ngũ bác sĩ giảng dạy/ngoại khoa chuyên sâu. Cung cấp vi thủ thuật thẩm mỹ khuôn mặt (botox, filler…) và phẫu thuật thẩm mỹ với chuẩn mực y khoa cao, kết hợp đào tạo và nghiên cứu.',
    address: '215 Hồng Bàng, Phường 11, Quận 5, TP.HCM',
    city: 'TP.HCM',
    district: 'Quận 5',
    phone: '+84 28 3855 4269',
    email: 'taohinhthammyyd@ump.edu.vn',
    website: 'https://taohinhthammyyd.com/',
    rating: 4.8,
    review_count: 1024,
    specialties: ['Thẩm mỹ khuôn mặt', 'Phẫu thuật tạo hình', 'Tiêm Botox & Filler', 'Vi thủ thuật'],
    services: [
      'Phẫu thuật nâng mũi S-line, L-line',
      'Phẫu thuật mắt hai mí Hàn Quốc',
      'Phẫu thuật tạo hình khuôn mặt V-line',
      'Tiêm Botox - Filler cao cấp',
      'Cắt mí mắt không phẫu thuật',
      'Phẫu thuật ngực - Nâng ngực',
      'Vi phẫu tạo hình sẹo'
    ],
    facilities: [
      'Phòng mổ chuẩn quốc tế',
      'Thiết bị phẫu thuật nội soi hiện đại',
      'Hệ thống gây mê an toàn',
      'Phòng hồi sức riêng biệt',
      'Khu vực phục hồi chức năng'
    ],
    certifications: [
      'Bệnh viện Đại học Y Dược TP.HCM',
      'Đội ngũ giảng viên - Tiến sĩ',
      'Chứng nhận đào tạo chuyên khoa II',
      'Giấy phép phẫu thuật thẩm mỹ'
    ],
    level: 'A',
    type: 'public',
    status: 'active',
    source: 'manual'
  },
  {
    name: 'Bệnh viện Đa khoa Tâm Anh TP.HCM',
    description: 'Khoa Da liễu – Thẩm mỹ Da cung cấp điều trị da và thẩm mỹ nội khoa (laser, botox, filler), quy trình chuẩn bệnh viện tư nhân lớn. Hệ thống bệnh viện hiện đại với công nghệ tiên tiến và dịch vụ 5 sao, đội ngũ bác sĩ giàu kinh nghiệm.',
    address: '2B Phổ Quang, Phường 2, Quận Tân Bình, TP.HCM',
    city: 'TP.HCM',
    district: 'Quận Tân Bình',
    phone: '+84 28 7102 6789',
    email: 'cskh@bvtamanh.com',
    website: 'https://tamanhhospital.vn/chuyen-khoa/da-lieu/',
    rating: 4.9,
    review_count: 1567,
    specialties: ['Thẩm mỹ khuôn mặt', 'Laser điều trị da', 'Tiêm Botox & Filler', 'Chăm sóc da cao cấp'],
    services: [
      'Laser PicoSure - Trị nám, tàn nhang',
      'Laser CO2 Fractional - Trẻ hóa da',
      'Ultherapy - Căng da không phẫu thuật',
      'Thermage FLX - Làm săn chắc da',
      'Hydrafacial - Làm sạch sâu và dưỡng da',
      'Tiêm Botox, Filler Allergan, Juvederm',
      'PRP - Trẻ hóa da bằng huyết tương'
    ],
    facilities: [
      'Hệ thống laser cao cấp từ Mỹ, Hàn Quốc',
      'Phòng điều trị riêng tư VIP',
      'Khu vực chăm sóc khách hàng 5 sao',
      'Hệ thống an ninh và bảo mật thông tin',
      'Bãi đậu xe rộng rãi'
    ],
    certifications: [
      'Chứng nhận bệnh viện hạng A+',
      'Chứng nhận JCI đang trong quá trình',
      'ISO 9001:2015',
      'Giải thưởng Bệnh viện tốt nhất Việt Nam'
    ],
    level: 'A',
    type: 'private',
    status: 'active',
    source: 'manual'
  },
  {
    name: 'FV Hospital – Dermatology & Lifestyle',
    description: 'Bệnh viện quốc tế tại Quận 7; Lifestyle/Laser & Skin Clinic thực hiện trẻ hóa da, botox, filler, thread-lift và các thủ thuật da liễu – thẩm mỹ. Tiêu chuẩn quốc tế JCI, đội ngũ bác sĩ nước ngoài và Việt Nam giàu kinh nghiệm, thiết bị hiện đại nhất.',
    address: '6 Nguyễn Lương Bằng, Phường Tân Phú, Quận 7, TP.HCM',
    city: 'TP.HCM',
    district: 'Quận 7',
    phone: '+84 28 5411 3333',
    email: 'info@fvhospital.com',
    website: 'https://www.fvhospital.com/',
    rating: 4.9,
    review_count: 2134,
    specialties: ['Thẩm mỹ khuôn mặt', 'Trẻ hóa da', 'Thread-lift', 'Laser & Skin'],
    services: [
      'Thread Lift - Nâng cơ mặt bằng chỉ',
      'Profhilo - Cải thiện độ ẩm và đàn hồi da',
      'Sculptra - Kích thích collagen tự nhiên',
      'Laser Genesis - Trẻ hóa da toàn diện',
      'Chemical Peel - Peel da y khoa',
      'Microneedling RF - Vi kim điện phân',
      'Body Contouring - Điêu khắc cơ thể'
    ],
    facilities: [
      'Cơ sở vật chất chuẩn quốc tế',
      'Phòng điều trị riêng tư cao cấp',
      'Thiết bị từ Mỹ, Thụy Sĩ, Hàn Quốc',
      'Đội ngũ y tá được đào tạo quốc tế',
      'Dịch vụ khách hàng đa ngôn ngữ'
    ],
    certifications: [
      'Chứng nhận JCI (Joint Commission International)',
      'ISO 15189 - Phòng xét nghiệm',
      'Bác sĩ có chứng chỉ quốc tế',
      'Top 3 bệnh viện quốc tế tại Việt Nam'
    ],
    level: 'A',
    type: 'international',
    status: 'active',
    source: 'manual'
  },
  {
    name: 'VITA Clinic',
    description: 'Hệ thống thẩm mỹ – chăm sóc sức khỏe có nhiều chi nhánh tại HCMC (Saigon Centre, Pearl Plaza, Thảo Điền…); cung cấp trẻ hóa da, botox, filler và liệu trình chăm sóc da. Thương hiệu thẩm mỹ cao cấp với không gian sang trọng và dịch vụ tận tâm.',
    address: 'Tầng 6, Saigon Centre, 65 Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM',
    city: 'TP.HCM',
    district: 'Quận 1',
    phone: '+84 28 3822 2299',
    email: 'info@vitaclinic.vn',
    website: 'https://vitaclinic.vn/',
    rating: 4.8,
    review_count: 1876,
    specialties: ['Thẩm mỹ khuôn mặt', 'Trẻ hóa da', 'Tiêm Botox & Filler', 'Chăm sóc da'],
    services: [
      'Liệu trình chăm sóc da chuyên sâu',
      'Tiêm Botox, Filler Restylane, Teosyal',
      'Mesotherapy - Tiêm meso trẻ hóa',
      'LED Light Therapy - Trị liệu ánh sáng',
      'Oxygen Facial - Dưỡng oxy cho da',
      'Vitamin Drip - Truyền Vitamin tĩnh mạch',
      'Body Slimming - Giảm mỡ không xâm lấn'
    ],
    facilities: [
      'Không gian clinic sang trọng, hiện đại',
      'Chi nhánh tại các trung tâm quận 1, 2, 3',
      'Phòng điều trị riêng tư, yên tĩnh',
      'Sản phẩm chăm sóc da cao cấp',
      'Dịch vụ tư vấn cá nhân hóa'
    ],
    certifications: [
      'Giấy phép hoạt động Sở Y tế TP.HCM',
      'Chứng nhận cơ sở đạt chuẩn',
      'Đối tác chính thức của Allergan, Galderma',
      'Thương hiệu uy tín 10+ năm'
    ],
    level: 'A',
    type: 'private',
    status: 'active',
    source: 'manual'
  },
  {
    name: 'Muse Clinic – Viện thẩm mỹ Hàn Quốc',
    description: 'Phòng khám chuẩn Hàn tại TP.HCM, chú trọng thẩm mỹ nội khoa tự nhiên (Thermage FLX, botox, filler) và chăm sóc – trẻ hóa da công nghệ cao. Áp dụng kỹ thuật và tiêu chuẩn Hàn Quốc, mang đến hiệu quả tự nhiên và an toàn cho khách hàng.',
    address: '145 Điện Biên Phủ, Phường Đakao, Quận 1, TP.HCM',
    city: 'TP.HCM',
    district: 'Quận 1',
    phone: '+84 28 6271 8668',
    email: 'info@museclinic.vn',
    website: 'https://museclinic.vn/',
    rating: 4.8,
    review_count: 1234,
    specialties: ['Thẩm mỹ khuôn mặt', 'Trẻ hóa da', 'Thermage FLX', 'Tiêm Botox & Filler'],
    services: [
      'Thermage FLX - Căng da không phẫu thuật',
      'Ultherapy - Nâng cơ HIFU',
      'Tiêm Botox, Filler chuẩn Hàn Quốc',
      'Laser PicoSure - Trị nám, tàn nhang',
      'Sculptra - Kích thích collagen',
      'Thread Lift - Căng da chỉ Hàn Quốc',
      'Liệu trình chăm sóc da chuyên sâu'
    ],
    facilities: [
      'Không gian thiết kế phong cách Hàn Quốc',
      'Thiết bị từ Hàn Quốc và Mỹ',
      'Phòng điều trị riêng tư cao cấp',
      'Khu vực chờ VIP sang trọng',
      'Hệ thống âm nhạc thư giãn'
    ],
    certifications: [
      'Giấy phép hoạt động Sở Y tế TP.HCM',
      'Bác sĩ đào tạo tại Hàn Quốc',
      'Đối tác Thermage, Ulthera chính hãng',
      'Chứng nhận an toàn y tế'
    ],
    level: 'A',
    type: 'private',
    status: 'active',
    source: 'manual'
  },
  {
    name: 'Pensilia – Phòng khám Da liễu Thẩm mỹ',
    description: 'Phòng khám da liễu – thẩm mỹ tại Quận 3, cung cấp điều trị da công nghệ cao kết hợp thủ thuật thẩm mỹ nội khoa (laser, trẻ hóa, tiêm chất làm đầy…); có thông tin chi nhánh/đặt hẹn. Đội ngũ bác sĩ chuyên môn cao với kinh nghiệm điều trị da lâu năm.',
    address: '92-94 Nguyễn Đình Chiểu, Phường Võ Thị Sáu, Quận 3, TP.HCM',
    city: 'TP.HCM',
    district: 'Quận 3',
    phone: '+84 28 3930 2233',
    email: 'info@pensilia.com',
    website: 'https://pensilia.com/',
    rating: 4.7,
    review_count: 967,
    specialties: ['Thẩm mỹ khuôn mặt', 'Laser điều trị da', 'Trẻ hóa da', 'Tiêm Filler'],
    services: [
      'Laser CO2 Fractional - Trị sẹo, rỗ',
      'Laser Nd:YAG - Trị nám sâu',
      'IPL - Điều trị da tổng hợp',
      'Tiêm Filler Restylane, Juvederm',
      'Tiêm Botox xóa nhăn',
      'Mesotherapy - Nuôi dưỡng da',
      'Chemical Peel - Peel da y khoa'
    ],
    facilities: [
      'Hệ thống laser đa chức năng',
      'Phòng điều trị tiêu chuẩn y tế',
      'Máy phân tích da chuyên sâu',
      'Sản phẩm chăm sóc da y khoa',
      'Dịch vụ tư vấn miễn phí'
    ],
    certifications: [
      'Giấy phép phòng khám chuyên khoa',
      'Bác sĩ chuyên khoa Da liễu',
      'Chứng nhận sử dụng laser y khoa',
      'Đối tác Galderma, Allergan'
    ],
    level: 'A',
    type: 'private',
    status: 'active',
    source: 'manual'
  },
  {
    name: 'Doctor Laser – Phòng khám Da liễu Thẩm mỹ',
    description: 'Phòng khám da liễu chuẩn y khoa, mạnh về laser và thẩm mỹ không phẫu thuật (tiêm filler tạo hình, botox, căng chỉ…); công bố rõ danh mục dịch vụ. Chuyên sâu về các liệu trình laser điều trị da với thiết bị hiện đại nhất.',
    address: '39-41 Đường D2, Phường 25, Quận Bình Thạnh, TP.HCM',
    city: 'TP.HCM',
    district: 'Quận Bình Thạnh',
    phone: '+84 28 6287 8668',
    email: 'contact@doctorlaser.vn',
    website: 'https://doctorlaser.vn/',
    rating: 4.6,
    review_count: 789,
    specialties: ['Laser điều trị da', 'Thẩm mỹ khuôn mặt', 'Tiêm Filler', 'Thread-lift'],
    services: [
      'Laser PicoWay - Xóa xăm, trị nám',
      'Laser Nd:YAG Q-Switch',
      'CO2 Fractional Laser',
      'Tiêm Filler tạo hình khuôn mặt',
      'Tiêm Botox nâng cơ mặt',
      'Thread Lift - Căng da chỉ collagen',
      'PDO Threads - Nâng cơ tự nhiên'
    ],
    facilities: [
      'Hệ thống laser đa năng cao cấp',
      'Phòng laser riêng biệt',
      'Thiết bị làm lạnh giảm đau',
      'Khu vực hồi phục sau điều trị',
      'Đặt hẹn online tiện lợi'
    ],
    certifications: [
      'Giấy phép phòng khám Da liễu',
      'Chứng nhận an toàn laser y tế',
      'Bác sĩ chuyên khoa cấp II',
      'Danh mục dịch vụ công khai minh bạch'
    ],
    level: 'A',
    type: 'private',
    status: 'active',
    source: 'manual'
  },
  {
    name: 'Aura Clinic – Thẩm mỹ viện Hàn Quốc',
    description: 'Hệ thống thẩm mỹ theo phong cách Hàn, có dịch vụ Aesthetic injection / Filler và chăm sóc – laser; nhiều cơ sở tại HCMC (Quận 1, 7, Gò Vấp…). Áp dụng công nghệ và kỹ thuật Hàn Quốc tiên tiến, đội ngũ chuyên gia giàu kinh nghiệm.',
    address: '34 Lê Duẩn, Phường Bến Nghé, Quận 1, TP.HCM',
    city: 'TP.HCM',
    district: 'Quận 1',
    phone: '+84 90 668 8668',
    email: 'info@auraclinic.vn',
    website: 'https://auraclinic.vn/',
    rating: 4.7,
    review_count: 1456,
    specialties: ['Thẩm mỹ khuôn mặt', 'Aesthetic Injection', 'Laser & Skin', 'Chăm sóc da'],
    services: [
      'Aesthetic Injection - Tiêm làm đẹp Hàn Quốc',
      'Filler Hyaluronic Acid cao cấp',
      'Botox Hàn Quốc - Nabota, Innotox',
      'Laser Toning - Trẻ hóa da',
      'IPL - Xóa nám, tàn nhang',
      'Microneedling RF - Vi kim tần số',
      'Liệu trình chăm sóc da K-Beauty'
    ],
    facilities: [
      'Chi nhánh tại Quận 1, 7, Gò Vấp',
      'Không gian theo phong cách Hàn Quốc',
      'Thiết bị từ Hàn Quốc chính hãng',
      'Phòng điều trị riêng tư',
      'Sản phẩm K-Beauty chính hãng'
    ],
    certifications: [
      'Giấy phép chuỗi phòng khám',
      'Đối tác nhập khẩu từ Hàn Quốc',
      'Bác sĩ đào tạo tại Seoul',
      'Chứng nhận hệ thống chất lượng'
    ],
    level: 'A',
    type: 'private',
    status: 'active',
    source: 'manual'
  },
  {
    name: 'TARA Clinic – Phòng khám Chuyên khoa Thẩm mỹ',
    description: 'Phòng khám tập trung thẩm mỹ khuôn mặt; nêu rõ tiêm Filler HA, botox và quy trình do bác sĩ trực tiếp tư vấn – thực hiện; nhiều nội dung hỏi đáp về filler. Chuyên sâu về tạo hình khuôn mặt tự nhiên, đội ngũ bác sĩ giàu kinh nghiệm.',
    address: '86 Pasteur, Phường Nguyễn Thái Bình, Quận 1, TP.HCM',
    city: 'TP.HCM',
    district: 'Quận 1',
    phone: '+84 28 3823 8668',
    email: 'contact@taraclinic.vn',
    website: 'https://taraclinic.vn/',
    rating: 4.8,
    review_count: 1687,
    specialties: ['Thẩm mỹ khuôn mặt', 'Tiêm Filler HA', 'Tiêm Botox', 'Tư vấn chuyên sâu'],
    services: [
      'Tiêm Filler HA - Juvederm, Restylane',
      'Tạo hình mũi không phẫu thuật',
      'Làm đầy má, thái dương',
      'Nâng cằm, góc hàm V-line',
      'Tiêm Botox nâng mũi, thu gọn hàm',
      'Tư vấn 1-1 với bác sĩ',
      'Theo dõi sau điều trị miễn phí'
    ],
    facilities: [
      'Phòng tư vấn riêng biệt',
      'Phòng tiêm chích vô trùng',
      'Filler chính hãng có tem chống giả',
      'Hệ thống lưu trữ ảnh trước-sau',
      'Khu vực nghỉ ngơi sau điều trị'
    ],
    certifications: [
      'Giấy phép phòng khám chuyên khoa',
      'Bác sĩ chuyên khoa Thẩm mỹ',
      'Filler HA chính hãng có xuất xứ',
      'Quy trình chuẩn y khoa an toàn'
    ],
    level: 'A',
    type: 'private',
    status: 'active',
    source: 'manual'
  }
];

async function insertHospitals() {
  try {
    logger.info('开始插入医院数据...');

    // 清空现有医院数据
    await Hospital.destroy({ where: {} });
    logger.info('已清空现有医院数据');

    // 插入新医院数据
    for (const hospitalData of hospitalsData) {
      const hospital = await Hospital.create(hospitalData);
      logger.info(`✅ 已插入医院: ${hospital.name} (ID: ${hospital.id})`);
    }

    logger.info(`🎉 成功插入 ${hospitalsData.length} 家医院数据`);
    
    // 显示插入的数据
    const allHospitals = await Hospital.findAll({
      order: [['id', 'ASC']]
    });
    
    console.log('\n📋 数据库中的医院列表：');
    allHospitals.forEach(h => {
      console.log(`  ${h.id}. ${h.name} - ${h.city} - 评分: ${h.rating}⭐`);
    });
    
    process.exit(0);
  } catch (error) {
    logger.error('插入医院数据失败:', error);
    process.exit(1);
  }
}

// 执行插入
insertHospitals();

