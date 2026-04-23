const UserModel = require('../model/user.model');
const { ObjectId } = require('mongodb');

class RealUserService {
  async listUsers() {
    return await UserModel.find({}).exec();
  }

  async deleteUser(userId) {
    if (!ObjectId.isValid(userId)) {
      throw { status: 400, message: `No record with given id : ${userId}` };
    }
    const deleted = await UserModel.findOneAndDelete({ _id: userId });
    if (!deleted) {
      throw { status: 404, message: `User not found with ID: ${userId}` };
    }
    return deleted;
  }
}

module.exports = RealUserService;