const Ads = require("../../models/Ads");
const User = require("../../models/User");
const fs = require("fs");
const appRoot = require("app-root-path");
const { default: mongoose } = require("mongoose");

const getAds = async (req, res) => {
    const count = req.query.count
    const page = parseInt(req.query.page) || 1;
    const totalRecs = await Ads.countDocuments()
    const data = await Ads.find()
        .sort({ _id: -1 })
        .select(
            "title img"
        ).limit(100)
        .skip(100 * (page - 1));
    const pages = ((totalRecs / count) | 0) + 1;
    res.status(200).send({
        data: data,
        pages: pages
    });

};
const getAdsPublic = async (req, res) => {
    try {
        const totalAds = await Ads.countDocuments()

        // const ad = await Ads.findOne(Number(totalAds) > 1 ? { recentlyRendered: false } : {}).sort({ renders: 1, lastRenderedAt: 1 }).exec();
        const ad = await Ads.findOneAndUpdate(
            Number(totalAds) > 1 ? { recentlyRendered: false } : {},
            {
                $set: {
                    recentlyRendered: true,
                    lastRenderedAt: new Date(),
                },
                $inc: {
                    renders: 1,
                },
            },
            {
                sort: { renders: 1, lastRenderedAt: 1 },
                new: true,
            }
        ).exec();
        if (!ad) {
            return res.status(404).json({ error: 'No ads found.' });
        } else {
            // ad.recentlyRendered = true;
            // ad.renders += 1;
            // ad.lastRenderedAt = new Date();
            // await ad.save();
            await Ads.updateMany({
                _id: { $ne: ad._id }
            }, {
                $set: {
                    recentlyRendered: false,
                }
            })
            const resData = {
                _id: ad._id,
                title: ad.title,
                img: ad.img,
                height: ad.height,
                width: ad.width,
            };
            return res.status(200).json(resData);
        }

    } catch (error) {
        console.error('Error while fetching ad:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};



const getAdsSingle = async (req, res) => {

    const data = await Ads.findOne({ _id: req.params.adsId })
    res.status(200).json({
        ads: data,
    });

};
const clickAds = async (req, res) => {
    const { adsId } = req.params;
    try {
        const ad = await Ads.findById(adsId);
        if (!ad) {
            return res.status(404).json({ error: 'Ad not found.' });
        }
        ad.clicks++;
        await ad.save();

        if (!(ad.url).startsWith('http://') && !(ad.url).startsWith('https://')) {
            const redirectUrl = 'https://' + (ad.url);
            return res.redirect(redirectUrl + '?ref=tuitionappbd.com');
        } else {
            return res.redirect((ad.url) + '?ref=tuitionappbd.com');
        }

    } catch (error) {
        return res.redirect('https://tuitionappbd.com/404');
    }
};

const createAds = async (req, res) => {
    try {
        let imgPath = "";
        if (req?.file !== undefined) {
            imgPath = req.file.path.replace("public", "").split("\\").join("/")
        }

        const newAds = await new Ads({
            title: req.body.title,
            url: req.body.url,
            height: Number(req.body.height),
            width: Number(req.body.width),
            img: imgPath,

        });
        await newAds.save();
        res.status(200).json({ msg: 'success' });
    } catch (error) {
        console.log(error);
        res.status(400).json({ err: 'fail' });
    }
};

const editAds = async (req, res) => {
    try {
        const ads = await Ads.findOne({ _id: req.params.adsId });
        let imgPath = ads.img;
        if (req.file !== undefined) {
            if (ads.img.length !== 0) {
                fs.unlink("./public" + ads.img, (err) => { console.log(err); });
            }
            imgPath = req.file.path.replace("public", "").split("\\").join("/")
            console.log(req.file)
        }
        ads.title = req.body.title
        ads.url = req.body.url
        ads.height = Number(req.body.height)
        ads.width = Number(req.body.width)
        ads.img = imgPath
        await ads.save();
        res.status(200).json({ msg: 'success' });
    } catch (error) {
        console.log(error)
        res.status(400).json({ msg: 'fail' });
    }
};
const deleteAds = async (req, res) => {
    const adsId = req.params.adsId;
    try {
        const ads = await Ads.findOne({ _id: adsId });

        if (ads.img.length !== 0) {
            fs.unlink("./public" + ads.img, (err) => {
                console.log(err);
            });
        }
        await Ads.findOneAndDelete({ _id: adsId });
        res.status(200).json({ msg: 'success' });
    } catch (error) {
        res.status(400).json({ msg: 'fail' });
    }
};

module.exports = {
    createAds,
    editAds,
    deleteAds,
    getAdsSingle,
    getAds,
    getAdsPublic,
    clickAds,
}