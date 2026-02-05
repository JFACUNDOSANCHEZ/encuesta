const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const bcrypt = require('bcryptjs');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database_v2.sqlite'),
  logging: false,
});

const Review = sequelize.define('Review', {
  q1: { type: DataTypes.BOOLEAN, allowNull: false },
  q2: { type: DataTypes.BOOLEAN, allowNull: false },
  q3: { type: DataTypes.BOOLEAN, allowNull: false },
  q4: { type: DataTypes.BOOLEAN, allowNull: false },
  comment: { type: DataTypes.TEXT, allowNull: true },
});

const User = sequelize.define('User', {
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
});

const initDb = async () => {
  await sequelize.sync();
  console.log('Database & tables created!');

  // Create default admin user if not exists
  const adminExists = await User.findOne({ where: { username: 'admin' } });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({ username: 'admin', password: hashedPassword });
    console.log('Default admin user created: admin / admin123');
  }
};

module.exports = { sequelize, Review, User, initDb };
