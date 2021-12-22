module.exports = (sequelize, DataTypes) => {
    const assignedLeads = sequelize.define(
      "assigned_leads",
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        team_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        member_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        lead_id: {
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
    return assignedLeads;
  };