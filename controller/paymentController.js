const axios = require("axios");

exports.Add = async (req, res) => {
  const url = 'https://developers.flouci.com/api/generate_payment';
  const { amount } = req.body;
  
  const payload = {
      "app_token": "c7895c50-a067-41b2-b2c5-978861e11991",
      "app_secret": "747e8502-6b09-4582-bbea-51fd321f9936",
      "amount": amount * 1000,
      "accept_card": "true",
      "session_timeout_secs": 1200,
      "success_link": "https://example.website.com/success", // Replace with your success page URL
      "fail_link": "https://example.website.com/fail", // Replace with your fail page URL
      "developer_tracking_id": Date.now().toString(), // Using timestamp as internal tracking ID
      "headers": {
          "Content-Type": "application/json"
      }
  };
  
  console.log('Payload:', payload);
  console.log('Headers:', axios.defaults.headers); 
  try {
    const response = await axios.post(url, payload);
    console.log('Response:', response.data.result.link); 
    res.send({
      paymentUrl: response.data.result.link,
      paymentStatus: 'pending' // Initially set to pending
    }); // Send payment URL and status back to the app
    console.log('Dooooooneeeeeeeeeeee'); 
} catch (error) {
    console.error(error);
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