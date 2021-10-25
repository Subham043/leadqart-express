module.exports = (sequelize, DataTypes) => {
    const contentFile = sequelize.define(
      "contentFile",
      {
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        upload: {
          type: DataTypes.STRING,
          allowNull: false,
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
    return contentFile;
  };