const PaymentService = require('../services/payment.services');

exports.Add = async (req, res) => {
  const { amount, method } = req.body;
  
  try {
    const result = await PaymentService.initializePayment(amount, method);
    res.status(200).send(result);

  } catch (error) {
    console.error('[PaymentController] Erreur :', error);
    res.status(500).send("Error processing payment");
  }
};

exports.Verify = async (req, res) => {
  // En supposant que l'URL est fournie ou construite ici
  const url = `https://developers.flouci.com/api/verify_payment/${req.params.id}`; 
  
  try {
    const paymentStatus = await PaymentService.verifyPayment(url);
    res.send({ status: paymentStatus });
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Error verifying payment");
  }
};