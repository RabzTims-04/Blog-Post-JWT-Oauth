import jwt from "jsonwebtoken"
const token = jwt.sign({_id: "243543212154545"}, 'bb4e1151c90aa1d2fa12fb1526aa0b4224b0348896476665045a4b0652e02b55e8f45fbb2cdfabfe4226df02327b75cc2388517b5822215c58901b1debb7adf8',
{expiresIn:"1m"})

console.log(token);

const verified = jwt.verify(token, "bb4e1151c90aa1d2fa12fb1526aa0b4224b0348896476665045a4b0652e02b55e8f45fbb2cdfabfe4226df02327b75cc2388517b5822215c58901b1debb7adf8")

console.log(verified);