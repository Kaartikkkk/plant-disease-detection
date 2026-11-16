const { DataTypes } = require('sequelize');

/**
 * Sequelize Model Definition for DiseaseScan records.
 * Can be plugged into any Node.js / Sequelize database configuration.
 */
module.exports = (sequelize) => {
  const DiseaseScan = sequelize.define('DiseaseScan', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    farm_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    image_filename: {
      type: DataTypes.STRING,
      allowNull: false
    },
    crop_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    disease_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    confidence: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    severity: {
      type: DataTypes.STRING,
      allowNull: false
    },
    is_healthy: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    symptoms_text: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    treatment_json: {
      type: DataTypes.JSON,
      allowNull: false
    },
    top_3_json: {
      type: DataTypes.JSON,
      allowNull: false
    },
    grad_cam_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    scan_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'DiseaseScans',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return DiseaseScan;
};
