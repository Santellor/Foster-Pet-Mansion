import { 
    db, 
    User, 
    Pet,
    Medal,
    MedalHandler,
    Achievement,
    AchievementHandler
} from './model.js'

import users from './json/users.json' assert { type: 'json' }; 
import pets from './json/pets.json' assert { type: 'json' }; 
import medals from './json/medals.json' assert { type: 'json' }; 
import medal_handler from './json/medal_handler.json' assert { type: 'json' }; 
import achievements from './json/achievements.json' assert { type: 'json' }; 
import achievement_handler from './json/achievement_handler.json' assert { type: 'json' }; 

console.log(`establishing connection to db`)
await db.sync({ force: true})

console.log(`seeding db`)

await Promise.all(users.map( async (user) => {
    // destructure keys from user 
    const {email, username, password } = user;

    //create a record using the values provided 
    const record = User.create({
        email,
        username,
        password,
    });

    return record;

  })
)

await Promise.all(pets.map( async (pet) => {
    // destructure keys from pet 
    const {petName, hunger, hungerDefault, speed, swim, jump, luck, frontHalf, backHalf, userId } = pet;

    //create a record using the values provided 
    const record = Pet.create({
        petName, 
        hunger, 
        hungerDefault, 
        speed, 
        swim, 
        jump, 
        luck, 
        frontHalf, 
        backHalf, 
        userId 
    });

    return record;

  })
)

await Promise.all(medals.map( async (medal) => {
    // destructure keys from user 
    const {type } = medal;

    //create a record using the values provided 
    const record = Medal.create({
        type,
    });

    return record;

  })
)

await Promise.all(achievements.map( async (achievement) => {
    // destructure keys from user 
    const {type, description } = achievement;

    //create a record using the values provided 
    const record = Achievement.create({
        type,
        description
    });

    return record;

  })
)

await Promise.all(achievement_handler.map( async (achievement) => {
    // destructure keys from user 
    const {achievementId, userId } = achievement;

    //create a record using the values provided 
    const record = AchievementHandler.create({
        userId,
        achievementId
    });

    return record;

  })
)

await Promise.all(medal_handler.map( async (medal) => {
    // destructure keys from user 
    const {medalId, userId } = medal;

    //create a record using the values provided 
    const record = MedalHandler.create({
        medalId,
        userId
    });

    return record;

  })
)

await db.close()