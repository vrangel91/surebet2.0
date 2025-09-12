const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Plan = sequelize.define('Plan', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    display_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    duration_days: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    features: {
      type: DataTypes.JSON,
      allowNull: true
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true
    },
    css_class: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'plans',
    timestamps: true
  })

  return Plan
}
