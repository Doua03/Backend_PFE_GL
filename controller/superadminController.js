const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const SuperAdminModel = require("../model/superadmin");
const config = require("../config/config");
const ObjectId = require("mongoose").Types.ObjectId;

// Superadmin Login
exports.loginsa = async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    // Check if all required fields are provided
    if (!email || !password || !userType) {
      return res
        .status(400)
        .json({ error: "Please provide email, password, and user type" });
    }

    // Find the user based on email
    const user = await SuperAdminModel.findOne({ email });

    // If user not found or user type is not matching, return error
    if (!user || user.session !== userType) {
      return res
        .status(401)
        .json({ error: "Incorrect email, password, or user type" });
    }

    // Compare the provided password with the hashed password stored in the database
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    // If password doesn't match, return error
    if (!isPasswordMatch) {
      return res
        .status(401)
        .json({ error: "Incorrect email, password, or user type" });
    }
    // Assuming config.jwtSecret is your JWT secret key
    const secretKey = config.secretKey;
    const expiresIn = "1h"; // Token expiration time
    const token = jwt.sign({ _id: user._id, email: user.email }, secretKey, {
      expiresIn,
    });
    res.status(200).json({ status: true, token: token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// List all Superadmins
exports.listSuperadmins = async (req, res) => {
  try {
    const superadmins = await SuperAdminModel.find({});
    res.json(superadmins);
  } catch (error) {
    console.error("Error while fetching superadmins:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get Superadmin by ID
exports.getSuperadminById = async (req, res) => {
  try {
    const superadmin = await SuperAdminModel.findById(req.body._id);
    if (!superadmin) {
      return res.status(404).json({ error: "Superadmin not found" });
    }
    res.json(superadmin);
  } catch (error) {
    console.error("Error while fetching superadmin by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete Superadmin by ID
exports.deleteSuperadminById = async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).send(`Invalid ID: ${req.params.id}`);
    }

    const deletedSuperadmin = await SuperAdminModel.findByIdAndDelete(
      req.params.id,
    );

    if (!deletedSuperadmin) {
      return res
        .status(404)
        .send(`Superadmin not found with ID: ${req.params.id}`);
    }

    res.json(deletedSuperadmin);
  } catch (error) {
    console.error("Error while deleting superadmin:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
