var User = require('./models/user');
var Blog = require('./models/post');
var Comment = require('./models/comment');
module.exports = function(app, passport) {

//home page

    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

//display login page

    app.get('/login', function(req, res) {
        res.render('login.ejs', { message: req.flash('loginMessage') });
    });

//process login page

    app.post('/login', passport.authenticate('local-login', {
		    successRedirect : '/profile',
		    failureRedirect : '/login',
		    failureFlash : true
	  }));

//display signup page

    app.get('/signup', function(req, res) {
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

//process sign up

    app.post('/signup', passport.authenticate('local-signup', {
		    successRedirect : '/profile',
		    failureRedirect : '/signup',
	      failureFlash : true
	     }));

//display profile of logged in user

    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('home.ejs', {
            user : req.user
        });
    });

//display all blogs

    app.get('/blogs',isLoggedIn, function(req, res){
        Blog.find({}, function(err, blogs) {
          if (err) throw err;
          res.render('blog.ejs',{
            user  : req.user,
            posts : blogs
          });
        });

    });

//display specific blog

    app.get('/blog',isLoggedIn,function(req, res){
      var blogid = req.param('id');
      Blog.findById(blogid,function(err, blog){
        if (err){
          throw err;}
        var isInArray = blog.seen.some(function(ids){
          return ids.equals(req.user.ObjectId);
        });
        if (!isInArray) {
          User.findByIdAndUpdate(req.user.ObjectId , { $push: {"seen_posts": blog.ObjectId}},
            {  safe: true, upsert: true},
              function(err, user) {
                if(err){
        	         throw err;
                 }
               });
          Blog.findByIdAndUpdate(blog.ObjectId, { $push: {"seen": req.user.ObjectId}},
          { safe : true , upsert : true },
            function(err,blog){
              if (err) {
                throw err;
              }
            }
          );
        }
      Comment.find({ comment_for: blogid},function(err,comments){
        if(err) throw err;
        res.render('dispblog.ejs',{
          user  :  req.user,
          post  :  blog,
          comments_under  :  comments
        });
      });

      });
    });

//post blog

    app.post('/blog',isLoggedIn,function(req, res){
      var post = req.body.post;
      passReqToCallback : true;
      if (post.length>0) {
        var newPost = new Blog();
        newPost.content = post;
        newPost.post_date_time = Date.now;
        newPost.post_by_id = req.user.ObjectId;
        newPost.post_by_name = req.user.name;
        newPost.seen = [req.user.ObjectId];
        newPost.save(function(err){
          if(err){
            throw err;
          }

          User.findByIdAndUpdate(req.user.ObjectId,  { $push: {"seen_posts": newPost.ObjectId}},
            {  safe: true, upsert: true},
              function(err, model) {
                if(err){
        	         throw err;
                 }
               });

          var redpage = '/blog?id=' + newPost.ObjectId;
          res.redirect(redpage);
        });
      }
    });

//post comment to a blog

    app.post('/commment',function(req, res){
      var comm = req.body.comment;
      var bid = req.post.ObjectId;
      var newComm = new Comment();
      newComm.content = comm;
      newComm.post_by_id = req.user.ObjectId;
      newComm.post_by_name = req.user.name;
      newComm.post_date_time = Date.now;
      newComm.comment_for = bid;
      newComm.save(function(err){
          if(err) throw err;
          var redpage = '/blog?id=' + bid;
          res.redirect(redpage);
      });
    });

//handle logout

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}
