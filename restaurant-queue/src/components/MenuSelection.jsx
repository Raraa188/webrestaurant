import { useState } from 'react';
import { useQueue } from '../context/QueueContext';
import { menuData, categories } from '../data/menuData';
import PaymentForm from './PaymentForm';
import { CartIcon, CloseIcon } from './Icons';
import './MenuSelection.css';

const MenuSelection = ({ onOrderSubmitted }) => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showCart, setShowCart] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const { currentCart, addToCart, removeFromCart, getCartTotal, getCartItemCount } = useQueue();

    const filteredMenu = selectedCategory === 'All'
        ? menuData
        : menuData.filter(item => item.category === selectedCategory);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    // Debug: Log cart changes
    console.log('Current Cart:', currentCart);
    console.log('Cart Item Count:', getCartItemCount());


    const handleCheckout = () => {
        setShowCart(false);
        setShowPayment(true);
    };

    const handlePaymentComplete = (queueNumber) => {
        setShowPayment(false);
        onOrderSubmitted(queueNumber);
    };

    const handlePaymentCancel = () => {
        setShowPayment(false);
        setShowCart(true);
    };

    return (
        <div className="menu-selection">
            <header className="menu-header">
                <div className="container">
                    <div className="header-content">
                        <div>
                            <h1>Restoran Kita</h1>
                            <p className="text-secondary">Pilih menu favorit Anda dan dapatkan nomor antrian</p>
                        </div>
                        <button
                            className="btn btn-primary cart-toggle"
                            onClick={() => setShowCart(!showCart)}
                        >
                            <CartIcon size={18} /> Keranjang ({getCartItemCount()})
                        </button>
                    </div>
                </div>
            </header>

            <div className="container">
                {/* Category Filter */}
                <div className="category-filter">
                    {categories.map((category) => (
                        <button
                            key={category}
                            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Menu Grid */}
                <div className="menu-grid">
                    {filteredMenu.map((item) => (
                        <div key={item.id} className="menu-item card fade-in">
                            <div className="menu-item-image">
                                <img src={item.image} alt={item.name} className="food-image" />
                            </div>
                            <div className="menu-item-content">
                                <h3>{item.name}</h3>
                                <p className="text-secondary">{item.description}</p>
                                <div className="menu-item-footer">
                                    <span className="price">{formatPrice(item.price)}</span>
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => addToCart(item)}
                                    >
                                        + Tambah
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Shopping Cart Sidebar */}
            <div className={`cart-sidebar ${showCart ? 'open' : ''}`}>
                <div className="cart-header">
                    <h2><CartIcon size={24} /> Keranjang ({currentCart.length})</h2>
                    <button
                        className="btn-close"
                        onClick={() => setShowCart(false)}
                    >
                        <CloseIcon size={20} />
                    </button>
                </div>

                <div className="cart-content">
                    {!currentCart || currentCart.length === 0 ? (
                        <div className="cart-empty">
                            <p className="text-muted">Keranjang masih kosong</p>
                        </div>
                    ) : (
                        <>
                            <div className="cart-items">
                                {currentCart.map((item) => (
                                    <div key={item.id} className="cart-item">
                                        <div className="cart-item-info">
                                            <img src={item.image} alt={item.name} className="cart-item-image" />
                                            <div>
                                                <h4>{item.name}</h4>
                                                <p className="text-secondary">{formatPrice(item.price)}</p>
                                            </div>
                                        </div>
                                        <div className="cart-item-controls">
                                            <button
                                                className="btn-icon btn-secondary"
                                                onClick={() => removeFromCart(item.id)}
                                            >
                                                −
                                            </button>
                                            <span className="quantity">{item.quantity}</span>
                                            <button
                                                className="btn-icon btn-secondary"
                                                onClick={() => addToCart(item)}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="cart-footer">
                                <div className="cart-total">
                                    <span>Total:</span>
                                    <span className="total-price">{formatPrice(getCartTotal())}</span>
                                </div>
                                <button
                                    className="btn btn-primary btn-checkout"
                                    onClick={handleCheckout}
                                >
                                    Lanjut ke Pembayaran
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Overlay */}
            {showCart && <div className="overlay" onClick={() => setShowCart(false)}></div>}

            {/* Payment Form Modal */}
            {showPayment && (
                <PaymentForm
                    onPaymentComplete={handlePaymentComplete}
                    onCancel={handlePaymentCancel}
                />
            )}
        </div>
    );
};

export default MenuSelection;
