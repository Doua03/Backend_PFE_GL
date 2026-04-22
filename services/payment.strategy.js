const axios = require('axios');

class PaymentStrategy {
  async process(amount) {
    throw new Error("Method 'process()' must be implemented.");
  }
}

class FlouciPaymentStrategy extends PaymentStrategy {
  async process(amount) {
    const url = 'https://developers.flouci.com/api/generate_payment';
    const payload = {
      "app_token": "c7895c50-a067-41b2-b2c5-978861e11991",
      "app_secret": "747e8502-6b09-4582-bbea-51fd321f9936",
      "amount": amount * 1000,
      "accept_card": "true",
      "session_timeout_secs": 1200,
      "success_link": "https://example.website.com/success",
      "fail_link": "https://example.website.com/fail",
      "developer_tracking_id": Date.now().toString()
    };

    const response = await axios.post(url, payload);
    return {
      paymentUrl: response.data.result.link,
      status: 'pending',
      method: 'Flouci'
    };
  }
}

class CashPaymentStrategy extends PaymentStrategy {
  async process(amount) {
    return {
      paymentUrl: null,
      status: 'completed',
      method: 'Cash',
      message: `Paiement de ${amount} DT à régler sur place.`
    };
  }
}

module.exports = {
  FlouciPaymentStrategy,
  CashPaymentStrategy
};
