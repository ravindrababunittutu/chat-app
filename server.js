const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
const bcrypt = require('bcrypt'); // Ensure bcrypt is imported
const { sequelize, Message, User } = require('./database');
require('./passport-config'); // Import passport configuration

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware for parsing request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Parse JSON bodies

// Session and Passport setup
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to check if user is authenticated
const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
};

// Define routes for the homepage and other pages
app.get('/', ensureAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
}));

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).send('Username already taken.');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ username, password: hashedPassword });
        res.redirect('/login');
    } catch (err) {
        console.error('Error registering user:', err); // Log the error details
        res.status(500).send('Error registering user.');
    }
});

// Listen for new socket connections
io.on('connection', async (socket) => {
    console.log('A user connected');

    // Load existing messages from the database
    const messages = await Message.findAll({ order: [['createdAt', 'ASC']] });
    socket.emit('load messages', messages);

    // Listen for chat messages from clients
    socket.on('chat message', async (msg) => {
        // Check if the user is authenticated
        const user = socket.request.user;
        if (user) {
            // Save the message to the database
            const message = await Message.create({ text: `${user.username}: ${msg}` });

            // Broadcast the message to all clients
            io.emit('chat message', message);
        }
    });

    // Handle user disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Start the server on port 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
