import { useState, useMemo } from 'react';
import { useQueue } from '../context/QueueContext';
import { QRCodeSVG } from 'qrcode.react';
import { CloseIcon, ClipboardIcon } from './Icons';
import './PaymentForm.css';

const PaymentForm = ({ onPaymentComplete, onCancel }) => {
    const { currentCart, getCartTotal, submitOrder, queueCounter } = useQueue();
    const [userName, setUserName] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [errors, setErrors] = useState({});

    const paymentMethods = [
        { id: 'cash', name: 'Tunai', icon: '💵' },
        { id: 'qris', name: 'QRIS', icon: '📲' },
    ];

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    // Generate QR code value only once using useMemo
    const qrCodeValue = useMemo(() => {
        return JSON.stringify({
            merchant: 'Restoran Kita',
            queueNumber: queueCounter, // Unique per queue
            amount: getCartTotal(),
            currency: 'IDR',
            customer: userName || 'Guest',
            items: currentCart.map(item => ({
                name: item.name,
                qty: item.quantity,
                price: item.price
            }))
        });
    }, [queueCounter, getCartTotal, userName, currentCart]);

    const validateForm = () => {
        const newErrors = {};

        if (!userName.trim()) {
            newErrors.userName = 'Nama harus diisi';
        } else if (userName.trim().length < 3) {
            newErrors.userName = 'Nama minimal 3 karakter';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        console.log('🔵 handleSubmit called!');
        console.log('🔵 Event:', e);

        e.preventDefault();
        e.stopPropagation(); // Prevent event bubbling

        console.log('🔵 Form submitted');
        console.log('🔵 User name:', userName);
        console.log('🔵 Payment method:', paymentMethod);
        console.log('🔵 Cart:', currentCart);
        console.log('🔵 Cart length:', currentCart.length);

        if (!validateForm()) {
            console.log('❌ Validation failed');
            console.log('❌ Errors:', errors);
            return;
        }

        console.log('✅ Validation passed');
        console.log('🔵 Calling submitOrder...');
        const queueNumber = submitOrder(userName.trim(), paymentMethod);
        console.log('🔵 Queue number received:', queueNumber);

        if (queueNumber) {
            console.log('✅ Payment complete, calling onPaymentComplete');
            onPaymentComplete(queueNumber);
        } else {
            console.error('❌ Failed to get queue number');
        }
    };

    const handleCancel = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
    };

    return (
        <div className="payment-overlay" onClick={handleCancel}>
            <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
                <div className="payment-header">
                    <h2>💳 Pembayaran</h2>
                    <button type="button" className="btn-close" onClick={handleCancel}><CloseIcon size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="payment-form">
                    {/* User Name Input */}
                    <div className="form-group">
                        <label htmlFor="userName">
                            <span className="label-icon">👤</span>
                            Nama Pemesan
                        </label>
                        <input
                            type="text"
                            id="userName"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            placeholder="Masukkan nama Anda"
                            className={errors.userName ? 'error' : ''}
                        />
                        {errors.userName && (
                            <span className="error-message">{errors.userName}</span>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div className="order-summary">
                        <h3><ClipboardIcon size={20} /> Ringkasan Pesanan</h3>
                        <div className="order-items">
                            {currentCart.map((item) => (
                                <div key={item.id} className="order-item">
                                    <div className="item-details">
                                        <div className="item-text">
                                            <span className="item-name">{item.name}</span>
                                            <span className="item-price">{formatPrice(item.price)} x {item.quantity}</span>
                                        </div>
                                    </div>
                                    <span className="item-subtotal">
                                        {formatPrice(item.price * item.quantity)}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="order-total">
                            <span>Total Pembayaran:</span>
                            <span className="total-amount">{formatPrice(getCartTotal())}</span>
                        </div>
                    </div>

                    {/* Payment Method Selection */}
                    <div className="form-group">
                        <label>
                            <span className="label-icon">💰</span>
                            Metode Pembayaran
                        </label>
                        <div className="payment-methods">
                            {paymentMethods.map((method) => (
                                <label
                                    key={method.id}
                                    className={`payment-method ${paymentMethod === method.id ? 'selected' : ''}`}
                                >
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value={method.id}
                                        checked={paymentMethod === method.id}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <span className="method-content">
                                        <span className="method-icon">{method.icon}</span>
                                        <span className="method-name">{method.name}</span>
                                    </span>
                                    <span className="checkmark">✓</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* QRIS QR Code Display */}
                    {paymentMethod === 'qris' && (
                        <div className="qris-display">
                            <div className="qris-header">
                                <h3>📲 Scan QR Code untuk Pembayaran</h3>
                                <p className="text-secondary">Gunakan aplikasi e-wallet atau mobile banking Anda</p>
                            </div>
                            <div className="qris-code-container">
                                <div className="qris-logo">QRIS</div>
                                <QRCodeSVG
                                    value={qrCodeValue}
                                    size={240}
                                    level="H"
                                    includeMargin={true}
                                    className="qris-code"
                                />
                                <div className="qris-amount">
                                    <span className="qris-label">Total Pembayaran</span>
                                    <span className="qris-total">{formatPrice(getCartTotal())}</span>
                                </div>
                            </div>
                            <div className="qris-info">
                                <p>✓ Scan kode QR di atas</p>
                                <p>✓ Konfirmasi pembayaran di aplikasi Anda</p>
                                <p>✓ Klik tombol "Bayar & Ambil Antrian" setelah pembayaran berhasil</p>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                            Cancelled
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            onClick={(e) => {
                                console.log('🟢 Button clicked!', e);
                                console.log('🟢 Button type:', e.currentTarget.type);
                            }}
                        >
                            Pay & Take Queue
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentForm;
