module.exports = (sequelize, DataTypes) => {
    const Activity = sequelize.define(
      "activity",
      {
        type: {
          type:  DataTypes.TEXT,
          allowNull: true,
        },
        timestamp: {
          type:  DataTypes.STRING,
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
    return Activity;
  };