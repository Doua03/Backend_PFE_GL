const jwt = require('jsonwebtoken');
const adminRepository = require('../repositories/admin.repository');
const config = require('../config/config');
const ObjectId = require('mongoose').Types.ObjectId;
const supervisorRepository = require('../repositories/supervisor.repository');
const SupervisorService = require("../services/supervisor.services");

// Login Admin
exports.logina = async (req, res, next) => {
    try {
        const { email, password, userType } = req.body;

        if (!email || !password || !userType) {
            return res.status(422).send({ error: "Must provide email, password, and userType" });
        }

        const user = await adminRepository.findByEmail(email);


        if (!user) {
            return res.status(422).send({ error: "Invalid email or password" });
        }

        const isPasswordMatch = await user.comparePassword(password);

        if (!isPasswordMatch) {
            return res.status(422).send({ error: "Invalid email or password" });
        }

        const secretKey = config.secretKey;
        const expiresIn = '1h'; // Token expiration time
        const token = jwt.sign({ _id: user._id, email: user.email }, secretKey, { expiresIn });
        res.status(200).json({ status: true, token: token });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// List Admins for superadmin
exports.list = async (req, res) => {
    try {
        const admins = await adminRepository.findAll();

        res.json(admins);
    } catch (error) {
        console.error("Error while fetching admins:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Add Admin
exports.add = async (req, res) => {
  try {
      const { userId, email, password } = req.body;

      if (!email || !password) {
          return res.status(422).send({ error: "Must provide email and password" });
      }
      const newAdmin = await SupervisorService.addAdmin(userId, email, password); // corrected function name

      res.status(201).send(newAdmin);
  } catch (error) {
      console.error("Error while adding admin:", error);
      res.status(500).json({ error: "Internal server error" });
  }
};

// List Admins for supervisor
exports.listSuper = async (req, res) => {
try {
    const { userId } = req.query; // Utilisez req.query pour récupérer l'ID de l'utilisateur
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    // Assuming the supervisor model is correctly set up to find a supervisor by their ID
    const supervisor = await supervisorRepository.findById(userId);

    if (!supervisor) {
      return res.status(404).json({ message: 'Supervisor not found' });
    }

    // Assuming you have a method to get admins by supervisor ID
    const admins = await adminRepository.findAll({ supervisor: userId });

    res.status(200).json(admins);
} catch (error) {
    console.error("Error while fetching admins:", error);
    res.status(500).json({ error: "Internal server error" });
}
};

// Delete Admin
exports.delete = async (req, res) => {
    try {
        if (!ObjectId.isValid(req.params.id))
            return res.status(400).send(`No record with given id : ${req.params.id}`);

        const deletedAdmin = await adminRepository.delete(req.params.id);
        if (!deletedAdmin) {
            return res.status(404).send(`Admin not found with ID: ${req.params.id}`);
        }
        res.json(deletedAdmin);

    } catch (error) {
        console.error("Error while deleting admin:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Update Admin
exports.updateAdmin = async (req, res) => {
    const adminId = req.params.adminId;
    const { name, telephone, entreprise, postcode, job} = req.body;

    try {
        const admin = await adminRepository.findById(adminId);

        if (!admin) {
            return res.status(404).send('Admin not found');
        }

        admin.name = name || admin.name;
        admin.telephone = telephone || admin.telephone;
        admin.entreprise = entreprise || admin.entreprise;
        admin.postcode = postcode || admin.postcode;
        admin.job = job || admin.job;

        await admin.save();

        res.send('Admin information updated successfully');
    } catch (error) {
        console.error('Error updating Admin information:', error);
        res.status(500).send('Internal Server Error');
    }
};

exports.modifyLicense = async (req, res) => {
  const adminId = req.params.adminId;
  const { type, period, price} = req.body;

  try {
    const admin = await adminRepository.findById(adminId);

    if (!admin) {
      return res.status(404).send('Admin not found');
    }

    // Update license details
    admin.license.type = type;
    admin.license.period = period;
    admin.license.price = price;

    await admin.save();

    res.status(200).send('Admin license updated successfully');
  } catch (error) {
    console.error('Error updating Admin license:', error);
    res.status(500).send('Internal Server Error');
  }
};

// Get Admin by Email
exports.getadmin = async (req, res) => {
  const { email } = req.query;
  console.log('Searching for admin with email:', email);

  try {
    const admin = await adminRepository.findByEmail(email);

    console.log('Admin found:', admin);
    
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    res.status(200).json(admin); // Return only admin object
  } catch (error) {
    console.error('Error while getting admin:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
exports.getAdminCount = async (req, res) => {
  try {
    const AdminCount = await adminRepository.count();

    res.status(200).json({ AdminCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get Admin by ID
exports.getAdminById = async (req, res) => {
  const adminId = req.params.id; // Updated to use "id" instead of "adminId"
console.log(adminId);
  try {
    const admin = await adminRepository.findById(adminId);

    
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.status(200).json(admin); // Return admin object
  } catch (error) {
    console.error('Error while getting admin by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
exports.calculateTotalLicensePrice = async (req, res) => {
  try {
    const totalPrice = await adminRepository.calculateTotalLicensePrice();
    res.status(200).json({ totalPrice });
  } catch (error) {
    console.error('Error while calculating total license price:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


