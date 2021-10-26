module.exports = (sequelize, DataTypes) => {
    const Leads = sequelize.define(
      "leads",
      {
        leadSource: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        facebookPage: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        campaign: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        adset: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        ad: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        formName: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        phone: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        job: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        newLead: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue:1
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
    return Leads;
  };