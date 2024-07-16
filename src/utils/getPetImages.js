const checkImageExists = async (imageUrl) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = imageUrl;
    });
};

function format(str) {
    console.log(str)
    let words = str.split(/\s+/);
    let capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
    let formattedStr = capitalizedWords.join('');
    return formattedStr;
}

const getPetImages = async (pet) => {
    const results = []
    const frontImages = []
    const backImages = []
    const maxAnimations = 4
    for (let i = 0; i < maxAnimations; i++) {
        if (await checkImageExists(`/front${format(pet.frontHalf)}${i}.png`)) {
            frontImages.push(`/front${format(pet.frontHalf)}${i}.png`)
        }

        if (await checkImageExists(`/back${format(pet.backHalf)}${i}.png`)) {
            backImages.push(`/back${format(pet.backHalf)}${i}.png`)
        }
    }
    results.push(frontImages)
    results.push(backImages)
    return results
}

export default getPetImages