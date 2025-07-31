import { generateToken } from '../lib/utils.js';
import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
export const signup = async (req, res) => {
    const {fullName, email, password} = req.body;
    try {
        if(!fullName || !email || !password) {
            return res.status(400).json({message: 'Please fill in all fields'});
        }
        if(password.length < 6) {
            return res.status(400).json({message: 'Password must be at least 6 characters long'});
        }
        const user = await User.findOne({email});
        if(user) {
            return res.status(400).json({message: 'User already exists with this email'});
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt); 
        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
        });
        if(newUser) {
            generateToken(newUser._id,res);
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
            });
        }
        else{
            res.status(400).json({message: 'Invalid user data'});
        }

    } catch (error) {
        console.log('Error in signup: ',error.message);
        res.status(500).json({message: 'Server Error'});
    }
};

export const logout =async (req, res) => {
    try {
        res.cookie('jwt','',{maxAge: 0});
        res.status(200).json({message: 'Logged out successfullyyyyyy'});
    } catch (error) {
        console.log('Error in logout: ',error.message);
        res.status(500).json({message: 'Server Error'});
    }
};

export const login =async (req, res) => {
    const {email,password} = req.body;
    try {
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message: 'Invalid credentials'});
        }
        
        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(400).json({message: 'Invalid credentials'});
        }
        generateToken(user._id,res);
        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            usertype: user.usertype,
            city: user.city,
            state: user.state,
            date: user.createdAt ? user.createdAt.toISOString() : null, // Ensure it's properly formatted
        });
        
    } catch (error) {
        console.log('Error in login: ',error.message);
        res.status(500).json({message: 'Server Error'});
    }
};


export const checkAuth =  (req,res) => {
    try {
       res.status(200).json(req.user); 
    } catch (error) {
        console.log('Error in checkAuth: ',error.message);
        res.status(500).json({message: 'Server Error'});
    }
};

export const changePassword = async (req, res) => {
    const {oldPassword, newPassword} = req.body;
    try {
        if(!oldPassword || !newPassword) {
            return res.status(400).json({message: 'Please fill in all fields'});
        }
        if(newPassword.length < 6) {
            return res.status(400).json({message: 'New password must be at least 6 characters long'});
        }
        const user = await User.findById(req.user._id);
        if(!user) {
            return res.status(404).json({message: 'User not found'});
        }
        
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        
        if(!isMatch) {
            return res.status(400).json({message: 'Current password is incorrect'});
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        res.status(200).json({success: 'Password changed successfully'});
    } catch (error) {
        console.log('Error in changePassword: ',error.message);
        res.status(500).json({message: 'Server Error'});
    }
}
