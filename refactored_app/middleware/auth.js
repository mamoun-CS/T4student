// Middleware to check if a user acts as authenticated 
export const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/sing-in");
};
