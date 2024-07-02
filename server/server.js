// imports
import express from 'express'
import session from 'express-session'
import ViteExpress from 'vite-express'
import handlerFunctions from './controller.js'

// express instance
const app = express()
// the distance of an IRONMAN triathlon is 140.6 miles
const port = 1406

// middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
    session({
        secret: "Rocks are Broken",
        saveUninitialized: false,
        resave: false,
    })
);

// endpoints
const {
    sessionCheck,
    register,
    login,
    logout,
    getPets, 
    getUserMedals, 
    getUserAchievements,
    postPet,
    postMedal,
    postAchievement,
    deletePet,
    deleteMedal,
    deleteAchievement,
    putPet,
} = handlerFunctions

    app.get('/api/get_pets/:id', getPets)
    app.get('/api/get_medals/:id', getUserMedals)
    app.get('/api/get_achievements/:id', getUserAchievements)
    app.get('/api/get_session_check', sessionCheck)
    app.get('/api/get_logout', logout)

    app.post('/api/post_pet', postPet)
    app.post('/api/post_medal', postMedal)
    app.post('/api/post_achievement', postAchievement)
    app.post('/api/post_register', register)
    app.post('/api/post_login', login)

    app.delete('/api/delete_pet/:id', deletePet)
    app.delete('/api/delete_medal/:userId/:medalId', deleteMedal)
    app.delete('/api/delete_achievement/:userId/:achievementId', deleteAchievement)
    
    app.put('/api/put_pet/:id', putPet)

// open server
ViteExpress.listen(app, port, ()=> console.log('go for the jackalope - http://localhost:1406'))
