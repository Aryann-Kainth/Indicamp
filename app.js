if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const methodOverride = require('method-override');//for posting the edit changes
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const CampGround = require('./models/campground');
const Review = require('./models/review');
const campgroundroutes = require('./routes/campgrounds');
const reviewroutes = require('./routes/reviews');
const userroutes = require('./routes/users');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStratergy = require('passport-local');
const User = require('./models/user');
const dbUrl=process.env.DB_URL;
const MongoStore=require('connect-mongo');
mongoose.connect(dbUrl, { useNewUrlParser: true });

const db = mongoose.connection;
db.on("error", console.error.bind(console, 'connetion error'));
db.once('open', () => {
    console.log('database connected');
})
const path = require('path');
const secret='kratos'||process.env.SECRET;
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
const store =MongoStore.create({
    mongoUrl:dbUrl,
    secret,
    touchAfter:24*60*60
});
store.on('error',function(e){
    console.log("Something wrong",e);
})
const sessionConfig = {
    store:store,
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + (1000 * 60 * 60 * 24 * 7),
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(flash());
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStratergy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentuser = req.user;
    next();
})
app.use('/campgrounds', campgroundroutes);
app.use('/', reviewroutes);
app.use('/register', userroutes);
app.get('/', (req, res) => {
    res.render('home.ejs');
})
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
})
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) {
        err.message = 'Oh No Something is Wrong';
    }
    res.status(statusCode).render('error.ejs', { err });
    //res.send('Something wrong');
})
const port =process.env.PORT||3000;
app.listen(port, () => {
    console.log("Server Up");
})