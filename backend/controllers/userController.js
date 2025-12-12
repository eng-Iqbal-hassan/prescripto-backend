// In this controller, we will create the logic for user like login, register, get Profile, update profile, logout, book appointment, displaying the user appointments and acancelling the booked appointments along with payment gateway as well. 

import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import jwt from "jsonwebtoken";
import {v2 as cloudinary} from "cloudinary";
import razorpay from "razorpay";

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

// API to get user profile data

const getProfile = async (req,res) => {
    try {
        const { userId } = req.body;
        // User will not send the id but he will send the token from frontend and by using that token, we will get the user in our controller
        // Now to change the header into userId, we will use a middleware 
        const userData = await userModel.findById(userId).select('-password')
        res.json({success:true,userData})
    } catch (error) {
        console.log(error)
        return res.json({success: false, message: error.message})
    }

}

// API to update user profile 

const updateProfile = async (req,res) => {
    try {
        const {userId,name,phone, address, dob, gender} = req.body;
        const imageFile = req.file;
        if(!name || !phone || !address || !dob || !gender) {
            return res.json({success: false, message: "Missing Fields"})
        }
        await userModel.findByIdAndUpdate(userId,{name,phone,address:JSON.parse(address), dob, gender})

        if(imageFile) {
            // We will save the image in cloudinary and will update the path in user data
            // Upload image to cloudinary

            const uploadImage = await cloudinary.uploader.upload(imageFile.path,{resource_type: "image"});
            const imageURL = uploadImage.secure_url;
            await userModel.findByIdAndUpdate(userId,{image:imageURL})
        }
        return res.json({success: true, message: "Profile is updated"})
    } catch (error) {
        console.log(error);
        return res.json({success:false, message:error.message})
    }
}

// API to Book Appointment

const bookAppointment = async (req,res) => {
    try {
        const { userId, docId, slotDate, slotTime } = req.body;
    
        const docData = await doctorModel.findById(docId).select("-password");
    
        if(!docData.available) {
            return res.json({success: false, message: "Doctor is not available"})
        }
    
        let slots_booked = docData.slots_booked; // This will give us the all slots of doctor
    
        // checking for slots availabiliity
        if(slots_booked[slotDate]) {
            if(slots_booked[slotDate].includes(slotTime)) {
                return res.json({success: false, message: "slot is not available"})
            } else {
                slots_booked[slotDate].push(slotTime)
            }
        } else {
            slots_booked[slotDate] = [];
            slots_booked[slotDate].push(slotTime)
        }
    
        const userData = await userModel.findById(userId).select('-password')
    
        delete docData.slots_booked;
        // We are removing this from doctor data, The reason is taht when we save the docData in appointmentData object, we do not want extra information
    
        const appointmentData = {
            userId,
            docId, 
            userData,
            docData, // and here we have deleted the slots_booked property 
            slotTime,
            slotDate,
            amount: docData.fees, 
            date: Date.now(),
        }
    
        const newAppointment = new appointmentModel(appointmentData);
        newAppointment.save();

        // save new slots data in doctor data back

        await doctorModel.findByIdAndUpdate(docId,{slots_booked})

        return res.json({success: true, message: "Appointment Booked"})
    } catch (error) {
        console.log(error)
        return res.json({success: false, message: error.message})
    }

}

// API to get user appoingtments 

const listAppointments = async (req,res) => {
    try {
        const {userId} = req.body;
        const appointments = await appointmentModel.find({userId});
        res.json({success: true, appointments})
    } catch (error) {
        console.log(error)
        return res.json({success: false, message: error.message})
    }
}

// API to cancel appointment

const cancelAppointment = async (req,res) => {
    try {
        const {userId, appointmentId} = req.body;
        // We will get the userId from authUser Middelware and appointmentId from request body

        // After that we will get the appointment data using this appointment id

        const appointmentData = await appointmentModel.findById(appointmentId);

        // Verify appointment user

        if(appointmentData.userId !== userId) {
            return res.json({success: false, message: "Unauthorized action"})
        }

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

// Online payment method --> we are going to use razor pay as online payment gateway. 

// For it we install the package razorpay 

// API to make payment of appointment using razorpay

// initialize the razor pay instance
 
const razorpayInstance = new razorpay({
    key_id:process.env.RAZORPAY_KEY_ID,
    key_secret:process.env.RAZORPAY_KEY_SECRET 
})

const paymentRazorpay = async (req,res) => {
    try {
        const { appointmentId } = req.body;
        const appointmentData = await appointmentModel.findById(appointmentId);
        if(!appointmentData || appointmentData.cancelled) {
            return res.json({success: true, message: "Appointment Not Found or Cancelled"})
        }
    
        // Creating options for razor-pay payments
        const options = {
            amount: appointmentData.amount * 100,
            currency: process.env.CURRENCY,
            receipt: appointmentId
        } // By using these options we will create the order on razorpay
    
        const order = await razorpayInstance.orders.create(options);
    
        res.json({success: true, order})
    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message}) 
    }

}

// API to verify the payment of razorpay

const verifyRazorpay = async (req,res) => {
    try {
        const {razorpay_order_id} = req.body;
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

        console.log(orderInfo);
        // Here,When the payment is made, in console we get the status paid and we also have the receipt which we have created using appointment Id in above controller so using these two things we can change the property payment true. 
        if(orderInfo.status === "paid") {
            await appointmentModel.findByIdAndUpdate(orderInfo.receipt,{payment: true});
            res.json({success: true, message: "Payment Successful"})
        } else {
            res.json({success: false, message: "Payment failed"})
        }

    } catch (error) {
        console.log(error);
        res.json({success: false, message: error.message}) 
    }
}

// After these things, we will move to the adminController where we will create the API to show the appointments of all users in admin panel. 


export {registerUser,loginUser,getProfile, updateProfile, bookAppointment, listAppointments, cancelAppointment, paymentRazorpay, verifyRazorpay};