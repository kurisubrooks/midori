import Sequelize from 'sequelize';
import Database from '../Database';

const Bank = Database.db.define('bank', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  balance: Sequelize.INTEGER
});

Bank.sync();
export default Bank;
