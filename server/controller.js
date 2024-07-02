import { 
    newPet, 
    newMedalOwner, 
    newAchievementOwner, 
    viewPets, 
    viewUserMedals, 
    viewUserAchievements, 
    rehomePet, 
    removeMedal,
    removeAchievement,
    editPet
} from "../database/queries.js"

const handlerFunctions = {

    postPet: async (req, res) => {
        const { entry } = req.body

        console.log(`entry`, entry)

        //test request structure before returning
        if (!entry) {
            res.status(400).send({
                message: `Error400: bad request, entry not specified`,
                success: false
                });
            return
        }
        
        //adds to DB
        res.status(200).send({ 
            newEntry: await newPet(entry),
            success: true
        });
    },

    postMedal: async (req, res) => {
        const { entry } = req.body

        console.log(`entry`, entry)

        //test request structure before returning
        if (!entry) {
            res.status(400).send({
                message: `Error400: bad request, entry not specified`,
                success: false
            });
            return
        }
        
        //adds to DB
        res.status(200).send({ 
            newEntry: await newMedalOwner(entry),
            success: true
        });

    },

    postAchievement: async (req, res) => {
        const { entry } = req.body

        console.log(`entry`, entry)

        //test request structure before returning
        if (!entry) {
            res.status(400).send({
                message: `Error400: bad request, entry not specified`,
                success: false
                });
            return
        }
        
        //adds to DB
        res.status(200).send({ 
            newEntry: await newAchievementOwner(entry),
            success: true
        });

    },

    getPets: async (req, res) => {
        const { id } = req.params

        console.log(`id`, id)

        //test request structure before returning
        if (!id) {
            res.status(400).send({
                message:`Error400: bad request, id not specified`,
                success: false});
            return
        } 

        //execute function imported from queries
        res.status(200).send({
            pets: await viewPets(id),
            success: true
        });

    },

    getUserMedals: async (req, res) => {
        const { id } = req.params

        console.log(`id`, id)

        //test request structure before returning
        if (!id) {
            res.status(400).send({
                message:`Error400: bad request, id not specified`,
                success: false});
            return
        }

        //execute function imported from queries
        res.status(200).send({
            medals: await viewUserMedals(id),
            success: true
        });
        

    }, 

    getUserAchievements: async (req, res) => {
        const { id } = req.params

        console.log(`id`, id)

        //test request structure before returning
        if (!id) {
            res.status(400).send({
                achievements:`Error400: bad request, id not specified`,
                success: false});
            return
        }

        //execute function imported from queries
        res.status(200).send({
            pets: await viewUserAchievements(id),
            success: true
        });

    }, 

    deletePet: async (req, res) => {
        const { id } = req.params;

        console.log(`id`, id)

        //test request structure before returning
        if (!id) {
            res.status(400).send({
                message:`Error400: bad request, id not specified`,
                success: false});
            return
        }
        
        //removes from DB with the specified id
        await rehomePet(id);
        res.status(200).send({
            message:`id:${id} removed`,
            success: true,
        });

    }, 

    deleteMedal: async (req, res) => {
        const { userId, medalId } = req.params;

        console.log(`userId`, userId)
        console.log(`medalId`, medalId)

        //test request structure before returning
        if (!userId) {
            res.status(400).send({
                message:`Error400: bad request, userId not specified`,
                success: false});
            return
        }

        if (!medalId) {
            res.status(400).send({
                message:`Error400: bad request, medalId not specified`,
                success: false});
            return
        }

        //removes from DB with the specified id
        await removeMedal(userId, medalId);
        res.status(200).send({
            message:`medal ${medalId} with user id:${userId} removed`,
            success: true,
        });
    },

    deleteAchievement: async (req, res) => {
        const { userId, achievementId } = req.params;

        console.log(`userId`, userId)
        console.log(`achievementId`, achievementId)

        //test request structure before returning
        if (!userId) {
            res.status(400).send({
                message:`Error400: bad request, userId not specified`,
                success: false});
            return
        }

        if (!achievementId) {
            res.status(400).send({
                message:`Error400: bad request, achievementId not specified`,
                success: false});
            return
        }
        
        //removes from DB with the specified id
        await removeAchievement(userId, achievementId);
        res.status(200).send({
            message:`achievement ${achievementId} with user id:${userId} removed`,
            success: true,
        });
    },

    putPet: async (req, res) => {
        const { id } = req.params;

        console.log(`id`, id)

        const { entry }  = req.body

        console.log(`entry`, entry)

        //test request structure before returning
        if (!id) {
            res.status(400).send({
                message:`Error400: bad request, id not specified`,
                success: false
            });
            return
        }

        if (!entry) {
            res.status(400).send({
                message: `Error400: bad request, entry not specified`,
                success: false
            });
            return
        }
        
        // edit pet through imported function
        res.status(200).send({
            editedEntry: await editPet(id, entry),
            success: true
        })

    },
}

export default handlerFunctions