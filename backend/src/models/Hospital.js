import { DataTypes } from 'sequelize';

const Hospital = (sequelize) => {
  const Hospital = sequelize.define('Hospital', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '医院名称'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '医院描述'
    },
    address: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '医院地址'
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '所在城市'
    },
    district: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '所在区县'
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '联系电话'
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '邮箱'
    },
    website: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '官网'
    },
    logo_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'Logo URL'
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '医院图片URL数组'
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      validate: {
        min: 0,
        max: 5
      },
      comment: '综合评分'
    },
    review_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '评价数量'
    },
    specialties: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '专科领域数组'
    },
    services: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '服务项目数组'
    },
    facilities: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '设施设备数组'
    },
    certifications: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '认证资质数组'
    },
    level: {
      type: DataTypes.ENUM('A', 'B', 'C', 'D'),
      allowNull: true,
      comment: '医院等级'
    },
    type: {
      type: DataTypes.ENUM('public', 'private', 'international'),
      defaultValue: 'private',
      comment: '医院类型'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'pending'),
      defaultValue: 'active',
      comment: '状态'
    },
    source: {
      type: DataTypes.ENUM('n8n', 'manual', 'api'),
      defaultValue: 'manual',
      comment: '数据来源'
    },
    external_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '外部系统ID'
    }
  }, {
    tableName: 'hospitals',
    comment: '医院信息表',
    indexes: [
      {
        fields: ['city']
      },
      {
        fields: ['district']
      },
      {
        fields: ['type']
      },
      {
        fields: ['level']
      },
      {
        fields: ['status']
      },
      {
        fields: ['rating']
      },
      {
        fields: ['source']
      }
    ]
  });

  return Hospital;
};

export default Hospital;
