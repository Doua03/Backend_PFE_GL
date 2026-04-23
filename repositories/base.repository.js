/**
 * Base Repository (Interface/Abstraction)
 * Suivant le principe DIP, cette classe définit le contrat pour l'accès aux données.
 */
class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findById(id) {
    return await this.model.findById(id);
  }

  async findAll(query = {}) {
    return await this.model.find(query);
  }

  async findOne(query = {}) {
    return await this.model.findOne(query);
  }

  async create(data) {
    const instance = new this.model(data);
    return await instance.save();
  }

  async update(id, data) {
    return await this.model.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await this.model.findByIdAndDelete(id);
  }

  async count(query = {}) {
    return await this.model.countDocuments(query);
  }

  async calculateTotalLicensePrice() {
    const records = await this.findAll();
    return records.reduce((sum, record) => {
      if (record.license && record.license.price) {
        return sum + record.license.price;
      }
      return sum;
    }, 0);
  }

  async aggregate(pipeline) {
    return await this.model.aggregate(pipeline);
  }
}



module.exports = BaseRepository;
