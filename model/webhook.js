module.exports = (sequelize, DataTypes) => {
    const Webhook = sequelize.define(
      "webhook",
      {
        message: {
          type: DataTypes.TEXT,
          allowNull: true,
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
    return Webhook;
  };