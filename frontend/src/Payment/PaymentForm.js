import React, { useState } from 'react';
import { Button, TextField } from '@mui/material';
import axios from 'axios';

const PaymentForm = () => {
  const [amount, setAmount] = useState('');

  const handlePayment = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/payment/create', {
        amount,
        donorName: 'John Doe',
        donorEmail: 'johndoe@example.com',
      });
      // Redirect to payment gateway
      console.log(response.data);
    } catch (error) {
      console.error("Payment Error: ", error);
    }
  };

  return (
    <div>
      <TextField
        label="Donation Amount"
        variant="outlined"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        fullWidth
        margin="normal"
      />
      <Button variant="contained" color="primary" onClick={handlePayment}>Donate</Button>
    </div>
  );
};

export default PaymentForm;
