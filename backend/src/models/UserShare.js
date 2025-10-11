import { DataTypes } from 'sequelize';

const UserShare = (sequelize) => {
  const UserShare = sequelize.define('UserShare', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: '分享标题'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '分享内容'
    },
    author_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '作者姓名'
    },
    author_avatar: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '作者头像URL'
    },
    surgery_type: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: '手术类型'
    },
    hospital_name: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '医院名称'
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5
      },
      comment: '评分(1-5星)'
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '图片URL数组'
    },
    tags: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: '标签数组'
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      defaultValue: 'published',
      comment: '状态'
    },
    view_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '浏览次数'
    },
    like_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '点赞次数'
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
    tableName: 'user_shares',
    comment: '用户分享表',
    indexes: [
      {
        fields: ['status']
      },
      {
        fields: ['surgery_type']
      },
      {
        fields: ['hospital_name']
      },
      {
        fields: ['source']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  return UserShare;
};

export default UserShare;
