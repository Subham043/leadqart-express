module.exports = (sequelize, DataTypes) => {
    const Teams = sequelize.define(
      "teams",
      {
        teamId: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        memberId: {
          type: DataTypes.INTEGER,
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
    return Teams;
  };