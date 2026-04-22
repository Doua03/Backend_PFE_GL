const axios = require("axios");

const { FlouciPaymentStrategy, CashPaymentStrategy } = require('../services/payment.strategy');

exports.Add = async (req, res) => {
  const { amount, method } = req.body;
  
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

    const result = await strategy.process(amount);
    res.status(200).send(result);

  } catch (error) {
    console.error('[PaymentController] Erreur :', error);
    res.status(500).send("Error processing payment");
  }
};



exports.Verify = async (req, res) => {
// Your existing code...
try {
    const response = await axios.get(url, {
        headers: {
            'Content-Type': 'application/json',
            'apppublic': "c7895c50-a067-41b2-b2c5-978861e11991",
            'appsecret': "747e8502-6b09-4582-bbea-51fd321f9936"
        }
    });

    const paymentStatus = response.data.status;
    res.send({ status: paymentStatus });
} catch (error) {
    console.error(error.message);
    res.status(500).send("Error verifying payment");
}
};