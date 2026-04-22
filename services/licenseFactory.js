const License = require('../model/license');

class LicenseFactory {
  static createLicense(data) {
    const { user } = data;

    if (user === 'Admin') {
      console.log('Creating Admin License');
      return new License(data);
    } else if (user === 'Supervisor') {
      console.log('Creating Supervisor License');
      return new License(data);
    } else {
      // Default to standard License or throw error
      console.log('Creating Default License');
      return new License(data);
    }
  }
}

module.exports = LicenseFactory;
