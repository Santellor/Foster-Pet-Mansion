// Function to generate a new pet by hybridizing two parent pets and save it to the database
const hybridizePets = async (parent1, parent2, userId) => {
    // Randomly select front and back halves from the parents
    const frontHalf = Math.random() < 0.5 ? parent1.frontHalf : parent2.frontHalf;
    const backHalf = Math.random() < 0.5 ? parent1.backHalf : parent2.backHalf;

    // Calculate stat ranges for the new pet
    const statRanges = {
        speed: [Math.min(parent1.speed, parent2.speed), Math.max(parent1.speed, parent2.speed)],
        swim: [Math.min(parent1.swim, parent2.swim), Math.max(parent1.swim, parent2.swim)],
        jump: [Math.min(parent1.jump, parent2.jump), Math.max(parent1.jump, parent2.jump)],
        luck: [Math.min(parent1.luck, parent2.luck), Math.max(parent1.luck, parent2.luck)],
        hungerDefault: [Math.min(parent1.hungerDefault, parent2.hungerDefault), Math.max(parent1.hungerDefault, parent2.hungerDefault)]
    };

    // Generate random stats based on the calculated ranges
    const getRandomValueInRange = (range) => {
        const [min, max] = range;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    const randomSpeed = getRandomValueInRange(statRanges.speed);
    const randomSwim = getRandomValueInRange(statRanges.swim);
    const randomJump = getRandomValueInRange(statRanges.jump);
    const randomLuck = getRandomValueInRange(statRanges.luck);
    const randomHungerDefault = getRandomValueInRange(statRanges.hungerDefault);

    try {
        // Create the new pet in the database
        const entry = {
            petName: 'new pet',
            frontHalf: frontHalf,
            backHalf: backHalf,
            hunger: 100,
            speed: randomSpeed,
            swim: randomSwim,
            jump: randomJump,
            luck: randomLuck,
            hungerDefault: randomHungerDefault,
            userId: userId
        }
        const newPet = await axios.post('/api/post_pet',{
            entry: entry
        });

        //remove parents
        await axios.delete(`/api/delete_pet/${parent1.petId}`)
        await axios.delete(`/api/delete_pet/${parent2.petId}`)

        // Return the newly created pet object
        return newPet;
    } catch (error) {
        console.error('Error creating hybrid pet:', error);
        throw error; // Rethrow the error for handling in the caller function
    }
};

// Export the hybridizePets function to be used elsewhere
export default hybridizePets;