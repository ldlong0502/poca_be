const jwt = require("jsonwebtoken");
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log(req.headers.authorization);
    if(authHeader){
        jwt.verify(authHeader.split(" ")[1], process.env.JWT_SEC, (err, user) => {
          if (err) res.status(403).json("Token is not valid");
          req.user = user;
          next();
        });
    } else {
        return res.status(401).json("Not authenticated");
    }
}

const verifyTokenAndAuthorization = (req, res, next) => {
    verifyToken(req, res, () => {
        if(req.user._id = req.params.id || req.user.isAdmin) {
            next();
        } else {
            res.status(403).json("You are not allowed to do that");
        }
    });
}
const verifyTokenAndAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if(req.user.isAdmin) {
            next();
        } else {
            res.status(403).json("You are not allowed to do that");
        }
    });
}
module.exports = { verifyToken, verifyTokenAndAuthorization , verifyTokenAndAdmin};