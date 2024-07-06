const moment = require("moment");
const User = require("../../models/User");
const fs = require("fs");
const appRoot = require("app-root-path");

const getUsers = async (req, res) => {
    const count = req.query.count
    const search = req.query.search?.toString() || ''
    const page = parseInt(req.query.page) || 1;
    const totalRecs = await User.countDocuments({
        $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },

        ],
    })
    const data = await User.find({
        $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },

        ],
    })
        .sort({ _id: -1 })
        .select(
            "name _id role email phone subEnd refs verified avatarImg status"
        ).limit(100)
        .skip(100 * (page - 1));
    const pages = ((totalRecs / count) | 0) + 1;
    if (data) {
        res.status(200).send({
            data: data,
            // data: data.slice(startIndex, endIndex) || [],
            lastPage: (page * count) >= totalRecs ? true : false,
            pages: pages,
            current: page,
        });
    } else {
        res.status(400).send({ data: "No data found" });
    }
};
const getAdmins = async (req, res) => {
    const count = req.query.count
    const search = req.query.search?.toString()
    const page = parseInt(req.query.page) || 1;
    const totalRecs = await User.countDocuments(
        {
            role: "admin",
            $or: [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },
            ],
        }
    )
    const data = await User.find({
        role: "admin",
        $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
        ],
    })
        .sort({ _id: -1 })
        .select(
            "name _id role email phone subEnd refs verified avatarImg status"
        )
        .limit(count)
        .skip(count * (page - 1));
    const pages = ((totalRecs / count) | 0) + 1;
    if (data) {
        res.status(200).send({
            data: data,
            // data: data.slice(startIndex, endIndex) || "No data found",
            lastPage: (page * count) >= totalRecs ? true : false,
            pages: pages,
            current: page,
        });
    } else {
        res.status(400).send({ data: "No data found" });
    }
};
const getMedias = async (req, res) => {
    const count = req.query.count
    const search = req.query.search?.toString()
    const page = parseInt(req.query.page) || 1;
    const totalRecs = await User.countDocuments(
        {
            role: "media",
            $or: [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },
            ],
        }
    )
    const data = await User.find({
        role: "media",
        $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
        ],
    })
        .sort({ _id: -1 })
        .select(
            "name _id role email phone subEnd refs verified avatarImg status"
        )
        .limit(count)
        .skip(count * (page - 1));
    const pages = ((totalRecs / count) | 0) + 1;
    if (data) {
        res.status(200).send({
            data: data,
            // data: data.slice(startIndex, endIndex) || "No data found",
            lastPage: (page * count) >= totalRecs ? true : false,
            pages: pages,
            current: page,
        });
    } else {
        res.status(400).send({ data: "No data found" });
    }
};
const getTutors = async (req, res) => {
    const count = req.query.count
    const search = req.query.search?.toString()
    const page = parseInt(req.query.page) || 1;
    const totalRecs = await User.countDocuments(
        {
            role: "tutor",
            $or: [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },
            ],
        }
    )
    const data = await User.find({
        role: "tutor",
        $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
        ],
    })
        .sort({ _id: -1 })
        .select(
            "name _id role email phone subEnd refs verified avatarImg status"
        )
        .limit(count)
        .skip(count * (page - 1));
    const pages = ((totalRecs / count) | 0) + 1;
    if (data) {
        res.status(200).send({
            data: data,
            // data: data.slice(startIndex, endIndex) || "No data found",
            lastPage: (page * count) >= totalRecs ? true : false,
            pages: pages,
            current: page,
        });
    } else {
        res.status(400).send({ data: "No data found" });
    }
};
const editUser = async (req, res) => {
    const updatedDate = moment(req.body.subEnd, "YYYY-MM-DD")

    try {
        const user = await User.findOne({ _id: req.params.userId });
        let avatarImgPath = user.avatarImg;
        let coverImgPath = user.coverImg;
        if (req.files.avatar) {
            if (user.avatarImg.length !== 0) {
                fs.unlink("./public" + user.avatarImg, (err) => {
                    console.log(err);
                });
            }
            avatarImgPath = req.files.avatar[0].path
                .replace("public", "")
                .split("\\")
                .join("/");
        }
        if (req.files.cover) {

            if (user.coverImg.length !== 0) {
                fs.unlink("./public" + user.coverImg, (err) => {
                    console.log(err);
                });
            }
            coverImgPath = req.files.cover[0].path
                .replace("public", "")
                .split("\\")
                .join("/");
        }
        user.phone = req.body.phone;
        user.role = req.body.userRole?.toLowerCase();
        user.email = req.body.email;
        user.name = req.body.name;
        user.age = req.body.age;
        user.gender = req.body.gender == '' ? 'male' : (req.body.gender).toLowerCase();
        user.bio = req.body.bio;
        user.subjects = req.body.subjects;
        user.class = req.body.class;
        user.institute = req.body.institute;
        user.department = req.body.department;
        user.days = req.body.days;
        user.division = req.body.division;
        user.district = req.body.district;
        user.area = req.body.area;
        user.subEnd = updatedDate.isValid() ? moment(req.body.subEnd).format('YYYY-MM-DD') : '';
        user.premiumEnd = updatedDate.isValid() ? updatedDate.valueOf() : 0;
        user.refs = Number(req.body.refs);
        user.verified = req.body.verified == '1' ? true : false;
        user.avatarImg = avatarImgPath;
        user.coverImg = coverImgPath;
        await user.save();
        res.status(200).json({ msg: 'success', user: user });
    } catch (error) {
        res.send(error);
    }

};
const deleteUser = async (req, res) => {
    const userId = req.params.userId;
    try {
        const user = await User.findOne({ _id: userId });
        if (user.avatarImg.length !== 0) {
            fs.unlink(
                appRoot +
                "/" +
                "public" +
                user.avatarImg.replace("public", "").split("/").join("\\"),
                (err) => { }
            );
        }
        if (user.coverImg.length !== 0) {
            fs.unlink(
                appRoot +
                "/" +
                "public" +
                user.coverImg.replace("public", "").split("/").join("\\"),
                (err) => { }
            );
        }
        await User.findOneAndDelete({ _id: userId });
        res.status(200).json({ msg: "success" });
    } catch (error) {
        res.status(200).json(error);
    }
};
const createUser = async (req, res) => {
    try {
        const checkUser = await User.findOne({ phone: req.body.phone })
        if (!checkUser) {
            let avatarImgPath = "";
            let coverImgPath = "";
            if (req.files.avatar !== undefined) {
                avatarImgPath = req.files.avatar[0].path
                    .replace("public", "")
                    .split("\\")
                    .join("/");
            }
            if (req.files.cover !== undefined) {
                coverImgPath = req.files.cover[0].path
                    .replace("public", "")
                    .split("\\")
                    .join("/");
            }
            const subEnd = moment(req.body.subEnd).format("YYYY-MM-DD");
            let verified = false
            if (req.body.verified == '1') {
                verified = true
            }
            const newUser = await new User({
                phone: req.body.phone,
                role: req.body.userRole,
                email: req.body.email,
                name: req.body.name,
                age: req.body.age,
                gender: (req.body.gender).toLowerCase(),
                bio: req.body.bio,
                division: req.body.division,
                district: req.body.district,
                area: req.body.area,
                subjects: req.body.subjects,
                class: req.body.class,
                institute: req.body.institute,
                department: req.body.department,
                days: req.body.days,
                subEnd: subEnd,
                refs: req.body.refs,
                verified: verified,
                avatarImg: avatarImgPath,
                coverImg: coverImgPath,
            });
            await newUser.save();
            res.status(200).json({ msg: 'success' });
        } else {
            res.status(200).json({ msg: 'User already exists [phone]' });
        }
    } catch (error) {
        res.status(500).json(error);

    }
};
const getUserData = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.userId });
        res.status(200).json({ msg: 'success', user: user });
    } catch (error) {
        res.send({ msg: 'failed' });
    }
};

module.exports = {
    editUser,
    getUsers,
    getAdmins,
    getTutors,
    getMedias,
    deleteUser,
    getUserData,
    createUser,
}