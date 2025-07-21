
import React, { useState } from 'react';
import SectionWrapper from '../components/SectionWrapper.tsx';
import Button from '../components/Button.tsx';
import { paymentAPI } from '../services/api.ts';
import { useToast } from '../context/ToastContext.tsx';

declare var Razorpay: any;

const PaymentTestPage: React.FC = () => {
    const [testData, setTestData] = useState({
        campaignId: 'TEST_CAMPAIGN_ID',
        amount: 100,
        donorName: 'Test Donor',
        donorEmail: 'test@example.com',
        donorPhone: '+919876543210'
    });
    const [loading, setLoading] = useState(false);
    const [paymentConfig, setPaymentConfig] = useState<any>(null);
    const { addToast } = useToast();

    const loadPaymentConfig = async () => {
        try {
            const response = await fetch('/api/payment/test/config');
            const data = await response.json();
            if (data.success) {
                setPaymentConfig(data.data.config);
                addToast('Payment config loaded', 'success');
            }
        } catch (error) {
            addToast('Failed to load payment config', 'error');
        }
    };

    const testCreateOrder = async () => {
        setLoading(true);
        try {
            const response = await paymentAPI.createOrder(testData);
            if (response.success) {
                addToast('Payment order created successfully!', 'success');
                console.log('Order Response:', response.data);
                
                // Auto-trigger Razorpay modal for testing
                if (window.Razorpay) {
                    const rzpOptions = {
                        key: paymentConfig?.razorpay_key_id || 'rzp_test_1DP5mmOlF5G5ag',
                        amount: response.data.order.amount,
                        currency: response.data.order.currency,
                        name: 'DonationHub - Testing',
                        description: 'Test Payment',
                        order_id: response.data.order.id,
                        handler: async (razorpayResponse: any) => {
                            try {
                                const verificationData = {
                                    razorpay_order_id: razorpayResponse.razorpay_order_id,
                                    razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                                    razorpay_signature: razorpayResponse.razorpay_signature,
                                    donationId: response.data.donation.id,
                                };
                                const verifyResult = await paymentAPI.verifyPayment(verificationData);
                                if (verifyResult.success) {
                                    addToast('Payment verified successfully!', 'success');
                                } else {
                                    addToast('Payment verification failed', 'error');
                                }
                            } catch (error: any) {
                                addToast(error.message || 'Verification failed', 'error');
                            }
                        },
                        prefill: {
                            name: testData.donorName,
                            email: testData.donorEmail,
                            contact: testData.donorPhone,
                        },
                        theme: {
                            color: '#003f5c',
                        },
                        modal: {
                            ondismiss: () => {
                                addToast('Payment cancelled', 'info');
                            },
                        },
                    };
                    const rzp = new Razorpay(rzpOptions);
                    rzp.open();
                }
            } else {
                addToast(response.message || 'Failed to create order', 'error');
            }
        } catch (error: any) {
            addToast(error.message || 'Order creation failed', 'error');
        }
        setLoading(false);
    };

    const simulatePaymentSuccess = async () => {
        try {
            // First create an order
            const orderResponse = await paymentAPI.createOrder(testData);
            if (orderResponse.success) {
                // Then simulate success
                const response = await fetch('/api/payment/simulate-success', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ donationId: orderResponse.data.donation.id })
                });
                const result = await response.json();
                if (result.success) {
                    addToast('Payment simulated successfully!', 'success');
                } else {
                    addToast(result.message || 'Simulation failed', 'error');
                }
            }
        } catch (error: any) {
            addToast(error.message || 'Simulation failed', 'error');
        }
    };

    React.useEffect(() => {
        loadPaymentConfig();
    }, []);

    return (
        <SectionWrapper className="min-h-screen py-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8">Payment Testing Dashboard</h1>
                
                {paymentConfig && (
                    <div className="bg-blue-50 p-4 rounded-lg mb-6">
                        <h3 className="font-semibold mb-2">Payment Configuration</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><strong>Key ID:</strong> {paymentConfig.razorpay_key_id}</div>
                            <div><strong>Currency:</strong> {paymentConfig.currency}</div>
                            <div><strong>Test Mode:</strong> {paymentConfig.test_mode ? 'Yes' : 'No'}</div>
                            <div className="col-span-2"><strong>Notes:</strong> {paymentConfig.notes}</div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-4">Test Data</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Campaign ID</label>
                                <input
                                    type="text"
                                    value={testData.campaignId}
                                    onChange={(e) => setTestData({...testData, campaignId: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Amount (₹)</label>
                                <input
                                    type="number"
                                    value={testData.amount}
                                    onChange={(e) => setTestData({...testData, amount: Number(e.target.value)})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Donor Name</label>
                                <input
                                    type="text"
                                    value={testData.donorName}
                                    onChange={(e) => setTestData({...testData, donorName: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input
                                    type="email"
                                    value={testData.donorEmail}
                                    onChange={(e) => setTestData({...testData, donorEmail: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Phone</label>
                                <input
                                    type="text"
                                    value={testData.donorPhone}
                                    onChange={(e) => setTestData({...testData, donorPhone: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold mb-4">Test Actions</h3>
                        <div className="space-y-4">
                            <Button
                                onClick={testCreateOrder}
                                disabled={loading}
                                className="w-full"
                                variant="primary"
                            >
                                {loading ? 'Creating...' : 'Test Razorpay Payment Flow'}
                            </Button>
                            
                            <Button
                                onClick={simulatePaymentSuccess}
                                disabled={loading}
                                className="w-full"
                                variant="secondary"
                            >
                                Simulate Payment Success
                            </Button>

                            <Button
                                onClick={loadPaymentConfig}
                                className="w-full"
                                variant="outline"
                            >
                                Reload Payment Config
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Testing Instructions</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Use dummy Razorpay keys: rzp_test_1DP5mmOlF5G5ag</li>
                        <li>Test with different amounts and donor details</li>
                        <li>Check browser console for detailed logs</li>
                        <li>Use "Simulate Payment Success" for quick testing without UI</li>
                        <li>All test payments are using dummy credentials</li>
                    </ul>
                </div>
            </div>
        </SectionWrapper>
    );
};

export default PaymentTestPage;
