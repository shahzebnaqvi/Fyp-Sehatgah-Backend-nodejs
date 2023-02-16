const express = require("express");
const { createUser, loginUserCtrl, logIndoctor, getAllUser, getaUser, deleteaUser, updatedUser, blockUser, unBlockUser, handleRefreshToken, logOut, updatePassword, forgotPasswordToken, resetPassword, userReport, getUserReport } = require("../controllers/userController");
const { authMiddleware, isdoctor } = require("../middlewares/authMiddleware")
const router = express.Router();


router.post("/register", createUser);
router.post("/forgot-password-token", forgotPasswordToken)
router.post("/reset-password/:token", resetPassword)

router.put("/password", authMiddleware, updatePassword)
router.post("/login", loginUserCtrl);
router.post("/login-doctor", logIndoctor);
router.post("/report/:id", authMiddleware,isdoctor, userReport);
router.get("/report", authMiddleware, getUserReport);


router.get("/all-users", getAllUser);
router.get("/refreshToken", handleRefreshToken);
router.get("/logout", logOut);
router.get("/:id", authMiddleware, isdoctor, getaUser);


router.delete("/:id", deleteaUser);
router.put("/edit", authMiddleware, updatedUser);

router.put("/block/:id", authMiddleware, isdoctor ,blockUser);
router.put("/unblock/:id", authMiddleware, isdoctor, unBlockUser);

module.exports = router;