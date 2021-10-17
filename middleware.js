const Campground =require('./models/campground');
module.exports.isloggedin=(req,res,next)=>{
    //console.log(req.user);
    if(!req.isAuthenticated())
    {   //store the url 
        req.session.returnTo=req.originalUrl;
        req.flash('error',"Sign in Required");
        res.redirect('/register/login');
    }
    next();
}
