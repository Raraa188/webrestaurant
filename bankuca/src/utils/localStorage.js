// localStorage utility functions for Restaurant Queue System

const STORAGE_KEYS = {
    QUEUE_LIST: 'restaurant_queue_list',
    QUEUE_COUNTER: 'restaurant_queue_counter',
    ORDER_HISTORY: 'restaurant_order_history',
};

/**
 * Save queue list to localStorage
 * @param {Array} queueList - Array of queue orders
 */
export const saveQueueList = (queueList) => {
    try {
        localStorage.setItem(STORAGE_KEYS.QUEUE_LIST, JSON.stringify(queueList));
        console.log('Queue list saved to localStorage:', queueList);
    } catch (error) {
        console.error('Error saving queue list:', error);
    }
};

/**
 * Load queue list from localStorage
 * @returns {Array} Queue list or empty array if not found
 */
export const loadQueueList = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.QUEUE_LIST);
        const queueList = data ? JSON.parse(data) : [];
        console.log('Queue list loaded from localStorage:', queueList);
        return queueList;
    } catch (error) {
        console.error('Error loading queue list:', error);
        return [];
    }
};

/**
 * Save queue counter to localStorage
 * @param {number} counter - Current queue counter
 */
export const saveQueueCounter = (counter) => {
    try {
        localStorage.setItem(STORAGE_KEYS.QUEUE_COUNTER, counter.toString());
        console.log('Queue counter saved:', counter);
    } catch (error) {
        console.error('Error saving queue counter:', error);
    }
};

/**
 * Load queue counter from localStorage
 * @returns {number} Queue counter or 1 if not found
 */
export const loadQueueCounter = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.QUEUE_COUNTER);
        const counter = data ? parseInt(data, 10) : 1;
        console.log('Queue counter loaded:', counter);
        return counter;
    } catch (error) {
        console.error('Error loading queue counter:', error);
        return 1;
    }
};

/**
 * Save order to history
 * @param {Object} order - Completed order object
 */
export const saveToOrderHistory = (order) => {
    try {
        const history = loadOrderHistory();

        // Check if order already exists in history (prevent duplicates)
        const exists = history.some(h => h.queueNumber === order.queueNumber);
        if (exists) {
            console.log('Order already in history, skipping:', order.queueNumber);
            return;
        }

        const updatedHistory = [...history, { ...order, completedAt: new Date().toISOString() }];
        localStorage.setItem(STORAGE_KEYS.ORDER_HISTORY, JSON.stringify(updatedHistory));
        console.log('Order saved to history:', order);
    } catch (error) {
        console.error('Error saving to order history:', error);
    }
};

/**
 * Load order history from localStorage
 * @returns {Array} Order history or empty array if not found
 */
export const loadOrderHistory = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.ORDER_HISTORY);
        const history = data ? JSON.parse(data) : [];
        console.log('Order history loaded:', history.length, 'orders');
        return history;
    } catch (error) {
        console.error('Error loading order history:', error);
        return [];
    }
};

/**
 * Clear all queue data (for testing/reset)
 */
export const clearQueueData = () => {
    try {
        localStorage.removeItem(STORAGE_KEYS.QUEUE_LIST);
        localStorage.removeItem(STORAGE_KEYS.QUEUE_COUNTER);
        console.log('Queue data cleared');
    } catch (error) {
        console.error('Error clearing queue data:', error);
    }
};

/**
 * Clear order history
 */
export const clearOrderHistory = () => {
    try {
        localStorage.removeItem(STORAGE_KEYS.ORDER_HISTORY);
        console.log('Order history cleared');
    } catch (error) {
        console.error('Error clearing order history:', error);
    }
};

/**
 * Clear all data (queue + history)
 */
export const clearAllData = () => {
    try {
        clearQueueData();
        clearOrderHistory();
        console.log('All data cleared');
    } catch (error) {
        console.error('Error clearing all data:', error);
    }
};

/**
 * Export all data as JSON
 * @returns {Object} All stored data
 */
export const exportData = () => {
    return {
        queueList: loadQueueList(),
        queueCounter: loadQueueCounter(),
        orderHistory: loadOrderHistory(),
        exportedAt: new Date().toISOString(),
    };
};

/**
 * Import data from JSON
 * @param {Object} data - Data to import
 */
export const importData = (data) => {
    try {
        if (data.queueList) {
            saveQueueList(data.queueList);
        }
        if (data.queueCounter) {
            saveQueueCounter(data.queueCounter);
        }
        if (data.orderHistory) {
            localStorage.setItem(STORAGE_KEYS.ORDER_HISTORY, JSON.stringify(data.orderHistory));
        }
        console.log('Data imported successfully');
    } catch (error) {
        console.error('Error importing data:', error);
    }
};
