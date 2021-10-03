import Sequelize from 'sequelize';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const database = new Sequelize({
  logging: false,
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'db.sqlite')
});

export default class Database {
  static get db() {
    return database;
  }

  static get Models() {
    return {
      Users: import('./Structures/User'),
      Config: import('./Structures/Config'),
      Bank: import('./Structures/Bank')
    };
  }
}
