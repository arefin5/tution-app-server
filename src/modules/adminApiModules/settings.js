const { JsonDB } = require("node-json-db");
const { Config } = require("node-json-db/dist/lib/JsonDBConfig");
const jsonDB = new JsonDB(new Config("settingsData", true, false, "/"));
const fs = require("fs");
const Slider = require("../../models/Slider");
const Division = require("../../models/Division");
const District = require("../../models/District");
const Area = require("../../models/Area");
const appRoot = require("app-root-path");
const Testimonial = require("../../models/Testimonial");
const FAQ = require("../../models/FAQ");





const createDivision = async (req, res) => {
    try {
        const newData = await new Division({ name: req.body.name });
        newData.save()
        res.status(200).json({ msg: 'success', division: newData })
    } catch (error) {
        res.status(400).json({ msg: 'failed' })
    }
};
const createDistrict = async (req, res) => {
    try {
        const newData = await new District({ division: req.body.division, name: req.body.name });
        newData.save()
        res.status(200).json({ msg: 'success', district: newData })
    } catch (error) {
        res.status(400).json({ msg: 'failed' })
    }
};
const createArea = async (req, res) => {
    try {
        const newData = await new Area({ district: req.body.district, name: req.body.name });
        newData.save()
        res.status(200).json({ msg: 'success', area: newData })
    } catch (error) {
        res.status(400).json({ msg: 'failed' })
    }

};
//----------------------------------------------------------------

const deleteDivision = async (req, res) => {
    try {
        await Division.findOneAndDelete({ _id: req.params.id })
        res.status(200).json({ msg: 'success' })
    } catch (error) {
        res.status(400).json({ msg: 'success' })
    }
};
const deleteDistrict = async (req, res) => {
    try {
        await District.findOneAndDelete({ _id: req.params.id })
        res.status(200).json({ msg: 'success' })
    } catch (error) {
        res.status(400).json({ msg: 'success' })
    }
};
const deleteArea = async (req, res) => {
    try {
        await Area.findOneAndDelete({ _id: req.params.id })
        res.status(200).json({ msg: 'success' })
    } catch (error) {
        res.status(400).json({ msg: 'success' })
    }
};
//----------------------------------------------------------------
const getSliders = async (req, res) => {
    const sliders = await Slider.find({});
    res.status(200).json({ msg: 'success', sliders: sliders })
};
const newSlider = async (req, res) => {
    try {
        let imgPath = ''
        if (req.file !== undefined) {
            imgPath = req.file.path.replace("public", "").split("\\").join("/");
        }
        const newSlider = await new Slider({
            title: req.body.title,
            heading: req.body.heading,
            text: req.body.text,
            url: req.body.url,
            img: imgPath,
        });
        newSlider.save().then(async () => {
            const slides = await Slider.find()
            res.status(200).json({ msg: 'success', sliders: slides })
        })
    } catch (error) {
        console.log(error)
        res.status(400).json(error)
    }
};
const updateSlider = async (req, res) => {
    const sliderId = req.params.sliderId;
    try {
        const slider = await Slider.findOne({ _id: sliderId });
        let imgPath = slider.img;
        if (req.file !== undefined) {
            if (slider.img.length !== 0) {
                fs.unlink(
                    appRoot +
                    "/" +
                    "public" +
                    slider.img.replace("public", "").split("/").join("\\"),
                    (err) => { }
                );
            }
            imgPath = req.file.path.replace("public", "").split("\\").join("/");
        }
        slider.title = req.body.title;
        slider.heading = req.body.heading;
        slider.text = req.body.text;
        slider.url = req.body.url;
        slider.img = imgPath;
        slider.save();
        res.status(200).json({ msg: 'success' })
    } catch (error) {
        res.send(error);
    }
};
const deleteSlider = async (req, res) => {
    const sliderId = req.params.sliderId;
    try {
        const slider = await Slider.findOne({ _id: sliderId });
        if (slider.img.length !== 0) {
            fs.unlink(
                appRoot +
                "/" +
                "public" +
                slider.img.replace("public", "").split("/").join("\\"),
                (err) => { }
            );
        }
        await Slider.findOneAndDelete({ _id: sliderId });
        res.status(200).json({ msg: 'success' })
    } catch (error) {
        res.status(404).json("404");
    }
};
//----------------------------------------------------------------
const getTestimonials = async (req, res) => {
    const testimonials = await Testimonial.find({});
    res.status(200).json({ msg: 'success', testimonials: testimonials })
};
const newTestimonial = async (req, res) => {
    try {
        const newTestimonial = await new Testimonial({
            quote: req.body.quote,
            desc: req.body.desc,
            name: req.body.name,
            stars: Number(req.body.stars) || 0,
            from: req.body.from,
        });
        newTestimonial.save().then(async () => {
            const slides = await Testimonial.find()
            res.status(200).json({ msg: 'success', testimonials: slides })
        })
    } catch (error) {
        console.log(error)
        res.status(400).json(error)
    }
};
const updateTestimonial = async (req, res) => {
    const testimonialId = req.params.testimonialId;
    try {
        const testimonial = await Testimonial.findOne({ _id: testimonialId });
        testimonial.quote = req.body.quote;
        testimonial.desc = req.body.desc;
        testimonial.name = req.body.name;
        testimonial.stars = Number(req.body.stars) || 0;
        testimonial.from = req.body.from;
        testimonial.save();
        res.status(200).json({ msg: 'success' })
    } catch (error) {
        res.send(error);
    }
};
const deleteTestimonial = async (req, res) => {
    const testimonialId = req.params.testimonialId;
    try {
        await Testimonial.findOneAndDelete({ _id: testimonialId });
        res.status(200).json({ msg: 'success' })
    } catch (error) {
        res.status(404).json("404");
    }
};
//----------------------------------------------------------------
const getFAQs = async (req, res) => {
    const faqs = await FAQ.find({});
    res.status(200).json({ msg: 'success', faqs: faqs })
};
const newFAQ = async (req, res) => {
    try {
        const newFAQ = await new FAQ({
            ans: req.body.ans,
            ques: req.body.ques,
        });
        newFAQ.save().then(async () => {
            const slides = await FAQ.find()
            res.status(200).json({ msg: 'success', faqs: slides })
        })
    } catch (error) {
        console.log(error)
        res.status(400).json(error)
    }
};
const updateFAQ = async (req, res) => {
    const faqId = req.params.faqId;
    try {
        const faq = await FAQ.findOne({ _id: faqId });
        faq.ans = req.body.ans;
        faq.ques = req.body.ques;
        faq.save();
        res.status(200).json({ msg: 'success' })
    } catch (error) {
        res.send(error);
    }
};
const deleteFAQ = async (req, res) => {
    const faqId = req.params.faqId;
    try {
        await FAQ.findOneAndDelete({ _id: faqId });
        res.status(200).json({ msg: 'success' })
    } catch (error) {
        res.status(404).json("404");
    }
};
///----------------------------------------------------------------
const getSettings = async (req, res) => {
    const settingsData = fs.readFileSync("./settingsData.json", "utf8");
    const settings = JSON.parse(settingsData);
    res.status(200).json({
        signKey: settings.payKeys.signKey,
        storeId: settings.payKeys.storeId,
        returnUrl: settings.payKeys.returnUrl,
        mode: settings.payKeys.mode,
        chargeForUpgrade: settings.payKeys.chargeForUpgrade,
        verificationFees: settings.payKeys.verificationFees,
        tutorVerificationFees: settings.payKeys.tutorVerificationFees,
        mediaVerificationFees: settings.payKeys.mediaVerificationFees,
        phone: settings.footerLinks.phone,
        txt: settings.footerLinks.txt,
        fb: settings.footerLinks.fb,
        in: settings.footerLinks.in,
        tw: settings.footerLinks.tw,
        yt: settings.footerLinks.yt,
        ps: settings.footerLinks.ps,
        as: settings.footerLinks.as,
        hero: {
            desktop: settings?.hero?.desktop || '',
            mobile: settings?.hero?.mobile || '',
            d: settings?.hero?.d || '',
            m: settings?.hero?.m || '',
        },
        smsToken: settings?.sms?.smsToken || '',
        loginType: settings?.sms?.loginType || '',
        smsId: settings?.sms?.smsId || ''
    });
};
const updateSettings = async (req, res) => {
    try {
        jsonDB.push("/payKeys", {
            signKey: req.body.signKey,
            storeId: req.body.storeId,
            returnUrl: req.body.returnUrl,
            mode: req.body.mode,
            chargeForUpgrade: req.body.chargeForUpgrade,
            verificationFees: req.body.verificationFees,
            tutorVerificationFees: req.body.tutorVerificationFees,
            mediaVerificationFees: req.body.mediaVerificationFees,
        });
        jsonDB.push('/sms', {
            smsToken: req.body.smsToken,
            loginType: req.body.loginType,
            smsId: req.body.smsId
        });
        // await User.updateMany({ role: 'tutor' }, {
        //     $set: {
        //         subEnd: moment().add(90, 'days').format('YYYY-MM-DD')
        //     }
        // });
        const settingsData = fs.readFileSync("./settingsData.json", "utf8");
        const settings = JSON.parse(settingsData);
        let mobileFile = settings.hero?.mobile || '';
        let desktopFile = settings.hero?.desktop || '';
        let mFile = settings.hero?.m || '';
        let dFile = settings.hero?.d || '';
        console.log(req.files)
        if (req.files.m !== undefined) {
            if (mFile !== '') {
                fs.unlink("./public" + mFile, (err) => {
                    console.log(err);
                });
            }
            mFile = req.files.m[0].path
                .replace("public", "")
                .split("\\")
                .join("/");
        }
        if (req.files.d !== undefined) {
            if (dFile !== '') {
                fs.unlink("./public" + dFile, (err) => {
                    console.log(err);
                });
            }
            dFile = req.files.d[0].path
                .replace("public", "")
                .split("\\")
                .join("/");
        }
        if (req.files.mobile !== undefined) {
            if (mobileFile !== '') {
                fs.unlink("./public" + mobileFile, (err) => {
                    console.log(err);
                });
            }
            mobileFile = req.files.mobile[0].path
                .replace("public", "")
                .split("\\")
                .join("/");
        }
        if (req.files.desktop !== undefined) {
            if (desktopFile !== '') {
                fs.unlink("./public" + desktopFile, (err) => {
                    console.log(err);
                });
            }
            desktopFile = req.files.desktop[0].path
                .replace("public", "")
                .split("\\")
                .join("/");
        }
        jsonDB.push("/hero", {
            mobile: mobileFile,
            desktop: desktopFile,
            m: mFile,
            d: dFile,
        });
        jsonDB.push("/footerLinks", {
            txt: req.body.txt,
            fb: req.body.fb,
            in: req.body.in,
            tw: req.body.tw,
            yt: req.body.yt,
            phone: req.body.phone,
            ps: req.body.ps,
            as: req.body.as,
        });
        res.status(200).json({ msg: 'success' })
    } catch (err) {
        console.log(err);
        res.status(500).json({ err: err })
    }
};
const getPolicyPages = async (req, res) => {
    const json = fs.readFileSync("./policiesData.json", "utf8");
    const data = JSON.parse(json);
    res.status(200).json({
        terms: data.terms,
        policies: data.policies,
        disclaimers: data.disclaimers,
        about: data.about,
        promote: data.promote,
    })
};
const updatePolicyPages = async (req, res) => {
    const policiesDB = new JsonDB(new Config("policiesData", true, false, "/"));
    policiesDB.push("/about", req.body.about);
    policiesDB.push("/policies", req.body.policies);
    policiesDB.push("/disclaimers", req.body.disclaimers);
    policiesDB.push("/terms", req.body.terms);
    policiesDB.push("/promote", req.body.promote);
    res.status(200).json({ msg: 'success' })
};

//----------------------------------------------------------------
const init = async (req, res) => {
    const divissionsData = await fs.readFileSync("./divissions.json", "utf8");
    const districtsData = await fs.readFileSync("./districts.json", "utf8");
    const upazillasData = await fs.readFileSync("./upazillas.json", "utf8");
    const divissions = JSON.parse(divissionsData).divissions;
    const districts = JSON.parse(districtsData).districts;
    const upazillas = JSON.parse(upazillasData).upazillas;
    try {
        divissions.map(async (data) => {
            const exists = await Division.exists({ name: data.name })
            if (!exists) {
                const newData = await new Division(data);
                newData.save()
            }
        })
        districts.map(async (data) => {
            const exists = await District.exists({ name: data.name })
            if (!exists) {
                const newData = await new District({
                    name: data.name,
                    division: data.divission,
                });
                newData.save()
            }
        })
        upazillas.map(async (data) => {
            const exists = await Area.exists({ name: data.name })
            if (!exists) {
                const newData = await new Area({
                    name: data.name,
                    district: data.district
                });
                newData.save()
            }
        })

        res.status(200).json({
            success: true,
        })
    } catch (err) {
        res.status(200).json({
            success: false,
            error: err
        })
    }
}



//----------------------------------------------------------------
module.exports = {
    getSettings,
    getPolicyPages,
    updateSettings,
    updatePolicyPages,
    createDivision,
    createDistrict,
    createArea,
    deleteDivision,
    deleteDistrict,
    deleteArea,
    getSliders,
    newSlider,
    updateSlider,
    deleteSlider,
    init,
    getTestimonials,
    newTestimonial,
    updateTestimonial,
    deleteTestimonial,
    getFAQs,
    newFAQ,
    updateFAQ,
    deleteFAQ,
}