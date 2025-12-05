import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";

// API for adding doctor


const addDoctor = async(req, res) => {
    try {
        // Admin will add the doctor in the frontend and when he will add the doctor then from body the fields which will API get(basically it is the request of POST(sending data to API)) will be the fields which we have made in mongoose model
        const { name, email, password, speciality, degree, experience, about, fees, address } = req.body;
        // This is the form data and here we have added the multer middleware for image which will give the image to the API as well. 
        const imageFile = req.file;
        console.log("Uploaded File:", imageFile);

        //Checking for all data to add doctor

        if(!name || !email || !password || !speciality || !degree || !experience || !about || !fees || !address) {
            return res.json({success:false,message:"Missing Details"})
        }

        //Validating email address
        if(!validator.isEmail(email)) {
            return res.json({success: false, message: "Please Enter a valid email"})
        }

        //Validating strong password
        if(password.length < 8) {
            return res.json({success: false, message: "Please enter a strong password"})
        }

        // hashing doctor password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // upload image to cloudinary
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {resource_type: "image"})
        const imageUrl = imageUpload.secure_url;


        // Modified object to store in database

        const doctorData = {
            name,
            email,
            image: imageUrl,
            password: hashedPassword,
            speciality,
            degree,
            experience,
            about,
            fees,
            address: JSON.parse(address),
            date: Date.now()
        }

        const newDoctor = new doctorModel(doctorData);
        await newDoctor.save();

        res.json({success: true, message: "doctor is added"})
        

    } catch(err) {
        console.log(err);
        res.json({success: false, message: err.message})
    }
}

export {addDoctor}; // named export
// controllers will be given named export.