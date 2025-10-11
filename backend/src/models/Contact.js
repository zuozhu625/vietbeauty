import { DataTypes } from 'sequelize';

const Contact = (sequelize) => {
  const Contact = sequelize.define('Contact', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '联系人姓名'
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '邮箱'
    },
    phone: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: '电话'
    },
    subject: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '主题'
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '消息内容'
    },
    inquiry_type: {
      type: DataTypes.ENUM('consultation', 'appointment', 'general', 'complaint', 'suggestion'),
      defaultValue: 'general',
      comment: '咨询类型'
    },
    preferred_contact: {
      type: DataTypes.ENUM('email', 'phone', 'wechat', 'whatsapp'),
      defaultValue: 'email',
      comment: '首选联系方式'
    },
    hospital_interest: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '感兴趣的医院'
    },
    service_interest: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '感兴趣的服务'
    },
    budget_range: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '预算范围'
    },
    timeline: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '时间安排'
    },
    status: {
      type: DataTypes.ENUM('new', 'in_progress', 'resolved', 'closed'),
      defaultValue: 'new',
      comment: '处理状态'
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium',
      comment: '优先级'
    },
    assigned_to: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '分配给'
    },
    response: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '回复内容'
    },
    response_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '回复时间'
    },
    source: {
      type: DataTypes.ENUM('website', 'n8n', 'api', 'manual'),
      defaultValue: 'website',
      comment: '数据来源'
    },
    external_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '外部系统ID'
    }
  }, {
    tableName: 'contacts',
    comment: '联系我们表',
    indexes: [
      {
        fields: ['status']
      },
      {
        fields: ['priority']
      },
      {
        fields: ['inquiry_type']
      },
      {
        fields: ['assigned_to']
      },
      {
        fields: ['source']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  return Contact;
};

export default Contact;
