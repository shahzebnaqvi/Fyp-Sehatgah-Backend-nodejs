const User = require("../models/userModel");

const Report = require("../models/ReportModel");

const uniqid = require("uniqid");
const asyncHandler = require("express-async-handler");
const { generateToken } = require("../config/jwtToken");
const validatemongoodbId = require("../utage/validateMongoId");
const { generateRefreshToken } = require("../config/refreshToken");

const crypto = require("crypto")
const jwt = require('jsonwebtoken');


// Creaate User means Registeration
const createUser = asyncHandler(async (req, res) => {
    const email = req.body.email;
    const findUser = await User.findOne({ email: email })
    if (!findUser) {
        //Create new User
        const newUser = await User.create(req.body)
        res.json(newUser)
    }
    else {
        // User is exist
        throw new Error("User already Exists")
    }
});

const loginUserCtrl = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    //check if user exist or not
    const findUser = await User.findOne({ email })
    if (findUser && await findUser.isPasswordMatched(password)) {
        const refreshToken = await generateRefreshToken(findUser?._id);
        const updateUser = await User.findByIdAndUpdate(findUser.id, {
            refreshToken: refreshToken,
        },
            { new: true }
        );
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,  // time in milliSecond 
            // 72 hours
        })
        res.json({
            _id: findUser?._id,
            firstname: findUser?.firstname,
            lastname: findUser?.lastname,
            email: findUser?.email,
            mobile: findUser?.mobile,
            token: generateToken(findUser?._id),
        })
    }
    else {
        throw new Error('Invalid Crediential')
    }
});

// doctor logIn

const logIndoctor = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    //check if user exist or not
    const finddoctor = await User.findOne({ email });
    if (finddoctor.role !== 'doctor') throw new Error('Not Authorize');
    if (finddoctor && await finddoctor.isPasswordMatched(password)) {
        const refreshToken = await generateRefreshToken(finddoctor?._id);
        const updateUser = await User.findByIdAndUpdate(finddoctor.id, {
            refreshToken: refreshToken,
        },
            { new: true }
        );
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,  // time in milliSecond 
            // 72 hours
        })
        res.json({
            _id: finddoctor?._id,
            firstname: finddoctor?.firstname,
            lastname: finddoctor?.lastname,
            email: finddoctor?.email,
            mobile: finddoctor?.mobile,
            token: generateToken(finddoctor?._id),
        });
    }
    else {
        throw new Error('Invalid Crediential')
    }
});

// GET all user
const getAllUser = asyncHandler(async (req, res) => {
    try {
        const getUsers = await User.find();
        res.json(getUsers);
    }
    catch (error) {
        throw new Error(error)
    }
})

// SInggle User
const getaUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validatemongoodbId(id);
    //console.log(id);
    try {
        const getaUser = await User.findById(id);
        res.json({
            getaUser,
        })
    }
    catch (error) {
        throw new Error(error)
    }
})

// Delete User
const deleteaUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validatemongoodbId(id);
 
    try {
        const deleteaUser = await User.findByIdAndDelete(id);
        res.json({
            deleteaUser,
        })
    }
    catch (error) {
        throw new Error(error)
    }
});
const handleRefreshToken = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    //console.log(cookie);
    if (!cookie?.refreshToken) throw new Error("No refresh token in cookies");
    console.log(cookie.refreshToken);
    const refreshToken = cookie.refreshToken
    // console.log(refreshToken);
    const user = await User.findOne({ refreshToken })
    if (!user) throw new Error("no refresh Token present in DB or not matched")
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err || user.id !== decoded.id) {
            throw new Error("there is something wrong with refresh token")
        }
        const accessToken = generateToken(user?._id);
        res.json({ accessToken })
    });
   
});
// LOgOut
const logOut = asyncHandler(async (req, res) => {

    const cookie = req.cookies;
    if (!cookie?.refreshToken) throw new Error("No refresh token in cookies");
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken })
    if (!user) {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true,
        });
        return res.sendStatus(204); // Forbiddien
    }
    await User.findOneAndUpdate(refreshToken, {
        refreshToken: "",
    });
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
    });
    return res.sendStatus(204); // Forbiddien

});

//Update a User
const updatedUser = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validatemongoodbId(_id);
    console.log(_id);
    res.json(_id)

    try {
        const updatedUser = await User.findByIdAndUpdate(_id, {
            firstname: req?.body?.firstname,
            lastname: req?.body?.lastname,
            email: req?.body?.email,
            mobile: req?.body?.mobile,
        },
            { new: true }
        );
        res.json(updatedUser)
    }
    catch (error) {
        throw new Error(error)
    }
});

// Blocked User

const blockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;  // url id
    console.log(id);
    validatemongoodbId(id);
    try {
        const block = await User.findByIdAndUpdate(id, {
            isBlocked: true,
        }, {
            new: true,
        }
        );

        res.json({
            message: `User blocked`
        })
    }
    catch (error) {
        throw new Error(error)
    }

});
//Unblocked User
const unBlockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validatemongoodbId(id);
    console.log(validatemongoodbId(id));
    try {
        const unblock = await User.findByIdAndUpdate(id, {
            isBlocked: false,
        }, {
            new: true,
        }
        );
        res.json({
            message: "User Unblocked"
        })
    }
    catch (error) {
        throw new Error(error)
    }
});

const updatePassword = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    console.log(_id);  //localhost:5000/api/user/password
    const { password } = req.body;
    console.log(password);
    validatemongoodbId(_id);
    const user = await User.findById(_id);
    if (password) {
        user.password = password;
        console.log(user.password);
        const updatedPassword = await user.save();
        console.log(updatedPassword);
        res.json(updatedPassword)
    }
    else {
        res.json(user);
    }
});

const forgotPasswordToken = asyncHandler(async (req, res) => {
    const { email } = req.body;  //  localhost:5000/api/user/forgot-password-token
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found with this Email")


    try {
        const token = await user.createPasswordResetToken();
        await user.save();
        const resetURL = `Hi , Please follow this Link to reset your password. this link is valid for 10 minutes for now.<a href='http://localhost:5000/api/user/reset-password/${token}' style="color:blue;text-align:center;">Click Here</a>`
        const data = {
            to: email,
            text: 'Hey User',
            subject: 'Forgot password link',
            htm: resetURL
        };
        sendEmail(data);
        res.json(token);
    }
    catch (error) {
        throw new Error(error)
    }

})

const resetPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const { token } = req.params;
    const hashedToken = crypto.createHash('sha256').update(token).digest("hex");
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) throw new Error(`Token expire . please try again`);
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json(user);
});


// Card Funtionality
const userReport = asyncHandler(async (req, res) => {
    const { id } = req.params;  // url user
    const { _id } = req.user; // token doctor
    validatemongoodbId(_id);
    const { generateReport } = req.body;
   
    try {
        let REPORTS = []
        const user = await User.findById(_id); //by doctor
        const real = await User.findById(id);  // by user
  const patient_Id = (real?.id);
        
        // Chexk User already have Product in Report
    //// const alreadyExistReport = await Report.findOne({patient_Id : real?.id });
     
        for (let i = 0; i < generateReport.length; i++) {
            let object = {};
           
            object.patient = generateReport[i].patient;
            object.email = generateReport[i].email;
            object.disease = generateReport[i].disease;
            REPORTS.push(object);
        }
        
        let newReport = await new Report({
            DoctorName : user?.firstname+ " " +user?.lastname,
            patient_Id,
            REPORTS,
            Doctor: user?._id,
            
        }).save();
        console.log(newReport);
        res.json(newReport);
    }
    catch (error) {
        throw new Error(error)
    }
});

const getUserReport = asyncHandler(async (req, res) => {
    const { _id } = req.user; // by user
    validatemongoodbId(_id);

    try {
        
        const getReport = await Report.find({ patient_Id : _id });
        res.json(getReport)
    }
    catch (error) {
        throw new Error(error)
    }
});

module.exports = { createUser, loginUserCtrl, logIndoctor, getAllUser, getaUser, deleteaUser, updatedUser, blockUser, unBlockUser, handleRefreshToken, logOut, updatePassword, forgotPasswordToken, resetPassword,  userReport, getUserReport };