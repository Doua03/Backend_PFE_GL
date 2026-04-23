const axios = require('axios');
const { FlouciPaymentStrategy, CashPaymentStrategy } = require('./payment.strategy');

class PaymentService {
    static async initializePayment(amount, method) {
        try {
            let strategy;

            switch (method) {
                case 'cash':
                    strategy = new CashPaymentStrategy();
                    break;
                case 'flouci':
                default:
                    strategy = new FlouciPaymentStrategy();
                    break;
            }

            return await strategy.process(amount);
        } catch (error) {
            throw error;
        }
    }

    static async verifyPayment(url) {
        try {
            const response = await axios.get(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'apppublic': "c7895c50-a067-41b2-b2c5-978861e11991",
                    'appsecret': "747e8502-6b09-4582-bbea-51fd321f9936"
                }
            });

            return response.data.status;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = PaymentService;
