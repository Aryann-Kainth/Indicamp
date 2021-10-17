const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const CampGround = require('../models/campground');
const { isloggedin } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary/index');
const upload = multer({ storage });
const { populate } = require('../models/campground');
const mbxGeocoding=require('@mapbox/mapbox-sdk/services/geocoding');
const campground = require('../models/campground');
const mapBoxToken=process.env.MAPBOX_TOKEN;
const {cloudinary}=require('../cloudinary');
const geocoder=mbxGeocoding({accessToken:mapBoxToken});
const isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const camp = await CampGround.findById(id);
    if (!camp.author.equals(req.user._id)) {
        req.flash('error', "Not your camp");
        res.redirect('/campgrounds/' + id);
    }
    next();
}
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await CampGround.find({});
    res.render('campgrounds/index', { campgrounds });

}))
router.get('/new', isloggedin, (req, res) => {

    res.render('campgrounds/new.ejs');

})
router.post('/', isloggedin, upload.array('image'),  catchAsync(async (req, res) => {
    //res.send('works');
   // console.log(req.body,req.file) //use this to check 
  const geodata=await geocoder.forwardGeocode({
       query:req.body.campground.location,
       limit:1
   }).send()
   
   
    const camp = new CampGround(req.body.campground);
    camp.geometry=geodata.body.features[0].geometry;
    camp.images=req.files.map(f=>({url:f.path,filename:f.filename}))
     camp.author=req.user._id;
     await camp.save();
     console.log(camp);
     req.flash('success','Successfuly added the camp ground')
     res.redirect('/campgrounds/' + camp._id);

}))
router.get('/:id', catchAsync(async (req, res, next) => {

    const camp = await CampGround.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    //console.log(camp);
    res.render('campgrounds/show', { camp, user: req.user });


}))
router.get('/:id/edit', isloggedin, isAuthor, catchAsync(async (req, res) => {
    const camp = await CampGround.findById(req.params.id);
    res.render('campgrounds/edit', { camp });
}))
//below is imp
router.put('/:id', isloggedin, isAuthor,upload.array('image'), catchAsync(async (req, res) => {
    //res.send("Works");
    console.log(req.body);
    const geodata=await geocoder.forwardGeocode({
        query:req.body.campground.location,
        limit:1
    }).send()
    const { id } = req.params;
    
    const camp = await CampGround.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs=req.files.map(f=>({url:f.path,filename:f.filename}))
    camp.images.push(...imgs);

    await camp.save()
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await camp.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    camp.geometry=geodata.body.features[0].geometry;
    req.flash('success', 'Succesfuly Edited the campground');
    res.redirect('/campgrounds/' + camp._id);
}))
router.delete('/:id', isloggedin, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await CampGround.findById(id);
    if (!camp.author.equals(req.user._id)) {
        req.flash('error', 'You Cannot Do this task');
        res.redirect('/campgrounds/' + id);
    }
    const campground = await CampGround.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

module.exports = router;