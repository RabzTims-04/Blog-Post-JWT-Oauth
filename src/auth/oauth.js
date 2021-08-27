import passport from "passport"
import GoogleStrategy from "passport-google-oauth20"
import AuthorModel from "../services/authors/schema.js"
import { JWTAuthenticate } from "./tools.js";

const googleStrategy = new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3002/authors/googleRedirect"
},
async(accessToken, refreshToken, profile, passportNext) => {
    try {
        console.log(profile);
        const author = await AuthorModel.findOne({googleId: profile.id})
        if(author){
            const token = await JWTAuthenticate(author)
            passportNext(null, {token})
        }else{
            const newAuthor = {
                name: profile.name.givenName,
                surname: profile.name.familyName,
                email: profile.emails[0].value,
                googleId: profile.id
            }

            const createdAuthor = new AuthorModel(newAuthor)
            const savedAuthor = await createdAuthor.save()
            const token = await JWTAuthenticate(savedAuthor)
            passportNext(null, {author: savedAuthor, token})
        }
    } catch (error) {
        passportNext(error)
    }
})

passport.serializeUser(function (user, passportNext) {
    passportNext(null, user)
})

export default googleStrategy