const Notification = require("../models/Notification");
const Post = require("../models/Post");
const Rating = require("../models/Rating");
const Report = require("../models/Report");
const User = require("../models/User");
const Comment = require("../models/Comment");
//-----------------
const getPosts = async (req, res) => {
  const { div, dis, upo, search, min, max, gender, areas, lang = '' } = req.query;
  const searchString = search.toString();
  const Model = Post;

  const query = {
    salary: { $gte: Number(min) - 1 || 0, $lt: Number(max) + 1 || 9999999 },
    approved: true,
    gender: { $regex: gender == "all" ? "" : gender || "", $options: "i" },
    $or: [{
      desc: { $regex: searchString, $options: "i" },
      lang: { $regex: lang, $options: "i" },

    }],
  }
  if (div.length !== 0) {
    query.division = div;
  }
  if (dis.length !== 0) {
    query.district = dis;
  }
  if (upo && upo?.length !== 0) {
    query.area = upo
  };
  if (areas && areas?.length !== 0) {
    query.area = { $in: areas?.split(",") };
  }

  const page = parseInt(req.query.page) || 1;
  const posts = await Post.aggregate([
    {
      $match: query
    },

    {
      $sort: { createdAt: -1 }
    },
    {
      $skip: (page - 1) * 33
    },
    {
      $limit: 33
    },
  ]);
  const totalDocs = await Model.countDocuments(query);
  const pages = Math.ceil(totalDocs / 33)
  if (page) {
    res.status(200).send({
      data: posts,
      lastPage: page * 33 >= posts.length ? true : false,
      pages: pages,
      current: page,
    });
  } else {
    res.status(400).send({ data: "No data found" });
  }
};
const getPostsMyLoc = async (req, res) => {
  const { min, max, gender } = req.query;
  const user = await User.findOne({ _id: req.body.requesterId });
  const searchString = req.query.search.toString();
  const Model = Post;
  let data;
  if (
    user.division.length !== 0 &&
    user.district.length !== 0 &&
    user.area.length !== 0
  ) {
    data = await Model.find({
      division: user.division,
      district: user.district,
      area: user.area,
      approved: true,
      $or: [
        { name: { $regex: searchString, $options: "i" } },
        { salary: { $gte: min, $lt: max } },
        { gender: gender },
      ],
    }).sort({ createdAt: "desc" });
  } else if (user.division.length !== 0 && user.district.length !== 0) {
    data = await Model.find({
      division: user.division,
      district: user.district,
      approved: true,
      $or: [
        { name: { $regex: searchString, $options: "i" } },
        { salary: { $gte: min, $lt: max } },
        { gender: gender },
      ],
    }).sort({ createdAt: "desc" });
  } else if (user.division.length !== 0) {
    data = await Model.find({
      division: user.division,
      approved: true,
      $or: [
        { name: { $regex: searchString, $options: "i" } },
        { salary: { $gte: min, $lt: max } },
        { gender: gender },
      ],
    }).sort({ createdAt: "desc" });
  } else {
    data = await Model.find({
      approved: true,
      $or: [
        { name: { $regex: searchString, $options: "i" } },
        { salary: { $gte: min, $lt: max } },
        { gender: gender },
      ],
    }).sort({ createdAt: "desc" });
  }

  const page = parseInt(req.query.page) || 1;
  const pages = ((data.length / 33) | 0) + 1;
  const startIndex = (page - 1) * 33;
  const endIndex = page * 33;
  if (data) {
    var resData = data.slice(startIndex, endIndex) || "No data found";
    res.status(200).send({
      data: resData,
      lastPage: endIndex >= data.length ? true : false,
      pages: pages,
      current: page,
    });
  } else {
    res.status(400).send({ data: "No data found" });
  }
};
//-----------------
const createPosts = async (req, res) => {
  try {
    const post = await new Post({
      userID: req.body.requesterId,
      class: req.body.class,
      days: req.body.days,
      desc: req.body.desc,
      lang: req.body.lang,
      salary: req.body.negotiable == true ? 0 : Number(req.body.salary),
      subjects: req.body.subjects,
      division: req.body.division || req.body.division,
      district: req.body.district,
      area: req.body.area || req.body.area,
      showPhone: req.body.showPhone,
      type: req.body.requesterRole == 'media' ? 'media' : 'user',
      lan: req.body.lan,
      lon: req.body.lon,
      gender: req.body.gender,
      negotiable: req.body.negotiable,
      approved: false,
      applied: [],
    });
    post.save();

    res.status(200).json({ msg: "Post created successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
};
//------------------
const applyForPost = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.postId });
    const currentUser = await User.findById(req.body.requesterId);
    const userId = req.body.requesterId;
    if (currentUser.role == 'tutor') {
      if (!post.applied.includes(req.body.requesterId)) {
        console.log(req.body.requesterId)
        post.applied.push(userId);
        post
          .save()
          .then((result) => {
            res.status(200).json({ msg: "Successfully Applied", icon: 'success' });
          })
          .catch((err) => {
            res.status(403).json({ msg: "Something went wrong", icon: 'error' });
          });
      } else {
        post.applied.pull(userId);
        post
          .save()
          .then((result) => {
            res.status(200).json({ msg: "Successfully removed", icon: 'success' });
          })
          .catch((msg) => {
            res.status(403).json({ msg: "Something went wrong", icon: 'error' });
          });
      }
    } else {
      res.status(200).json({ msg: "Only for tutors", icon: 'error' });
    }
  } catch (msg) {
    res.status(403).json({ msg: msg });
  }
};
const RemoveApplyForPost = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.postId });
    const userId = req.body.requesterId;
    if (!post.applied.includes(userId)) {
      await post.updateOne({ $pull: { applied: userId } });
      post
        .save()
        .then((result) => {
          res.status(200).json({ msg: "success", result });
        })
        .catch((err) => {
          res.status(500).json({ msg: "Something went wrong", err });
        });
    } else {
      res.status(200).json({ msg: "You didn\'t apply" });
    }
  } catch (err) {
    res.status(500).json({ msg: err });
  }
};
//------------------
const updatePosts = async (req, res) => {
  const post = await Post.findOneAndUpdate(
    { _id: req.params.postId },
    {
      class: req.body.class,
      days: req.body.days,
      lang: req.body.lang,
      salary: req.body.negotiable == true ? 0 : Number(req.body.salary),
      subjects: req.body.subjects,
      division: req.body.division,
      district: req.body.district,
      area: req.body.area,
      lan: req.body.lan,
      desc: req.body.desc,
      lon: req.body.lon,
      gender: req.body.gender,
      showPhone: req.body.showPhone,
      negotiable: req.body.negotiable,
      approved: false,
    }
  );
  await post
    .save()
    .then((result) => {
      res.status(200).json({ msg: "Post updated successfully", result });
    })
    .catch((err) => {
      res.status(500).json({ msg: "Something went wrong", err });
    });
};
//-------------------
const likePost = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.body.likedId });
    const userId = req.body.requesterId;
    if (!post.liked.includes(userId)) {
      await post.updateOne({ $push: { liked: userId } });
      res.status(200).json({ msg: "Added to favorites" });
    } else {
      await post.updateOne({ $pull: { liked: userId } });
      res.status(200).json({ msg: "Removed from favorites" });
    }
  } catch (err) {
    res.status(500).json({ msg: err });
  }
};
const deletePosts = async (req, res) => {
  try {
    await Post.deleteOne({ _id: req.params.postId });
    await Notification.findOneAndDelete({ postId: req.params.postId });
    await Comment.deleteMany({ postId: req.params.postId });
    res.status(200).send("Successfully deleted");
  } catch (error) {
    res.status(500).send("Oops..");
  }
};
const postsLiked = async (req, res) => {
  const searchString = req.query.search.toString();

  try {
    const posts = await Post.find({
      liked: { $in: req.body.requesterId },
      $or: [
        { desc: { $regex: searchString, $options: "i" } },
        { subjects: { $regex: searchString, $options: "i" } },
      ],
    });
    const page = parseInt(req.query.page) || 1;
    const pages = ((posts.length / 100) | 0) + 1;
    const startIndex = (page - 1) * 100;
    const endIndex = page * 100;
    res.status(200).send({
      data: posts.reverse().slice(startIndex, endIndex) || [],
      lastPage: endIndex >= posts.length ? true : false,
      pages: pages,
      current: page,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};
const postsApplied = async (req, res) => {
  const searchString = req.query.search.toString();

  try {
    const posts = await Post.find({
      applied: { $in: req.body.requesterId },
      $or: [
        { desc: { $regex: searchString, $options: "i" } },
        { subjects: { $regex: searchString, $options: "i" } },
      ],
    })
    const page = parseInt(req.query.page) || 1;
    const pages = ((posts.length / 100) | 0) + 1;
    const startIndex = (page - 1) * 100;
    const endIndex = page * 100;
    res.status(200).send({
      data: posts.reverse().slice(startIndex, endIndex) || [],
      lastPage: endIndex >= posts.length ? true : false,
      pages: pages,
      current: page,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};
const reportPost = async (req, res) => {
  try {
    const report = await new Report({
      by: req.body.requesterId,
      reported: req.params.postId,
      type: "post",
      reason: req.body.reason,
      desc: req.body.desc,
    });
    report.save();
    res.status(200).json({ msg: "Reported successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Something went wrong" });
  }
};
const getPost = async (req, res) => {
  try {
    const reqUserRole = req.body.requesterRole;

    const post = await Post.findOne({ _id: req.params.postId }).populate(
      "userID",
      "avatarImg _id name phone gender status verified "
    );
    const comments = await Comment.find({ postId: post._id }).populate(
      'commentedBy',
      "_id avatarImg name phone role verified"
    ).sort({ createdAt: -1 })

    if (!reqUserRole || reqUserRole == undefined || reqUserRole == "user") {
      const resData = {
        _id: post._id,
        class: post.class,
        days: post.days,
        desc: post.desc,
        lang: post.lang,
        salary: post.salary,
        subjects: post.subjects,
        division: post.division,
        district: post.district,
        area: post.area,
        gender: post.gender,
        createdAt: post.createdAt,
        comments: comments,
        lan: post.lan,
        lon: post.lon,
        isLiked: req.body.requesterId ? post.liked.includes(req.body.requesterId) : false,
        liked: post.liked.length,
        showPhone: post.showPhone,
        negotiable: post.negotiable,
        allowCall: false,
        author: {
          _id: post.userID._id,
          name: post.userID.name,
          avatarImg: post.userID.avatarImg,
          gender: post.userID.gender,
          phone: null,
        },
      };
      res.status(200).json(resData);
    } else if (
      reqUserRole == "tutor" ||
      reqUserRole == "media" ||
      reqUserRole == "super" ||
      reqUserRole == "admin"
    ) {
      const user = await User.findOne({ _id: req.body.requesterId })
      const resData = {
        _id: post._id,
        class: post.class,
        days: post.days,
        desc: post.desc,
        lang: post.lang,
        salary: post.salary,
        subjects: post.subjects,
        division: post.division,
        district: post.district,
        area: post.area,
        gender: post.gender,
        createdAt: post.createdAt,
        comments: comments,
        lan: post.lan,
        lon: post.lon,
        isLiked: req.body.requesterId ? post.liked.includes(req.body.requesterId) : false,
        liked: post.liked.length,
        showPhone: post.showPhone,
        negotiable: post.negotiable,
        allowCall: ['admin', 'super'].includes(user?.role) || (user?.role == "tutor" && Number(user?.premiumEnd) > Number(Date.now())),
        author: {
          _id: post.userID._id,
          name: post.userID.name,
          avatarImg: post.userID.avatarImg,
          coverImg: post.userID.coverImg,
          gender: post.userID.gender,
          phone:
            post.showPhone !== null &&
              post.showPhone !== undefined &&
              post.showPhone !== false &&
              post.showPhone !== 0
              ? post.userID.phone
              : null,
        },
      };
      res.status(200).json(resData);
    } else {
      res.status(400).json({ msg: "No post found" });
    }
  } catch (error) {
    res.status(400).json("No post found 3");
  }
};
const getMediaPost = async (req, res) => {
  try {

    const p = await Post.findOne({ _id: req.params.postId });
    const post = await Post.findOne({ _id: req.params.postId })
      .populate({
        path: "userID",
        model: 'User',
        select: "avatarImg _id role name phone gender status verified",

      })
      .populate('applied', "_id avatarImg name role phone gender status verified");
    const ratings = await Rating.aggregate([
      { $match: { to: post.userID._id } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          stars: { $sum: '$stars' }
        }
      }
    ])

    const comments = await Comment.find({ postId: post._id }).populate(
      'commentedBy',
      "_id avatarImg name phone role verified"
    ).sort({ createdAt: -1 })


    const resData = {
      post: post,
      ratings: {
        total: ratings.length > 0 ? ratings[0].total : 0,
        stars: ratings.length > 0 ? ratings[0].stars : 0,
      },
      comments: comments,
      isLiked: req.body.requesterId ? p.liked.includes(req.body.requesterId) : false,
      isApplied: req.body.requesterId ? p.applied.includes(req.body.requesterId) : false,
      liked: post.liked.length,
    }
    res.status(200).json(resData);
  } catch (error) {
    console.log(error)
    res.status(400).json("No post found");
  }
};
const comment = async (req, res) => {
  try {
    const comment = await new Comment({
      postId: req.body.postId,
      desc: req.body.desc,
      commentedBy: req.body.requesterId
    })
    comment.save()
    res.status(200).json({ msg: 'Successfully commented' })
  } catch (err) {
    res.status(403).json({ msg: 'error' })
  }
};
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findOne({ _id: req.params.id })
    if (comment.commentedBy.toString() == req.body.requesterId.toString()) {
      await Comment.deleteOne({ _id: req.params.id });
      res.status(200).json({ msg: "Successfully deleted" });
    } else {
      res.status(403).send("Forbidden");
    }
  } catch (error) {
    res.status(500).send("Oops..");
  }
};
//-------------------

module.exports = {
  getPosts,
  getPost,
  createPosts,
  updatePosts,
  likePost,
  deletePosts,
  getPostsMyLoc,
  postsLiked,
  postsApplied,
  reportPost,
  applyForPost,
  RemoveApplyForPost,
  getMediaPost,
  comment,
  deleteComment
};
