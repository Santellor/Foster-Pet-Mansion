const fishify = (front, back, event) => {
    console.log(front)
    console.log(back)
    if (event === 'race') {
        if (front === 'fish' && back === 'fish') {
            return {frontHalf: 'fish car', backHalf: 'fish car'}
        }
    }
    if (event === 'bike') {
        if (front === 'fish' && back === 'fish') {
            return {frontHalf: 'fish bowl', backHalf: 'fish bowl'}
        }
    }
    return {frontHalf: front, backHalf: back}
  }
  
  export default fishify