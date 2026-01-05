import { supabase } from '../config/supabase';

/**
 * Save completed order to Supabase database
 * @param {Object} order - Order object with queueNumber, userName, items, etc.
 * @returns {Promise<Object|null>} Saved order data or null if error
 */
export const saveOrderToDatabase = async (order) => {
    try {
        // Calculate total amount
        const totalAmount = order.items.reduce(
            (sum, item) => sum + (item.price * item.quantity),
            0
        );

        const { data, error } = await supabase
            .from('order_history')
            .insert([{
                queue_number: order.queueNumber,
                user_name: order.userName,
                items: order.items,
                status: order.status,
                payment_method: order.paymentMethod,
                total_amount: totalAmount,
                skip_count: order.skipCount || 0,
                timestamp: order.timestamp,
                completed_at: new Date().toISOString()
            }])
            .select();

        if (error) {
            console.error('Error saving to database:', error);
            return null;
        }

        console.log('Order saved to database:', data[0]);
        return data[0];
    } catch (err) {
        console.error('Exception saving to database:', err);
        return null;
    }
};

/**
 * Get all order history from database
 * @returns {Promise<Array>} Array of order history
 */
export const getOrderHistory = async () => {
    try {
        const { data, error } = await supabase
            .from('order_history')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching order history:', error);
            return [];
        }

        // Transform database format to app format
        return data.map(row => ({
            queueNumber: row.queue_number,
            userName: row.user_name,
            items: row.items,
            status: row.status,
            paymentMethod: row.payment_method,
            skipCount: row.skip_count,
            timestamp: row.timestamp,
            completedAt: row.completed_at
        }));
    } catch (err) {
        console.error('Exception fetching order history:', err);
        return [];
    }
};

/**
 * Clear all order history from database
 * @returns {Promise<boolean>} True if successful, false otherwise
 */
export const clearOrderHistory = async () => {
    try {
        const { error } = await supabase
            .from('order_history')
            .delete()
            .neq('id', 0); // Delete all rows

        if (error) {
            console.error('Error clearing order history:', error);
            return false;
        }

        console.log('Order history cleared from database');
        return true;
    } catch (err) {
        console.error('Exception clearing order history:', err);
        return false;
    }
};
