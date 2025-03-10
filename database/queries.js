import { Op } from 'sequelize'
import { 
    db, 
    User, 
    Pet,
    Medal,
    MedalHandler,
    Achievement,
    AchievementHandler
} from './model.js'


// view entries
const viewPets = async (id) => {
    return await Pet.findAll({
        where: 
            { userId: id},
        order: ['petId']
    })
}

const viewUserMedals = async (id) => {
    let medals = await MedalHandler.findAll({
        where: 
            { userId: id},
        attributes:
            { exclude: [`userId`, `medalHandlerId`] }
    })

    console.log(medals)
    return medals
    //return skimmedMedals
}

const viewUserAchievements = async (id) => {
    let achievements = await AchievementHandler.findAll({
        where: 
            { userId: id},
        attributes:
            { exclude: [`userId`, `achievementHandlerId`] }
    })

    console.log(achievements)
    return achievements
    //return skimmedMedals
}



// new entries
const newPet = async (entry) => {

    // entry example
        // petName: buster,
        // hunger: 100,
        // hungerDefault: 5, 
        // speed: 8, 
        // swim: 4, 
        // jump: 5, 
        // luck: 2, 
        // frontHalf: dog, 
        // backHalf: dog, 
        // userId: 0

    // catch if there is no entry object
    if (entry === undefined) return 'No entry'

    //create a record using the values provided 
    const pet = await Pet.create(entry);

    return pet;
}

const newAchievementOwner = async (entry) => {

    // catch if there is no entry object
    if (entry === undefined) return 'No entry'

    //create a record using the values provided 
    const achievement = await AchievementHandler.create({
        achievementId: entry.achievementId,
        userId: entry.userId,
    });

    return achievement;
}

const newMedalOwner = async (entry) => {

    // catch if there is no entry object
    if (entry === undefined) return 'No entry'

    //create a record using the values provided 
    const medal = await MedalHandler.create({
        medalId: entry.medalId,
        userId: entry.userId,
    });

    return medal;
}

//delete entry

const rehomePet = async (id) => {
    
    const target = await Pet.findByPk(id)

    return target? await target.destroy() : `record at id:${id} does not exist`;
}

const removeMedal = async (userId, medalId) => {
    
    const target = await MedalHandler.findOne({
        where: {
            medalId: medalId,
            userId: userId
        }
    })

    return target? await target.destroy() : `record at id:${id} does not exist`;
}

const removeAchievement = async (userId, achievementId) => {
    
    const target = await AchievementHandler.findOne({
        where: {
            achievementId: achievementId,
            userId: userId
        }
    })

    return target? await target.destroy() : `record at id:${id} does not exist`;
}

// edit entry 

const editPet = async (id, entry) => {

    // entry example
        // petName: buster,
        // hunger: 100,
        // hungerDefault: 5, 
        // speed: 8, 
        // swim: 4, 
        // jump: 5, 
        // luck: 2, 
        // frontHalf: dog, 
        // backHalf: dog, 
        // userId: 0 
    // any of these can be left out in an entry - only specified KV pairs will be overridden

    // catch if there is no entry object
    if (entry === undefined) return 'No entry'

    const target = await Pet.findByPk(id)

    return await target.update(entry);
}

export { newPet, 
         newMedalOwner, 
         newAchievementOwner, 
         viewPets, 
         viewUserMedals, 
         viewUserAchievements, 
         rehomePet, 
         removeMedal,
         removeAchievement,
         editPet
        }