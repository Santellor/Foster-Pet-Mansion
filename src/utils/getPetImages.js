function checkImageExists(imageUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = imageUrl;
    });
};

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const getPetImages = async (pet) => {
    const results = []
    const frontImages = []
    const backImages = []
    const maxAnimations = 4
    for (let i = 0; i < maxAnimations; i++) {
        if (await checkImageExists(`/front${capitalizeFirstLetter(pet.frontHalf)}${i}.png`)) {
            frontImages.push(`/front${capitalizeFirstLetter(pet.frontHalf)}${i}.png`)
        }

        if (await checkImageExists(`/back${capitalizeFirstLetter(pet.backHalf)}${i}.png`)) {
            backImages.push(`/back${capitalizeFirstLetter(pet.backHalf)}${i}.png`)
        }
    }
    results.push(frontImages)
    results.push(backImages)
    console.log(`All the front images should be here: ${results[0]}`)
    console.log(`All the back images should be here: ${results[1]}`)
    return results
}

export default getPetImages