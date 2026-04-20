const License = require('../model/license');

exports.addLicense = async (req, res) => {
  try {
    const { name, type, user, price, period, description } = req.body;
    const license = new License({
      name,
      type,
      user,
      price,
      period,
      description
    });
    await license.save();
    res.status(201).json({ message: 'License added successfully' });
  } catch (error) {
    console.error('Error adding license', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
exports.getlicensesS = async (req, res) => {
  try {
    const licenses = await License.find({user:'Supervisor'}); // Sélectionnez uniquement les champs nécessaires
    res.status(200).json(licenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getlicensesA = async (req, res) => {
  try {
    const licenses = await License.find({user:'Admin'}); // Sélectionnez uniquement les champs nécessaires
    res.status(200).json(licenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getlicenses = async (req, res) => {
  try {
    const licenses = await License.find({}); // Sélectionnez uniquement les champs nécessaires
    res.status(200).json(licenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getLicenseById = async (req, res) => {
  try {
    const license = await License.findById(req.params.id);
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
    let license = await License.findById(req.params.id);
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
    const license = await License.findById(req.params.id);

    if (!license) {
      return res.status(404).json({ msg: 'License not found' });
    }

    await License.deleteOne({ _id: req.params.id }); // Utilisez la méthode deleteOne pour supprimer le document

    res.json({ msg: 'License removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};


