const UserModel= require('../model/user.model');
const jwt= require('jsonwebtoken');
const bcrypt = require('bcrypt');

class UserService{
  static async findUserByEmail(email) {
    try {
      return await UserModel.findOne({ email });
    } catch (error) {
      throw error;
    }
  }
  
  static async registerUser(username , email ,password){
    try{
      const createUser= new UserModel({username,email,password});
      return await createUser.save();

    }catch(err){
      throw err;
    }
  }
  static async checkuser(email){
    try{
      return await UserModel.findOne({email});

    }
    catch(error){
      throw error;
    
    }
  }

  static async generateToken(tokenData,secretkey,jwt_expire){
  return jwt.sign(tokenData,secretkey,{expiresIn:jwt_expire});
  }

  static async findUserById(userId) {
    try {
      return await UserModel.findById(userId);
    } catch (error) {
      throw error;
    }
  }

   static async resetPassword(email, newPassword) {
    const user = await UserModel.findOne({ email });
    if (!user) throw new Error('User not found');
    if (!newPassword) throw new Error('New password is required');

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
  }

  static async updateUser(email, newData) {
    const user = await UserModel.findOne({ email });
    if (!user) throw new Error('User not found');
    return await user.updateUser(newData);
  }

  static async deleteByEmail(email) {
    const user = await UserModel.findOne({ email });
    if (!user) throw new Error('User not found');
    await UserModel.deleteOne({ email });
  }

  static async addVehicle(userId, type, num) {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      user.vehicles.push({ type, num });
      await user.save();

      return { message: 'Vehicle added successfully' };
    } catch (error) {
      throw error;
    }
  }

  static async deleteVehicle(userId, num) {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error('User not found');

    const index = user.vehicles.findIndex(v => v.num === num);
    if (index === -1) throw new Error('Vehicle not found');

    user.vehicles.splice(index, 1);
    await user.save();
  }

  static async addCreditCard(userId, cardHolder, cardNumber, cardExpiry, cardCVC) {
    if (!userId || !cardHolder || !cardNumber || !cardExpiry || !cardCVC) {
      throw new Error('All fields are required');
    }
    const expiryRegex = /^\d{2}\/\d{2}$/;
    if (!expiryRegex.test(cardExpiry)) {
      throw new Error('Invalid card expiration date format. Please use MM/YY');
    }
    return await UserService.addPayment(userId, cardHolder, cardNumber, cardExpiry, cardCVC);
  }


  static async deleteCreditCard(userId, cardNumber) {
    const user = await UserModel.findById(userId);
    if (!user) throw new Error('User not found');

    const index = user.payment.findIndex(c => c.cardNumber === cardNumber);
    if (index === -1) throw new Error('Credit Card not found');

    user.payment.splice(index, 1);
    await user.save();
  }

  static async addPayment(userId, cardHolder, cardNumber, cardExpiry, cardCVC) {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      user.payment.push({ cardHolder, cardNumber, cardExpiry, cardCVC});
      await user.save();

      return { message: 'Credit Card added successfully' };
    } catch (error) {
      throw error;
    }
  }
}

  


module.exports = UserService;