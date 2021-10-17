const express=require('express');
const router=express.Router();
const catchAsync=require('../utils/catchAsync');
const User=require('../models/user');
const passport = require('passport');

router.get('/',(req,res)=>{
    res.render('authorization/register');
})
router.post('/',catchAsync(async (req,res,next)=>{
    try{
    const {email,username,password}=req.body;
    const user =new User({email,username});
    const registereduser=await User.register(user,password);
    //console.log(registereduser);
    req.login(registereduser,err=>{
        if(err) return next(err);
        req.flash('success','Created the user');
        res.redirect('/campgrounds');
    });
   
    }
    catch(e){
        req.flash('error',e.message);
        res.redirect('register');
    }
}))
router.get('/login',(req,res)=>{
     res.render('authorization/login');
})
router.post('/login',passport.authenticate('local',{failureFlash:true,failureRedirect:'/register/login'}),(req,res)=>{
req.flash('success',"Welcome Back");
const redirection=req.session.returnTo||'/campgrounds';
delete req.session.returnTo;
res.redirect(redirection);
})
router.get('/logout',(req,res)=>{
    req.logout();
    req.flash('success','Logged Out');
    res.redirect('/campgrounds');
})
module.exports=router;