const licenseRepository = require('../repositories/license.repository');


exports.addLicense = async (req, res) => {
  try {
    const { name, type, user, price, period, description } = req.body;
    await licenseRepository.create({
      name,
      type,
      user,
      price,
      period,
      description
    });

    res.status(201).json({ message: 'License added successfully' });
  } catch (error) {
    console.error('Error adding license', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
exports.getlicensesS = async (req, res) => {
  try {
    const licenses = await licenseRepository.findByUserType('Supervisor');

    res.status(200).json(licenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getlicensesA = async (req, res) => {
  try {
    const licenses = await licenseRepository.findByUserType('Admin');

    res.status(200).json(licenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getlicenses = async (req, res) => {
  try {
    const licenses = await licenseRepository.findAll({});

    res.status(200).json(licenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getLicenseById = async (req, res) => {
  try {
    const license = await licenseRepository.findById(req.params.id);

    if (!license) {
      return res.status(404).json({ msg: 'Parking not found' });
    
    }
    res.json(license);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
exports.updateLicense = async (req, res) => {
  const { name, type, period, price, description,user } = req.body;
  try {
    let license = await licenseRepository.findById(req.params.id);

    if (!license) {
      return res.status(404).json({ msg: 'Parking not found' });
    }

    license.name = name;
    license.type = type;
    license.period = period;
    license.price = price;
    license.description = description;
    license.user=user;

    // Vérifiez s'il y a une nouvelle image
    
    await license.save();

    res.json({ msg: 'License updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
exports.deleteLicense = async (req, res) => {
  try {
    const license = await licenseRepository.findById(req.params.id);


    if (!license) {
      return res.status(404).json({ msg: 'License not found' });
    }

    await licenseRepository.delete(req.params.id);


    res.json({ msg: 'License removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


