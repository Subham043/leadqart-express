module.exports = (sequelize, DataTypes) => {
    const Facebook = sequelize.define(
      "facebook",
      {
        token: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        fbId: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        fbName: {
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
    return Facebook;
  };