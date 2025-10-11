import { DataTypes } from 'sequelize';

const Service = (sequelize) => {
  const Service = sequelize.define('Service', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '服务名称'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '服务描述'
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '服务分类'
    },
    subcategory: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '服务子分类'
    },
    price_min: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: '最低价格'
    },
    price_max: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: '最高价格'
    },
    currency: {
      type: DataTypes.STRING(10),
      defaultValue: 'USD',
      comment: '货币单位'
    },
    duration: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '手术时长'
    },
    recovery_time: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '恢复时间'
    },
    difficulty_level: {
      type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
      defaultValue: 'intermediate',
      comment: '难度级别'
    },
    icon: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '图标URL'
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '服务图片URL数组'
    },
    features: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '服务特色数组'
    },
    requirements: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '服务要求数组'
    },
    risks: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '风险提示数组'
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      validate: {
        min: 0,
        max: 5
      },
      comment: '服务评分'
    },
    review_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '评价数量'
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '标签数组'
    },
    is_popular: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否热门'
    },
    is_recommended: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否推荐'
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
    tableName: 'services',
    comment: '服务内容表',
    indexes: [
      {
        fields: ['category']
      },
      {
        fields: ['subcategory']
      },
      {
        fields: ['status']
      },
      {
        fields: ['is_popular']
      },
      {
        fields: ['is_recommended']
      },
      {
        fields: ['difficulty_level']
      },
      {
        fields: ['source']
      }
    ]
  });

  return Service;
};

export default Service;
