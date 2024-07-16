const fishify = (front, back, event) => {
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
  }
  
  export default fishify