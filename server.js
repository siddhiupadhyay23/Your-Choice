const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));
app.use(session({
    secret: 'your-choice-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 } // 1 hour
}));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/your-choice')
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// Import models
const User = require('./models/User');
const Product = require('./models/Product');
const Service = require('./models/Service');
const Order = require('./models/Order');
const Basket = require('./models/Basket');

// Import middleware
const { isAuthenticated } = require('./middleware/auth');

// Sample data initialization function
async function initializeData() {
    try {
        // Check if products already exist
        const productCount = await Product.countDocuments();
        if (productCount === 0) {
            // Sample products
            const products = [
                { name: "Apple", price: 50, category: "fruits", image: "https://5.imimg.com/data5/AK/RA/MY-68428614/apple.jpg", description: "Fresh red apples" },
                { name: "Banana", price: 30, category: "fruits", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGHPr49bv2cMFJZ0z9WfjG3dqS8Wor6ghljw&s", description: "Ripe yellow bananas" },
                { name: "Carrot", price: 40, category: "vegetables", image: "https://orgfarm.store/cdn/shop/files/carrot-bunch.png?v=1721726918&width=1214", description: "Fresh orange carrots" },
                { name: "Tomato", price: 25, category: "vegetables", image: "https://m.economictimes.com/thumb/msid-95423731,width-1200,height-900,resizemode-4,imgsize-56196/tomatoes-canva.jpg", description: "Ripe red tomatoes" },
                { name: "Milk", price: 50, category: "dairy", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdLYLrpcL-2TKZDY0eljDthboDPMytCCRgVg&s", description: "Fresh cow milk" },
                { name: "Rice", price: 60, category: "grains", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmux8yqAqpUbX6ZYbL_ElNcpLq1itEn7GuiQ&s", description: "Premium basmati rice" },
                { name: "Eggs", price: 70, category: "dairy", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfiO7agvs5Xg3uKg-u0FIahDpYwib8Fj6giA&s", description: "Farm fresh eggs" },
                { name: "Paneer", price: 80, category: "dairy", image: "https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/saqgxjo3qzaab8hdchqt", description: "Fresh cottage cheese" }
            ];
            
            await Product.insertMany(products);
            console.log('Sample products added');
        }
        
        // Check if services already exist
        const serviceCount = await Service.countDocuments();
        if (serviceCount === 0) {
            // Sample services
            const services = [
                { name: "House Cleaning", category: "maid", description: "Complete house cleaning service", price: 500, provider: "CleanHome Services", rating: 4.5 },
                { name: "Furniture Repair", category: "carpenter", description: "Repair and restore furniture", price: 800, provider: "WoodWorks", rating: 4.2 },
                { name: "Plumbing Service", category: "plumber", description: "Fix leaks and plumbing issues", price: 600, provider: "QuickFix Plumbing", rating: 4.0 },
                { name: "Electrical Repairs", category: "electrician", description: "Electrical wiring and repairs", price: 700, provider: "PowerPro Electricals", rating: 4.7 },
                { name: "Home Painting", category: "painter", description: "Interior and exterior painting", price: 5000, provider: "ColorMaster Paints", rating: 4.3 },
                { name: "General Repairs", category: "handyman", description: "General home maintenance and repairs", price: 400, provider: "FixItAll Services", rating: 4.1 },
                { name: "Garden Maintenance", category: "gardener", description: "Lawn and garden care", price: 300, provider: "GreenThumb Gardens", rating: 4.4 },
                { name: "Pest Control", category: "pestControl", description: "Eliminate pests and insects", price: 1200, provider: "BugBusters", rating: 4.6 },
                { name: "Home Nursing", category: "nurse", description: "Professional healthcare at home", price: 1000, provider: "CarePlus Nursing", rating: 4.8 }
            ];
            
            await Service.insertMany(services);
            console.log('Sample services added');
        }
    } catch (error) {
        console.error('Error initializing data:', error);
    }
}

// Authentication Routes
app.post('/api/signup', async (req, res) => {
    try {
        const { fullName, email, password, confirmPassword } = req.body;
        
        // Validate input
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Create new user
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        });
        
        await newUser.save();
        
        // Set session
        req.session.userId = newUser._id;
        
        res.status(201).json({ message: 'User registered successfully', userId: newUser._id });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // Set session
        req.session.userId = user._id;
        
        res.json({ message: 'Login successful', userId: user._id });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Could not log out' });
        }
        res.json({ message: 'Logged out successfully' });
    });
});

// User Profile Routes
app.get('/api/profile', isAuthenticated, async (req, res) => {    
    try {
        const user = await User.findById(req.session.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/auth/status', (req, res) => {
    if (req.session && req.session.userId) {
        return res.json({ isAuthenticated: true });
    }
    res.json({ isAuthenticated: false });
});

// Product Routes
app.get('/api/products', async (req, res) => {
    try {
        const { category } = req.query;
        let query = {};
        
        if (category) {
            query.category = category;
        }
        
        const products = await Product.find(query);
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Service Routes
app.get('/api/services', async (req, res) => {
    try {
        const { category } = req.query;
        let query = {};
        
        if (category) {
            query.category = category;
        }
        
        const services = await Service.find(query);
        res.json(services);
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/services/:id', async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.json(service);
    } catch (error) {
        console.error('Error fetching service:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Basket Routes
app.post('/api/baskets', isAuthenticated, async (req, res) => {
    try {
        const { name, items, frequency } = req.body;
        
        if (!name || !items || items.length === 0) {
            return res.status(400).json({ message: 'Name and items are required' });
        }
        
        const basket = new Basket({
            user: req.session.userId,
            name,
            items,
            frequency: frequency || 'weekly'
        });
        
        await basket.save();
        res.status(201).json(basket);
    } catch (error) {
        console.error('Error creating basket:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/baskets', isAuthenticated, async (req, res) => {
    try {
        const baskets = await Basket.find({ user: req.session.userId })
            .populate('items.product');
        res.json(baskets);
    } catch (error) {
        console.error('Error fetching baskets:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/baskets/:id', isAuthenticated, async (req, res) => {
    try {
        const { name, items, frequency, active } = req.body;
        const basket = await Basket.findOne({ _id: req.params.id, user: req.session.userId });
        
        if (!basket) {
            return res.status(404).json({ message: 'Basket not found' });
        }
        
        if (name) basket.name = name;
        if (items) basket.items = items;
        if (frequency) basket.frequency = frequency;
        if (active !== undefined) basket.active = active;
        
        await basket.save();
        res.json(basket);
    } catch (error) {
        console.error('Error updating basket:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Order Routes
app.post('/api/orders', isAuthenticated, async (req, res) => {
    try {
        const { items, services, totalAmount, deliveryAddress, paymentMethod } = req.body;
        
        if (!totalAmount || !deliveryAddress || !paymentMethod) {
            return res.status(400).json({ message: 'Total amount, delivery address, and payment method are required' });
        }
        
        if ((!items || items.length === 0) && (!services || services.length === 0)) {
            return res.status(400).json({ message: 'At least one item or service is required' });
        }
        
        const order = new Order({
            user: req.session.userId,
            items: items || [],
            services: services || [],
            totalAmount,
            deliveryAddress,
            paymentMethod
        });
        
        await order.save();
        res.status(201).json(order);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/orders', isAuthenticated, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.session.userId })
            .populate('items.product')
            .populate('services.service')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/orders/:id', isAuthenticated, async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, user: req.session.userId })
            .populate('items.product')
            .populate('services.service');
            
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        res.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Initialize data and start server
initializeData().then(() => {
    // Try to start the server with port handling
    const server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Open your browser and navigate to http://localhost:${PORT}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${PORT} is already in use. Trying port ${PORT + 1}...`);
            // Try the next port
            const newPort = PORT + 1;
            app.listen(newPort, () => {
                console.log(`Server running on port ${newPort}`);
                console.log(`Open your browser and navigate to http://localhost:${newPort}`);
            });
        } else {
            console.error('Server error:', err);
        }
    });
});