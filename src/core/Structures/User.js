import Sequelize from 'sequelize';
import Database from '../Database';

const Users = Database.db.define('users', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  data: Sequelize.STRING
});

Users.sync();
export default Users;
