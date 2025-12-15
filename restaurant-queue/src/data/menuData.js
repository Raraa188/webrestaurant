// Import images from assets
import springRollImg from '../assets/images/springroll.png';
import chickenWingsImg from '../assets/images/chickenwings.jpg';
import garlicBreadImg from '../assets/images/garlicbread.png';
import nasiGorengImg from '../assets/images/nasigorengspecial.jpg';
import beefRendangImg from '../assets/images/beefrendang.png';
import grilledSalmonImg from '../assets/images/grilledsalmon.jpg';
import chickenTeriyakiImg from '../assets/images/chickenteriyaki.png';
import spaghettiCarbonaraImg from '../assets/images/Spageticarbonara.jpeg';
import orangeJuiceImg from '../assets/images/freshorangejuice.png';
import icedCoffeeImg from '../assets/images/icedcoffee.jpg';
import mangoSmoothieImg from '../assets/images/mangosmoothies.jpg';
import mineralWaterImg from '../assets/images/mineralwater.jpg';
import chocolateLavaCakeImg from '../assets/images/chocolatelavacake.jpg';
import iceCreamSundaeImg from '../assets/images/icecreamsundae.png';
import fruitSaladImg from '../assets/images/fruitsalad.jpg';

export const menuData = [
    // Appetizers
    {
        id: 1,
        name: 'Spring Rolls',
        category: 'Appetizers',
        description: 'Crispy vegetable spring rolls with sweet chili sauce',
        price: 35000,
        image: springRollImg,
        prepTime: 2, // Medium
    },
    {
        id: 2,
        name: 'Chicken Wings',
        category: 'Appetizers',
        description: 'Spicy buffalo wings with ranch dressing',
        price: 45000,
        image: chickenWingsImg,
        prepTime: 2, // Medium
    },
    {
        id: 3,
        name: 'Garlic Bread',
        category: 'Appetizers',
        description: 'Toasted bread with garlic butter and herbs',
        price: 25000,
        image: garlicBreadImg,
        prepTime: 2, // Medium
    },

    // Main Course
    {
        id: 4,
        name: 'Nasi Goreng Special',
        category: 'Main Course',
        description: 'Indonesian fried rice with chicken, egg, and vegetables',
        price: 55000,
        image: nasiGorengImg,
        prepTime: 3, // Slow
    },
    {
        id: 5,
        name: 'Beef Rendang',
        category: 'Main Course',
        description: 'Slow-cooked beef in rich coconut curry',
        price: 75000,
        image: beefRendangImg,
        prepTime: 3, // Slow
    },
    {
        id: 6,
        name: 'Grilled Salmon',
        category: 'Main Course',
        description: 'Fresh salmon fillet with lemon butter sauce',
        price: 85000,
        image: grilledSalmonImg,
        prepTime: 3, // Slow
    },
    {
        id: 7,
        name: 'Chicken Teriyaki',
        category: 'Main Course',
        description: 'Grilled chicken with teriyaki glaze and steamed rice',
        price: 65000,
        image: chickenTeriyakiImg,
        prepTime: 3, // Slow
    },
    {
        id: 8,
        name: 'Spaghetti Carbonara',
        category: 'Main Course',
        description: 'Creamy pasta with bacon and parmesan cheese',
        price: 60000,
        image: spaghettiCarbonaraImg,
        prepTime: 3, // Slow
    },

    // Drinks
    {
        id: 9,
        name: 'Fresh Orange Juice',
        category: 'Drinks',
        description: 'Freshly squeezed orange juice',
        price: 20000,
        image: orangeJuiceImg,
        prepTime: 1, // Fast
    },
    {
        id: 10,
        name: 'Iced Coffee',
        category: 'Drinks',
        description: 'Cold brew coffee with ice',
        price: 25000,
        image: icedCoffeeImg,
        prepTime: 1, // Fast
    },
    {
        id: 11,
        name: 'Mango Smoothie',
        category: 'Drinks',
        description: 'Blended mango with yogurt and honey',
        price: 30000,
        image: mangoSmoothieImg,
        prepTime: 1, // Fast
    },
    {
        id: 12,
        name: 'Mineral Water',
        category: 'Drinks',
        description: 'Refreshing mineral water',
        price: 10000,
        image: mineralWaterImg,
        prepTime: 1, // Fast
    },

    // Desserts
    {
        id: 13,
        name: 'Chocolate Lava Cake',
        category: 'Desserts',
        description: 'Warm chocolate cake with molten center',
        price: 40000,
        image: chocolateLavaCakeImg,
        prepTime: 2, // Medium
    },
    {
        id: 14,
        name: 'Ice Cream Sundae',
        category: 'Desserts',
        description: 'Vanilla ice cream with chocolate sauce and nuts',
        price: 35000,
        image: iceCreamSundaeImg,
        prepTime: 2, // Medium
    },
    {
        id: 15,
        name: 'Fruit Salad',
        category: 'Desserts',
        description: 'Fresh seasonal fruits with honey dressing',
        price: 30000,
        image: fruitSaladImg,
        prepTime: 2, // Medium
    },
];

export const categories = ['All', 'Appetizers', 'Main Course', 'Drinks', 'Desserts'];
