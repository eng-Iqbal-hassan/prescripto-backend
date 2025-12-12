import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import jwt from "jsonwebtoken"
import appointmentModel from "../models/appointmentModel.js";

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
        

    } catch(error) {
        console.log(error);
        res.json({success: false, message: error.message})
    }
}

//API for Admin login

const loginAdmin = async(req,res) => {
    try {
        const {email, password} = req.body;
        if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email+password,process.env.JWT_SECRET)
            res.json({success: true, token})
        } else {
          return res.json({success: false, message: "Invalid Credentials"})
        }
    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message})
    }
}

// API to get All doctors list for admin pannel
const allDoctors = async (req,res) => {
    try {
        const doctors = await doctorModel.find({}).select('-password')
        res.json({success:true, doctors});
    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message})
    }
}

// API to get all Appointment List

const appointmentsAdmin = async(req,res) => {
    try {
        const appointments = await appointmentModel.find({});
        res.json({success: true, appointments})
    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message})
    }
}

// API to cancel appointment

const appointmentCancel = async (req,res) => {
    try {
        const {appointmentId} = req.body;
        // We will get the userId from authUser Middelware and appointmentId from request body

        // After that we will get the appointment data using this appointment id

        const appointmentData = await appointmentModel.findById(appointmentId);


        await appointmentModel.findByIdAndUpdate(appointmentId, {cancelled: true})

        // After that if the appointment cancelled is true then this slot time will be available
        // so we have to make the change in doctor slot_booked object
        // Releasing doctor slot

        const {docId, slotDate, slotTime} = appointmentData;

        const doctorData = await doctorModel.findById(docId);

        let slots_booked = doctorData.slots_booked;

        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime);

        // Here we are matching the slotTime in our slots_Booked object with the provided slotTime and then remove that time from this object,
        
        await doctorModel.findByIdAndUpdate(docId,{slots_booked})
        
        // After that we have updated our doctor and In this way, we have released doctor slot

        res.json({success: true, message: "appointment is cancelled"})



    } catch (error) {
       console.log(error);
       res.json({success: false, message: error.message}) 
    }
} 


export {addDoctor,loginAdmin, allDoctors, appointmentsAdmin, appointmentCancel}; // named export
// controllers will be given named export.