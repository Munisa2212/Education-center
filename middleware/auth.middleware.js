const jwt = require("jsonwebtoken")

function AuthMiddleware(){
    return (req, res, next)=>{
        try{
            let token = req.header("Authorization")?.split(" ")[1]
            if(!token){
                return res.status(401).send({message: "Token not provided"})
            }
            next()
            let data = jwt.verify(token, 'sekret')
        }catch(err){
            return res.status(401).send(err)
        }
    }
}

module.exports = {AuthMiddleware}