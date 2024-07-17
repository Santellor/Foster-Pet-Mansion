const generateRandomPet = () => {
    const allSpecies = [
        {name: 'rock', weight: 9, speed: [0, 0], swim: [0, 0], jump: [0, 0], luck: [20, 20]},
        {name: 'dog', weight: 20, speed: [3, 10], swim: [3, 10], jump: [3, 10], luck: [1, 5]},
        {name: 'cat', weight: 20, speed: [5, 10], swim: [1, 3], jump: [5, 10], luck: [1, 5]},
        {name: 'fish', weight: 10, speed: [1, 10], swim: [8, 10], jump: [0, 0], luck: [1, 5]},
        {name: 'hamster', weight: 10, speed: [5, 10], swim: [1, 1], jump: [1, 1], luck: [0, 0]},
        {name: 'rabbit', weight: 10, speed: [8, 10], swim: [1, 3], jump: [8, 10], luck: [1, 5]},
        {name: 'pigeon', weight: 10, speed: [1, 5], swim: [1, 5], jump: [15, 15], luck: [1, 1]},
        {name: 'black cat', weight: 5, speed: [5, 10], swim: [1, 3], jump: [5, 10], luck: [5, 10]},
        {name: 'parrot', weight: 5, speed: [1, 5], swim: [1, 5], jump: [20, 20], luck: [5, 10]},
        {name: 'unicorn', weight: 1, speed: [8, 10], swim: [8, 10], jump: [8, 10], luck: [10, 10]}
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