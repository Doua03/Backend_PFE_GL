const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SuperAdminModel = require('../model/superadmin');
const config = require('../config/config');
const ObjectId = require('mongoose').Types.ObjectId;

// Superadmin Login
exports.loginsa = async (req, res) => {
    try {
        const { email, password, userType } = req.body;

        // Check if all required fields are provided
        if (!email || !password || !userType) {
            return res.status(400).json({ error: "Please provide email, password, and user type" });
        }

        // Find the user based on email
        const user = await SuperAdminModel.findOne({ email });

        // If user not found or user type is not matching, return error
        if (!user || user.session !== userType) {
            return res.status(401).json({ error: "Incorrect email, password, or user type" });
        }

        // Compare the provided password with the hashed password stored in the database
        const isPasswordMatch = await bcrypt.compare(password, user.password);

        // If password doesn't match, return error
        if (!isPasswordMatch) {
            return res.status(401).json({ error: "Incorrect email, password, or user type" });
        }
      // Assuming config.jwtSecret is your JWT secret key
      const secretKey = config.secretKey;
      const expiresIn = '1h'; // Token expiration time
      const token = jwt.sign({ _id: user._id, email: user.email }, secretKey, { expiresIn });
      res.status(200).json({ status: true, token: token });

    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// List all Superadmins
exports.listSuperadmins = (req, res) => {
    SuperAdminModel.find({})
        .exec(function(err, superadmins) {
            if (err) {
                console.error("Error while fetching superadmins:", err);
                return res.status(500).json({ error: "Internal server error" });
            } else {
                res.json(superadmins);
            }
        });
};

// Get Superadmin by ID
exports.getSuperadminById = (req, res) => {
    SuperAdminModel.find({"_id": req.body._id})
        .exec(function(err, superadmin) {
            if (err) {
                console.error("Error while fetching superadmin by ID:", err);
                return res.status(500).json({ error: "Internal server error" });
            } else {
                res.json(superadmin);
            }
        });
};

// Delete Superadmin by ID
exports.deleteSuperadminById = (req, res) => {
    if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).send(`Invalid ID: ${req.params.id}`);
    }

    SuperAdminModel.findByIdAndRemove(req.params.id, (err, deletedSuperadmin) => {
        if (err) {
            console.error("Error while deleting superadmin:", err);
            return res.status(500).json({ error: "Internal server error" });
        }
        
        if (!deletedSuperadmin) {
            return res.status(404).send(`Superadmin not found with ID: ${req.params.id}`);
        }

        res.json(deletedSuperadmin);
    });
};
