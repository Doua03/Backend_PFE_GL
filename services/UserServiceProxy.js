const jwt = require('jsonwebtoken');
const AdminModel = require('../model/admin');
const SuperAdminModel = require('../model/superadmin');
const RealUserService = require('./RealUserService');
const config = require('../config/config');

class UserServiceProxy {
  constructor() {
    this.realService = new RealUserService();
  }

  async #checkAdminAccess(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw { status: 401, message: 'Access denied: no token provided' };
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, config.secretKey);
    } catch {
      throw { status: 401, message: 'Access denied: invalid or expired token' };
    }

    const isAdmin      = await AdminModel.findById(decoded._id);
    const isSuperAdmin = await SuperAdminModel.findById(decoded._id);

    if (!isAdmin && !isSuperAdmin) {
      throw { status: 403, message: 'Access denied: Admin or SuperAdmin role required' };
    }
  }

  async listUsers(authHeader) {
    await this.#checkAdminAccess(authHeader);
    return await this.realService.listUsers();
  }

  async deleteUser(userId, authHeader) {
    await this.#checkAdminAccess(authHeader);
    return await this.realService.deleteUser(userId);
  }
}

module.exports = UserServiceProxy;