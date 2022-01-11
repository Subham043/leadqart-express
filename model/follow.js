module.exports = (sequelize, DataTypes) => {
    const Follows = sequelize.define(
      "follows",
      {
        type: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        timestamp: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        leadId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        created_at: {
          type: "TIMESTAMP",
          defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
          allowNull: false,
        },
        updated_at: {
          type: "TIMESTAMP",
          defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
          allowNull: false,
        },
      },
      {
        timestamps: false,
      }
    );
    return Follows;
  };