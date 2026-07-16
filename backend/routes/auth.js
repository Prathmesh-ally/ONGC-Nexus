import 'dotenv/config';
import express from 'express';
import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        const token = jsonwebtoken.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.status(200).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/register', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized: Missing token' });
        }
        
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        
        if (decoded.role !== 'MasterAdmin') {
            return res.status(403).json({ error: 'Forbidden: Requires MasterAdmin privileges' });
        }
        
        const { username, password, role } = req.body;
        
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = new User({
            username,
            password: hashedPassword,
            role: role || 'Normal'
        });
        
        await newUser.save();
        res.status(201).json({ message: 'User created successfully', user: { id: newUser._id, username: newUser.username, role: newUser.role } });
    } catch (error) {
        console.error('Registration error:', error);
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
