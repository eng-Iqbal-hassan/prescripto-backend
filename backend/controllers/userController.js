// In this controller, we will create the logic for user like login, register, get Profile, update profile, logout, book appointment, displaying the user appointments and acancelling the booked appointments along with payment gateway as well. 

import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";

// API to register user (Sign Up a User). 

const registerUser = async (req,res) => {
    try {
        const {name, email, password} = req.body;
        if(!name || !email || !password) {
            return res.json({success: false, message:"Missing Fields"})
        }

        // validating email format 
        if(!validator.isEmail(email)) {
            return res.json({success: false, message:"Enter a valid email"})
        }

        // Check if the user already exists

        const existingUser = await userModel.findOne({email})
        if(existingUser) {
            return res.json({success: false, message:"User already exists"})
        }
        // Duplicate email will not be added without this validation because I have added unique true property in model, but this check has been made to give the clear message.

        // Validating strong password
        if(password.length < 8) {
            return res.json({success: false, message:"Enter a strong password"})
        }

        // Hashing user password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const userData = {
            name,
            email,
            password: hashedPassword
        }

        const newUser = new userModel(userData);
        const user = await newUser.save();

        // Now the user is saved and this user has _id property and using this _id property, we will generate the accessToken and then the user will login again in the site. 

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET);

        res.json({success: true, token});


    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message})
    }


}

const loginUser = async (req,res) => {
    try {
        const {email, password} = req.body;
        const user = await userModel.findOne({email})
        // Validation --> If user does not exist
        if(!user) {
            return res.json({success: false, message:"User does not exist"})
        }
        // Compare the password and saved password

        const isMatch = await bcrypt.compare(password, user.password)

        if(isMatch) {
            const token = jwt.sign({id:user._id}, process.env.JWT_SECRET)
            return res.json({success: true, token})
        } else {
            return res.json({success: false, message:"Invalid Credentials"})
        }

    } catch (error) {
        console.log(error)
        return res.json({success: false, message: error.message})
    }
}

export {registerUser,loginUser};