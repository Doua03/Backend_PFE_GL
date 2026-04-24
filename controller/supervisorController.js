const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Supervisor = require("../model/supervisor");
const config = require("../config/config");
const supervisorModel = require("../model/supervisor");
const ObjectId = require("mongoose").Types.ObjectId;

// Supervisor Login
exports.logins = async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    // Check if all required fields are provided
    if (!email || !password || !userType) {
      return res
        .status(400)
        .json({ error: "Please provide email, password, and user type" });
    }

    // Find the supervisor based on email
    const supervisor = await Supervisor.findOne({ email });

    // If supervisor not found or user type is not matching, return error
    if (!supervisor || supervisor.session !== userType) {
      return res
        .status(401)
        .json({ error: "Incorrect email, password, or user type" });
    }

    // Compare the provided password with the hashed password stored in the database
    const isPasswordMatch = await bcrypt.compare(password, supervisor.password);

    // If password doesn't match, return error
    if (!isPasswordMatch) {
      return res
        .status(401)
        .json({ error: "Incorrect email, password, or user type" });
    }
    const secretKey = config.secretKey;
    const expiresIn = "1h"; // Token expiration time
    const token = jwt.sign(
      { _id: supervisor._id, email: supervisor.email },
      secretKey,
      { expiresIn },
    );
    res.status(200).json({ status: true, token: token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// List all Supervisors
exports.listSupervisors = async (req, res) => {
  try {
    const supervisors = await Supervisor.find({});
    res.json(supervisors);
  } catch (err) {
    console.error("Error while fetching supervisors:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Add Supervisor
exports.addSupervisor = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(422).send({ error: "Must provide email and password" });
    }

    const supervisor = new Supervisor({
      email,
      password,
      session: "Supervisor", // Set the session to 'Supervisor' by default
    });

    await supervisor.save();

    res.status(201).send(supervisor);
  } catch (error) {
    console.error("Error while adding supervisor:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get Supervisor by ID
exports.getSupervisorById = async (req, res) => {
  const supervisorId = req.params.id;

  try {
    const supervisor = await Supervisor.findById(supervisorId);

    if (!supervisor) {
      return res.status(404).json({ error: "Supervisor not found" });
    }

    res.status(200).json(supervisor);
  } catch (error) {
    console.error("Error while getting supervisor by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete Supervisor by ID
exports.deleteSupervisorById = async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).send(`Invalid ID: ${req.params.id}`);
  }

  try {
    const deletedSupervisor = await Supervisor.findOneAndDelete({
      _id: req.params.id,
    });

    if (!deletedSupervisor) {
      return res
        .status(404)
        .send(`Supervisor not found with ID: ${req.params.id}`);
    }

    res.json(deletedSupervisor);
  } catch (err) {
    console.error("Error while deleting supervisor:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
// controllers/supervisorController.js

exports.updateSupervisor = async (req, res) => {
  const supervisorId = req.params.supervisorId;
  console.log("Supervisor ID:", supervisorId);
  const { name, telephone, municipality, postcode, jobpost } = req.body;
  console.log("Request Body:", req.body);
  try {
    const supervisor = await Supervisor.findById(supervisorId);
    if (!supervisor) {
      return res.status(404).send("Supervisor not found");
    }

    supervisor.name = name || supervisor.name;
    supervisor.telephone = telephone || supervisor.telephone;
    supervisor.municipality = municipality || supervisor.municipality;
    supervisor.postcode = postcode || supervisor.postcode;
    supervisor.jobpost = jobpost || supervisor.jobpost;

    await supervisor.save();

    console.log("Updated Supervisor:", supervisor); // Added logging
    res.send("Supervisor information updated successfully");
  } catch (error) {
    console.error("Error updating supervisor information:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.getSupervisorCount = async (req, res) => {
  try {
    const supervisorCount = await Supervisor.countDocuments();
    res.status(200).json({ supervisorCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// List all Supervisors or search by name
exports.listSupervisors = async (req, res) => {
  try {
    const { name } = req.query;
    let query = {};
    if (name) {
      query = { name: { $regex: name, $options: "i" } }; // Case-insensitive search
    }
    const supervisors = await Supervisor.find(query);
    res.json(supervisors);
  } catch (err) {
    console.error("Error while fetching supervisors:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.modifyLicense = async (req, res) => {
  const supervisorId = req.params.supervisorId;
  const { type, period, price } = req.body;

  try {
    const supervisor = await Supervisor.findById(supervisorId);
    if (!supervisor) {
      return res.status(404).send("Supervisor not found");
    }

    // Update license details
    supervisor.license.type = type;
    supervisor.license.period = period;
    supervisor.license.price = price;

    await supervisor.save();

    res.status(200).send("Supervisor license updated successfully");
  } catch (error) {
    console.error("Error updating Supervisor license:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.calculateTotalLicensePrice = async (req, res) => {
  try {
    const supervisors = await Supervisor.find({}); // Récupère tous les administrateurs
    const totalPrice = supervisors.reduce((sum, supervisor) => {
      if (supervisor.license && supervisor.license.price) {
        return sum + supervisor.license.price; // Ajoute le prix de la licence si elle existe
      }
      return sum;
    }, 0);

    res.status(200).json({ totalPrice });
  } catch (error) {
    console.error("Error while calculating total license price:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
