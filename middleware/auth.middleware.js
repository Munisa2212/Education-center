const jwt = require("jsonwebtoken")

function AuthMiddleware(){
    return (req, res, next)=>{
        try{
            console.log("kirdi");
            
            let token = req.header("Authorization")?.split(" ")[1]
            if(!token){
                return res.status(401).send({message: "Token not provided"})
            }
            let data = jwt.verify(token, 'sekret')
            if(!data){
                return res.status(401).send({message: "Invalid token"})
            }
            req.user = data
            next()
        }catch(err){
            return res.status(401).send(err)
        }
    }
}

module.exports = {AuthMiddleware}