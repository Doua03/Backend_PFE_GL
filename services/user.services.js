const UserModel= require('../model/user.model');
const jwt= require('jsonwebtoken');

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