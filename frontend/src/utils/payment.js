import axios from 'axios';

export const openPaymentGateway = async (campaignId, amount, donorDetails) => {
  try {
    console.log("Initiating payment for:", { campaignId, amount, donorDetails });

    const response = await axios.post("http://localhost:5000/api/payment/create-payment-session", {
      campaignId,
      amount,
      donorName: donorDetails.donorName,
      donorEmail: donorDetails.donorEmail,
      donorPhone: donorDetails.donorPhone,
    });

    console.log("Payment Session Response:", response.data);

    if (!response.data || !response.data.paymentSessionId) {
      alert("Failed to create payment session.");
      return;
    }

    const paymentSessionId = response.data.paymentSessionId;
    console.log("Opening Cashfree with Session ID:", paymentSessionId);

    // Ensure SDK is loaded before proceeding
    if (!window.Cashfree || !window.Cashfree.PG) {
      alert("Cashfree SDK not loaded. Please refresh and try again.");
      return;
    }

    // Open payment gateway
    window.Cashfree.PG({
      paymentSessionId: paymentSessionId,
    })
      .then(() => {
        window.location.reload();
      })
      .catch(error => {
        console.error("Payment Gateway Error:", error);
        alert("Payment failed. Check console for details.");
      });

  } catch (error) {
    console.error("Payment initialization error:", error);
    alert("Payment request failed. Check console for details.");
  }
};
