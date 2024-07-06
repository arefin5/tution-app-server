const User = require("../../models/User");
const fs = require("fs");
const appRoot = require("app-root-path");

const jwt = require("jsonwebtoken");
const jwt_secret = process.env.JWT_SECRET;

const { firebaseAdmin  } = require("../../utils/firebase.js");

//-----------






//------------
const loginVerify = async (req, res) => {
    let idToken = req.body.idToken;
    try {
        await firebaseAdmin.auth().verifyIdToken(idToken)
            .then(async (dec) => {
                // @ts-ignore
                const query = Number(dec.phone_number).toString();
                try {
                    var user = await User.findOne({ phone: query });
                    if (user && (user.role == "admin" || user.role == "super")) {
                        const payload = {
                            userId: user._id,
                        };
                        // @ts-ignore
                        const token = jwt.sign(payload, jwt_secret, {
                            expiresIn: 60 * 60 * 24 * 30 * 6,
                        });
                        res.status(200).json({
                            msg: 'success',
                            user: user,
                            token: token
                        });
                    } else {
                        res.status(200).json({ msg: 'Invalid user' });
                    }
                } catch (error) {
                    console.log(error)
                    res.status(200).json({ msg: 'Invalid user' });
                }
            });
    } catch (error) {
        res.status(200).json({ msg: 'Invalid token' });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.body.requesterId });
        res.send({ msg: 'success', user: user });
    } catch (error) {
        res.send({ error });
    }
};
const updateProfile = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.requesterId });
        let avatarImgPath = user.avatarImg;
        let coverImgPath = user.coverImg;
        if (req.files.avatar) {
            if (user.avatarImg.length !== 0) {
                fs.unlink(
                    appRoot +
                    "/" +
                    "public" +
                    user.avatarImg.replace("public", "").split("/").join("\\"),
                    (err) => { }
                );
            }
            avatarImgPath = req.files.avatar[0].path
                .replace("public", "")
                .split("\\")
                .join("/");
        }
        if (req.files.cover) {
            if (user.coverImg.length !== 0) {
                fs.unlink(
                    appRoot +
                    "/" +
                    "public" +
                    user.coverImg.replace("public", "").split("/").join("\\"),
                    (err) => { }
                );
            }
            coverImgPath = req.files.cover[0].path
                .replace("public", "")
                .split("\\")
                .join("/");
        }
        user.phone = req.body.phone || user.phone;
        user.email = req.body.email || user.email;
        user.name = req.body.name || user.name;
        user.age = req.body.age || user.age;
        user.gender = req.body.gender || user.gender;
        user.bio = req.body.bio || user.bio;
        user.division = req.body.division || user.division;
        user.district = req.body.district || user.district;
        user.area = req.body.area || user.area;
        user.subjects = req.body.subjects || user.subjects;
        user.class = req.body.class || user.class;
        user.institute = req.body.institute || user.institute;
        user.department = req.body.department || user.department;
        user.days = req.body.days;
        user.avatarImg = avatarImgPath;
        user.coverImg = coverImgPath;
        user.save();
        res.send({ msg: 'success', user: user });
    } catch (err) {
        console.log(err)
        res.status(500).json(err);
    }
};

module.exports = {
    loginVerify,
    getProfile,
    updateProfile,
}