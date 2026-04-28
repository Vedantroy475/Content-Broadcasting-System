const bcrypt = require('bcryptjs');
const { sequelize, User, Subject } = require('../models');
const { ROLES } = require('../utils/constants');

const seedDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    await sequelize.sync({ alter: true });
    console.log('Models synchronized.');

    // Seed Principal
    const principalExists = await User.findOne({ where: { role: ROLES.PRINCIPAL } });

    if (!principalExists) {
      const passwordHash = await bcrypt.hash('principal123', 12);
      await User.create({
        name: 'Principal Admin',
        email: 'principal@school.edu',
        password_hash: passwordHash,
        role: ROLES.PRINCIPAL,
      });
      console.log('Principal user seeded: principal@school.edu / principal123');
    } else {
      console.log('Principal already exists. Skipping.');
    }

    // Seed Subjects
    const defaultSubjects = ['maths', 'science', 'english', 'history', 'geography'];

    for (const subjectName of defaultSubjects) {
      const [subject, created] = await Subject.findOrCreate({
        where: { name: subjectName },
        defaults: { name: subjectName },
      });
      if (created) {
        console.log(`Subject seeded: ${subjectName}`);
      }
    }

    console.log('Seeding completed.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
