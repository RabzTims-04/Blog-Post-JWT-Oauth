import express from "express";
import createError from "http-errors";
import q2m from "query-to-mongo"
import { JWTAuthMiddleware } from "../../auth/middlewares.js";
import { JWTAuthenticate } from "../../auth/tools.js";
import AuthorModel from "./schema.js";
import BlogModel from "../blogs/schema.js"
import passport from "passport";

const authorsRouter = express.Router();

/* *************GET Authors******************** */

authorsRouter.get("/", JWTAuthMiddleware, async (req, res, next) => {
    try {        
        const query = q2m(req.query)     
        const { total, authors } = await AuthorModel.findAuthorsOfBlog(query)
        res.send({links: query.links("/authors", total), total, authors})
        
    } catch (error) {
        next(createError(500, "Error in getting authors"))
    }
})

/* *******************login author*************************** */
authorsRouter.post("/login", async (req, res, next) => {
    try {
      const  { email, password} = req.body
      const author = await AuthorModel.checkCredentials(email, password)
      if(author){
        const accessToken = await JWTAuthenticate(author)
        res.send({accessToken})
      }else{
        next(createError(401, "credentials are not valid"))
      }
  
    } catch (error) {
      console.log(error);
      next(error)
    }
  })

  /* *******************Redirecting author to google page*************************** */
authorsRouter.get("/googleLogin", passport.authenticate("google", {
    scope: ["profile", "email"]
}))

  /* *******************login author*************************** */
authorsRouter.get("/googleRedirect", passport.authenticate("google"), async (req, res, next) => {
    try {
        res.redirect(`http://localhost:3000?accessToken=${req.author.token.accessToken}`)
    } catch (error) {
      console.log(error);
      next(error)
    }
  })

/* *************GET Authors******************** */

authorsRouter.get("/me/stories", async (req, res, next) => {
    try {        
        const { _id } = req.author
        const stories = await BlogModel.find({authors:_id}).populate("authors")
        res.send(stories)        
    } catch (error) {
        next(createError(500, "Error in getting authors"))
    }
})

/* ***************GET single author****************** */

authorsRouter.get("/me",JWTAuthMiddleware, async (req, res, next) => {
    try {
        res.send(req.author)

    } catch (error) {
        next(createError(500, "Error in getting single author"))
    }
})

/* ***************POST author details****************** */

authorsRouter.post("/", async (req, res, next) => {
    try {
        const { email } = req.body
        const author = await AuthorModel.findOne({email:email})
        console.log(author);
        if(author){
            next(createError(403, "Email already exists"))
        }else{
            const newAuthor = new AuthorModel(req.body)
            const {_id} = await newAuthor.save()
            res.status(201).send({_id})
        }        
    } catch (error) {
        next(createError(500, "Error in posting author details"))
    }
})

/* ***************EDIT author details****************** */

authorsRouter.put("/me",JWTAuthMiddleware, async (req, res, next) => {
    try {
      /*   const author = {...req.body}
        const updatetAuthor = await AuthorModel.findByIdAndUpdate(req.params.authors, author, {
            new:true,
            runvalidators:true
        }) */
        req.author = {...req.body}
        await req.author.save()
        res.send()

    } catch (error) {
        next(createError(500, "Error in getting single author"))
    }
})

/* ***************delete single author****************** */

authorsRouter.delete("/me",JWTAuthMiddleware, async (req, res, next) => {
    try {
        await req.author.deleteOne()
        res.status(204).send()

    } catch (error) {
        next(createError(500, "Error in getting single author"))
    }
})

/* ****************DELETE author details***************** */

authorsRouter.delete("/:id", async (req, res, next) => {
    try {
        const id = req.params.id
        const author = await AuthorModel.findByIdAndDelete(id)
        if(author){
            res.status(204).send()
        }
        else{
            next(createError(404, `author with id: ${id} not found`))
        }
    } catch (error) {
        next(createError(500, "Error in deleting author details"))
    }
})

export default authorsRouter