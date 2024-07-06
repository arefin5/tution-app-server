const Post = require("../../models/Post");
const { sendToSpecificUsers } = require("../FCMModule");
const Notification = require("../../models/Notification");
const User = require("../../models/User");

const createPost = async (req, res) => {
  const newPost = await new Post({
    userID: req.body.requesterId,
    class: req.body.class,
    days: req.body.days,
    desc: req.body.desc,
    lang: req.body.lang,
    salary: req.body.negotiable == true ? 0 : Number(req.body.salary),
    subjects: req.body.subjects,
    division: req.body.division,
    district: req.body.district,
    area: req.body.area,
    showPhone: req.body.showPhone,
    type: req.body.requesterRole == 'media' ? 'media' : 'user',
    lan: req.body.lan,
    lon: req.body.lon,
    gender: req.body.gender,
    negotiable: req.body.negotiable,
    approved: false,
  });
  await newPost.save();
  res.redirect(`/post/${newPost._id}`);
};
const editPost = async (req, res) => {
  const count = 100
  const search = req.query.search?.toString() || ''
  const page = parseInt(req.query.page) || 1;
  const postId = req.params.postId;
  try {
    const post = await Post.findOne({ _id: postId });
    post.class = req.body.class;
    post.days = req.body.days;
    post.lang = req.body.lang;
    post.salary = Number(req.body.salary);
    post.subjects = req.body.subjects;
    post.division = req.body.division;
    post.district = req.body.district;
    post.area = req.body.area;
    post.desc = req.body.desc;
    post.createdAt = Date.now();
    post.gender = req.body.gender;
    post.save();
    res.status(200).json({ msg: 'success' })
  } catch (error) {
    res.render("404");
  }
};
const getPosts = async (req, res) => {
  const count = 100
  const search = req.query.search?.toString() || ''
  const page = parseInt(req.query.page) || 1;
  try {
    const totalRecs = await Post.countDocuments({
      $or: [
        { desc: { $regex: search, $options: "i" } },
        { subjects: { $regex: search, $options: "i" } },
        { lang: { $regex: search, $options: "i" } },

      ],
    })
    const posts = await Post.find({
      $or: [
        { desc: { $regex: search, $options: "i" } },
        { subjects: { $regex: search, $options: "i" } },
        { lang: { $regex: search, $options: "i" } },

      ],
    })
      .sort({ _id: -1 })
      .select(
        "days _id subjects approved class type desc lang  "
      )

      .limit(100)
      .skip(100 * (page - 1))
      .populate(
        "userID",
        "avatarImg name phone "
      );
    const pages = ((totalRecs / count) | 0) + 1;
    res.status(200).json({
      data: posts,
      lastPage: (page * count) >= totalRecs ? true : false,
      pages: pages,
      current: page,
    });
  } catch (error) {
    res.status(400).json({
      data: [],
      lastPage: true,
      pages: 1,
      current: 1,
    });
  }
};
const getPendingPosts = async (req, res) => {
  const count = 100
  const search = req.query.search?.toString() || ''
  const page = parseInt(req.query.page) || 1;
  try {
    const totalRecs = await Post.countDocuments({
      approved: false,
      $or: [
        { desc: { $regex: search, $options: "i" } },
        { subjects: { $regex: search, $options: "i" } },
        { lang: { $regex: search, $options: "i" } },

      ],
    })
    const posts = await Post.find({
      approved: false,
      $or: [
        { desc: { $regex: search, $options: "i" } },
        { subjects: { $regex: search, $options: "i" } },
        { lang: { $regex: search, $options: "i" } },

      ],
    })
      .sort({ _id: -1 })
      .select(
        "days _id subjects approved class type desc lang  "
      ).limit(100)
      .skip(100 * (page - 1))
      .populate(
        "userID",
        "avatarImg name phone "
      );
    const pages = ((totalRecs / count) | 0) + 1;
    res.status(200).json({
      data: posts,
      lastPage: (page * count) >= totalRecs ? true : false,
      pages: pages,
      current: page,
    });
  } catch (error) {
    res.status(400).json({
      data: [],
      lastPage: true,
      pages: 1,
      current: 1,
    });
  }
};

const deletePost = async (req, res) => {
  const postId = req.params.postId;
  try {
    await Post.findOneAndDelete({ _id: postId });
    res.redirect("/posts");
  } catch (error) {
    res.render("404");
  }
};



const postDetails = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.postId }).populate(
      "userID",
      "avatarImg name phone role"
    );
    if (post) {
      res.status(200).json({ post: post });
    } else {
      res.status(400).json("404");
    }
  } catch (error) {
    res.send("404");
  }
};
const approvePost = async (req, res) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findOne({ _id: postId });
    post.class = req.body.class;
    post.days = req.body.days;
    post.lang = req.body.lang;
    post.salary = Number(req.body.salary);
    post.subjects = req.body.subjects;
    post.division = req.body.division;
    post.district = req.body.district;
    post.area = req.body.area;
    post.desc = req.body.desc;
    post.gender = req.body.gender;
    post.createdAt = Date.now();
    post.approved = true;
    post.save();
    res.status(200).json({ msg: 'success' });
    const match = (post.division !== '' && post.district !== '' && post.area !== '') ?
      {
        role: "tutor",
        division: post.division,
        district: post.district,
        areas: { $in: [post.area] },
      } : (post.division !== '' && post.district !== '') ?
        {
          role: "tutor",
          division: post.division,
          district: post.district,
        } : (post.division !== '') ?
          {
            role: "tutor",
            division: post.division,
          } :
          {
            role: "tutor",
          }

    try {
      const usersArray = await User.find(match).select('_id');
      const notifyTo = usersArray.map((a) => a._id);
      const notification = await new Notification({
        title: post.desc,
        author: req.body.userId,
        postId: post._id,
        to: notifyTo,
      });
      notification.save();
      const notifyToFCM = usersArray.map((a) => a._id.toString());
      const s = await sendToSpecificUsers(
        notifyToFCM,
        post,
        "Post",
        "New post",
        req.body.desc
      );
      console.log(notifyTo)
    } catch (error) {console.log(error)} 
  } catch (error) {
    console.log(error)
    res.status(404).json("404");
  }
};

module.exports = {
  createPost,
  editPost,
  getPosts,
  getPendingPosts,
  postDetails,
  approvePost,
  deletePost,
}