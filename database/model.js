import { Model, DataTypes } from 'sequelize';
import util from 'util';
import connectToDB from './db.js'

export const db = await connectToDB('postgresql:///mansion');

export class User extends Model {
    [util.inspect.custom]() {
        return this.toJSON();
    }
}

User.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(40),
      allowNull: false,
      unique: true,
    },
    username: {
        type: DataTypes.STRING(40),
        allowNull: false,
        unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    modelName: 'user',
    sequelize: db,
    timestamps: true,
    updatedAt: true,
  },
);

export class Pet extends Model {
    [util.inspect.custom]() {
        return this.toJSON();
    }
}

Pet.init(
  {
    petId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    petName: {
      type: DataTypes.STRING(40),
      allowNull: false,
    },
    hunger: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    hungerDefault: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    speed: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    swim: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    jump: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    luck: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    frontHalf: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    backHalf: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
  },
  {
    modelName: 'pet',
    sequelize: db,
    timestamps: true,
    updatedAt: true,
  },
);

export class Medal extends Model {
    [util.inspect.custom]() {
        return this.toJSON();
    }
}

Medal.init(
    {
      medalId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      type: {
        type: DataTypes.STRING(40),
        allowNull: false,
      },
    },
    {
      modelName: 'medal',
      sequelize: db,
      timestamps: false,
      updatedAt: false,
    },
);

export class MedalHandler extends Model {
    [util.inspect.custom]() {
        return this.toJSON();
    }
}

MedalHandler.init(
  {
    medalHandlerId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
  }
   },
  {
    modelName: 'medal_handler',
    sequelize: db,
    timestamps: false,
    updatedAt: false,
  },
);


export class Achievement extends Model {
    [util.inspect.custom]() {
        return this.toJSON();
    }
}

Achievement.init(
    {
      achievementId: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      type: {
        type: DataTypes.STRING(40),
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING(1020),
        allowNull: false,
      },
    },
    {
      modelName: 'achievement',
      sequelize: db,
      timestamps: false,
      updatedAt: false,
    },
);

export class AchievementHandler extends Model {
    [util.inspect.custom]() {
        return this.toJSON();
    }
}

AchievementHandler.init(
    {},
    {
      modelName: 'achievement_handler',
      sequelize: db,
      timestamps: false,
      updatedAt: false,
    },
);

// one to many relationship user -> pets
User.hasMany(Pet, { foreignKey: 'userId' });
Pet.belongsTo(User,  { foreignKey: 'userId' });

// many to many relationship user <-> medal
    // create a junction table automatically for medals
    User.belongsToMany(Medal, {through: { model: 'medal_handler', unique: false}, foreignKey: 'userId'})
    Medal.belongsToMany(User, {through: { model: 'medal_handler', unique: false}, foreignKey: 'medalId'})

// many to many relationship user <-> achievement
    // create a junction table automatically for achievements
User.belongsToMany(Achievement, {through: 'achievement_handler', foreignKey: 'userId'})
Achievement.belongsToMany(User, {through: 'achievement_handler', foreignKey: 'achievementId'})

