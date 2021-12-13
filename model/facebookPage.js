module.exports = (sequelize, DataTypes) => {
    const FacebookPage = sequelize.define(
      "facebookPage",
      {
        token: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        fbPageId: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        userId: {
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
    return FacebookPage;
  };