const generateRandomPet = () => {
    const allSpecies = [
        //{name: 'rock', weight: 500, speed: [0, 0], swim: [0, 0], jump: [0, 0], luck: [20, 20]},
        {name: 'pyro avigator', weight: 500, speed: [1, 9], swim: [1, 3], jump: [1, 9], luck: [1, 5]}
    ];

    // Calculate total weight
    const totalWeight = allSpecies.reduce((total, species) => total + species.weight, 0);

    // Generate a random number between 1 and totalWeight
    const randomNumber = Math.floor(Math.random() * totalWeight) + 1;

    // Determine the species based on the random number and weights
    let cumulativeWeight = 0;
    let selectedSpecies = null;
    for (let i = 0; i < allSpecies.length; i++) {
        cumulativeWeight += allSpecies[i].weight;
        if (randomNumber <= cumulativeWeight) {
            selectedSpecies = allSpecies[i];
            break;
        }
    }

    // Generate random stats based on the range specified in selectedSpecies
    const getRandomValueInRange = (range) => {
        const [min, max] = range;
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    const randomSpeed = getRandomValueInRange(selectedSpecies.speed);
    const randomSwim = getRandomValueInRange(selectedSpecies.swim);
    const randomJump = getRandomValueInRange(selectedSpecies.jump);
    const randomLuck = getRandomValueInRange(selectedSpecies.luck);

    // Return the generated pet object
    return {
        species: selectedSpecies.name,
        frontHalf: selectedSpecies.name,
        backHalf: selectedSpecies.name,
        hunger: 100,
        speed: randomSpeed,
        swim: randomSwim,
        jump: randomJump,
        luck: randomLuck
    };
};

export default generateRandomPet