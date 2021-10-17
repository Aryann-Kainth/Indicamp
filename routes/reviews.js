const express=require('express');
const router =express.Router();
const catchAsync=require('../utils/catchAsync');
const ExpressError=require('../utils/ExpressError');
const CampGround = require('../models/campground');
const Review=require('../models/review');
const {isloggedin}=require('../middleware');
/*const isReviewAuthor = async(req,res,next)=>{
  const { id,reviewid } = req.params;
  const review=await Review.findById(reviewid);
  if(!review.author.equals(req.user._id)){
      req.flash('error',"Not your camp");
      res.redirect('/campgrounds/'+id);
  }
  next();
}*/
router.post('/campgrounds/:id/review',isloggedin,async(req,res)=>{
    //res.send('Works');
    const {id}=req.params;
    const camp=await CampGround.findById(id);
    const review=new Review(req.body.review);
    review.author=req.user._id;
    camp.reviews.push(review);
    await review.save();
    await camp.save();
    console.log(review);
    req.flash('success',"Review Added ");
    res.redirect('/campgrounds/'+camp._id);
})
router.delete('/campgrounds/:id/review/:reviewid',isloggedin,async(req,res)=>{
    //res.send('Hi');
    const {id,reviewid}=req.params;
  const camp=await CampGround.findByIdAndUpdate(id,{$pull:{reviews:reviewid}});
    const rev=await Review.findByIdAndDelete(reviewid);
    res.redirect('/campgrounds/'+id);
})
module.exports=router;