import { DataTypes } from 'sequelize';

const Knowledge = (sequelize) => {
  const Knowledge = sequelize.define('Knowledge', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    question: {
      type: DataTypes.STRING(500),
      allowNull: false,
      comment: '问题'
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '答案'
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: 'Tư vấn chung',
      comment: '分类'
    },
    subcategory: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '子分类'
    },
    doctor_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '医生姓名'
    },
    doctor_title: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '医生职称'
    },
    doctor_avatar: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '医生头像URL'
    },
    hospital_name: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '医院名称'
    },
    like_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '点赞次数'
    },
    view_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '浏览次数'
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '标签数组'
    },
    difficulty_level: {
      type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
      defaultValue: 'beginner',
      comment: '难度级别'
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      defaultValue: 'published',
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
    tableName: 'knowledge',
    comment: '知识问答表',
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
        fields: ['difficulty_level']
      },
      {
        fields: ['source']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  return Knowledge;
};

export default Knowledge;
