import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import '../mansion.css'
import Pet from './Pet'
import Dropdown from './Dropdown'
import PetTag from './PetTag'


const Mansion = () => {

    const navigate = useNavigate()
    const dispatch = useDispatch()
    const userId = useSelector((state) => state.userId)
    const petsToRace = useSelector((state) => state.petsToRace)
    const [currentPets, setCurrentPets] = useState([])
    const [selectedPet, setSelectedPet] = useState([0])
    const [rawPets, setRawPets] = useState([])
    const [petOptions, setPetOptions] = useState([])
    const [loadingCoords, setLoadingCoords] = useState([150, 150, 150, 150, 150, 150, 150, 150, 150, 150, ])
    
    // returns to the login page and clears state
    const handleLogout = async () => {
        const res = await axios.get('/api/get_logout')

        if (res.data.success) {
            dispatch({
                type: "LOGOUT"
            })

            navigate('/')
        }
    }

    // a class for pets, currently used only for creation
    class pet {
        constructor(petName, hunger, hungerDefault, speed, swim, jump, luck, frontHalf, backHalf) {    
          this.petName = petName
          this.hunger = hunger
          this.hungerDefault = hungerDefault
          this.speed = speed  
          this.swim = swim
          this.jump = jump
          this.luck = luck
          this.frontHalf = frontHalf
          this.backHalf = backHalf
          this.userId = userId   
          }
      }
    

    //this function fetches the data for all pets belonging to the logged in user from the database. It also allows the user to feed and rename pets
      //TODO a pet / brush function would go here
    const loadPets = async () => {
        // console.log(`userId`, userId)
        if (userId) {
            const {data} = await axios.get(`/api/get_pets/${userId}`)
            let petDataFromBackEnd = data.pets

              const selectPets = petDataFromBackEnd.map((pet, i) => {
                
                return <option key={i} value={pet}>{pet.petName}</option>
              })
              setPetOptions(selectPets)

            //increases the hunger of a pet by 20, to max of 100, then recursively calls loadPets
            const feedPet = async (id, hunger) => {
                if (hunger < 100) {
                let foodCount
                if (80 < hunger) {foodCount = 100 - hunger}
                else { foodCount = 20 }
                let entry = {hunger: hunger + foodCount}
                let body = {}
                body.entry = entry
                console.log(`body`, body)
                    console.log(`fired`)
                    await axios.put(`/api/put_pet/${id}`, body)
                    loadPets() 
                } 
            }

            // renames a pet, then recursively calls loadPets
            const renamePet = async (id, newName) => {
                let entry = {petName: newName}
                let body = {}
                body.entry = entry
                console.log(`body`, body)
                await axios.put(`/api/put_pet/${id}`, body)
                loadPets()  
            }

            // rehomes a pet, then recursively calls loadPets
            const rehomePet = async (id) => {
                await axios.delete(`/api/delete_pet/${id}`)
                loadPets()
            }
            
            // create an array to contain all pets as pet components
            let petsInMansion = []
            petDataFromBackEnd.forEach((pet, i) => {
                // console.log(pet)
            
                petsInMansion.push(< PetTag 
                    pet={pet}
                    key={i}
                    feedPet={feedPet}
                    renamePet={renamePet}
                    rehomePet={rehomePet}
                />)
               
                   
            })

        setRawPets(petDataFromBackEnd)
        setCurrentPets(petsInMansion)
        }
    }
    
    const speciesOptions = [
      `dog`,
      `cat`,
      `rock`,
      `fish`,
      `hamster`,
      `rabbit`,
      `parrot`,
      `pigeon`,
      `unicorn`,
      `black cat`,
    ];
    
    // a pseudorandom generator for species
        // TODO assign the correct weights to the random generator; unicorn should be rare, dog should be common
    const randomPetSpecies = () => {
      let species =
        speciesOptions[Math.floor(Math.random() * speciesOptions.length)];
      return species;
    };
    
    // a pseudorandom generator to make a new pet, using the class defined above
    const randomPet = async (petName, species, preset) => {
    
      const newPet = new pet
      newPet.petName = petName
      newPet.hunger = 90
      newPet.frontHalf = species
      newPet.backHalf = species
      
      // an array containing keys to be looped over 
      const statsToBeRolled = [`hungerDefault`, `speed`, `swim`, `jump`, `luck`]

      for (let stat of statsToBeRolled) {
        // the preset contains the lower and upper thresholds for generation
        let statArray = preset[stat];
        // generate a random number between the lower and upper bounds with even distribution
        let statRoll = Math.random() * (statArray[1] + 0.99 - statArray[0]) + statArray[0];
        // turn the result into a simple integer
        let result = Math.floor(statRoll);
        // console.log(`stat`, stat, `Array`, statArray);
        // console.log(`result`, result);
        newPet[stat] = result
      };

      const addPetToDB = async (entry) => {
        console.log(`entry`, entry)
        let body = {}
        body.entry = entry
        await axios.post(`/api/post_pet`, body)   
      }
      // console.log(newPet)

      // await the creation of a new pet in the database, then load the pets
      await addPetToDB(newPet) 
      loadPets()
      return newPet
    }

    // calls the random pet function with the presets defined by a randomly defined species
const createPet = (petName) => {
    let newPetSpecies = randomPetSpecies();
    
    switch (newPetSpecies) {
        case `cat`:
          return randomPet(petName,`cat`, {
            hungerDefault: [1, 5],
            speed: [5, 10],
            jump: [3, 10],
            swim: [1, 3],
            luck: [1, 5],
          });
          
        case `rabbit`:
          return randomPet(petName, `rabbit`, {
            hungerDefault: [1, 5],
            speed: [5, 10],
            jump: [8, 10],
            swim: [1, 3],
            luck: [1, 5],
          });
          
        case `hamster`:
          return randomPet(petName, `hamster`, {
            hungerDefault: [1, 3],
            speed: [5, 10],
            jump: [1, 1],
            swim: [1, 1],
            luck: [0, 0],
          });
          
        case `unicorn`:
          return randomPet(petName, `unicorn`, {
            hungerDefault: [0, 0],
            speed: [8, 10],
            jump: [8, 10],
            swim: [5, 10],
            luck: [10, 10],
          });
          
        case `parrot`:
          return randomPet(petName, `parrot`, {
            hungerDefault: [1, 10],
            speed: [1, 5],
            jump: [20, 20],
            swim: [0, 0],
            luck: [5, 10],
          });
          
        case `pigeon`:
          return randomPet(petName, `pigeon`, {
            hungerDefault: [3, 10],
            speed: [1, 5],
            jump: [5, 10],
            swim: [0, 0],
            luck: [1, 1],
          });
          
        case `black cat`:
          return randomPet(petName, `black cat`, {
            hungerDefault: [1, 5],
            speed: [5, 10],
            jump: [3, 10],
            swim: [1, 3],
            luck: [5, 10],
          });
          
        case `rock`:
          return randomPet(petName, `rock`, {
            hungerDefault: [0, 0],
            speed: [0, 0],
            jump: [0, 0],
            swim: [0, 0],
            luck: [20, 20],
          });
          
        case `fish`:
          return randomPet(petName, `fish`, {
            hungerDefault: [1, 3],
            speed: [1, 10],
            jump: [0, 0],
            swim: [8, 10],
            luck: [1, 5],
          });
          
        default:
          return randomPet(petName, 'dog', {
            hungerDefault: [3, 10],
            speed: [3, 10],
            jump: [3, 10],
            swim: [3, 10],
            luck: [1, 5],
          });
      }
};

// loads pets on initial access, and if the userId changes state with sessionCheck in App.jsx)
    useEffect(()=> {
        loadPets()
    }, [userId])

  useEffect(()=> {

  if (rawPets.length > 0) {
    // console.log( `cooords`, loadingCoords)
    let grabbing
    // let hoverIndex = null
    // let hoverX = null
    // let hoverY = null
    let grabIndex
    let grabX = null
    let grabY = null
    const mansion = document.getElementById("canvas")

    let relativeLoadingCoords = []
    let relativeLoadingYCoords = []

    for (let i = 0; i < rawPets.length; i++) {
      console.log(mansion.width)
      relativeLoadingCoords.push(Math.floor((mansion.width - 60)/ rawPets.length) * i + 60)
    }

    console.log(relativeLoadingCoords)
    console.log(`rawPets`, rawPets)

    mansion.addEventListener('mousedown', (e) => {
      const rect = mansion.getBoundingClientRect()
        let x = e.clientX - rect.left / (rect.right - rect.left) * mansion.width
        let y = e.clientY - rect.top / (rect.bottom - rect.top) * mansion.height

        x = x/3
        y = y/4.5
        
        console.log(`x`, x, `y`, y)
        console.log(`relLoadingCoords`, relativeLoadingCoords)
        console.log(`relLoadingYCoords`, relativeLoadingYCoords)

        
        // if

        let closest
        for (let i = 0; i < relativeLoadingCoords.length; i++ ) {
          if (Math.abs(y-relativeLoadingYCoords[i])-15 < 10) {
            if (Math.abs(x-relativeLoadingCoords[i])-10 < 10 && closest === undefined) closest = i
            else if (Math.abs(x-relativeLoadingCoords[i])-10 < 10 && Math.abs(x-relativeLoadingCoords[i]) < Math.abs(x-relativeLoadingCoords[closest])) closest = i
          } else {
          }
        }
          grabbing = true
          setSelectedPet(closest)
          grabIndex = closest
        console.log(`closest`, grabIndex, grabbing)
    },false )

    mansion.addEventListener('mousemove', (e) => {
      
      const rect = mansion.getBoundingClientRect()
      let x = e.clientX - rect.left / (rect.right - rect.left) * mansion.width
      let y = e.clientY - rect.top / (rect.bottom - rect.top) * mansion.height

      x = x/3
      y = y/4.5
      // hoverX = x
      // hoverY = y

      let closest
      for (let i = 0; i < relativeLoadingCoords.length; i++ ) {
        if (Math.abs(y-relativeLoadingYCoords[i])-15 < 10) {
          if (Math.abs(x-relativeLoadingCoords[i])-10 < 10 && closest === undefined) closest = i
          else if (Math.abs(x-relativeLoadingCoords[i])-10 < 10 && Math.abs(x-relativeLoadingCoords[i]) < Math.abs(x-relativeLoadingCoords[closest])) closest = i
        } else {
        }
      }
      // console.log(`closest`, hoverClosest,)

      if (grabbing) {
        grabX = x
        grabY = y
        // hoverIndex = null
        // hoverX = null
        // console.log(`muaha`, x, `muaha`, y)
      } 
      // else if (Math.abs(relativeLoadingCoords[closest]-x-10) <= 5 && Math.abs(relativeLoadingYCoords[closest]-y-10) <= 5) {
      //   hoverIndex = closest
      //   hoverX = x - 10
      //   hoverY = y - 10
      //   console.log(`hoverIndex`, hoverIndex)
      //   console.log(`hoverX`, hoverX, Math.abs(relativeLoadingCoords[closest]-x-10), hoverY, Math.abs(relativeLoadingYCoords[closest]-y-10))
      // } else if (Math.abs(relativeLoadingCoords[hoverIndex]-hoverX-10) > 5 || Math.abs(relativeLoadingYCoords[hoverIndex]-hoverY-10) > 5) {
      //   hoverIndex = null
      //   hoverX = null
      //   console.log(`hoverIndex`, hoverIndex)
      //   console.log(`hoverX`, hoverX, Math.abs(relativeLoadingCoords[closest]-x-10), hoverY, Math.abs(relativeLoadingYCoords[closest]-y-10))
      // }

    
    },false )

    mansion.addEventListener('mouseup', (e) => {
      grabbing = false
      grabIndex = null
      // hoverX = null
      // hoverIndex = null
      grabX = null
      grabY = null
      console.log(`clearing`,)
    },false )
    
    const ctx = mansion.getContext("2d")
    ctx.imageSmoothingEnabled = false
    ctx.scale(1,1)
    
    const petCoords = rawPets.map((pet, i) => {
      // console.log(`pet`, pet, `i`, i)

      relativeLoadingYCoords.push(110)
      return pet = {
        petName: pet.petName,
        x: loadingCoords ?? relativeLoadingCoords[i],
        y: 110,   
      }
      
    })

    const randomFacing = () => {
      let direction = Math.random() > 0.5 ? `left` : `right`
      console.log(direction)
      return direction

    }

    let petsWithImages = petCoords.map((pet) => {
      const image = new Image()
      image.src = "/frontRock.png" 

        pet.front = image
      
      const image2 = new Image()
      image2.src = "/backRock.png" 

        pet.back = image2
      
        pet.direction = randomFacing()
      return pet
    })

      console.log(`init`)
    const intervalId = setInterval(() => {
    ctx.clearRect(0, 0, mansion.width, mansion.height)
    // console.log(`cleared`)
  
    for (let i = 0; i < petsWithImages.length ; i++ ) {
      let pet = petsWithImages[i]

      ctx.save()
      // console.log(`new drawing`)
        if (pet.direction === 'right') {
          // console.log(pet.direction, `x`, pet.x)
          ctx.drawImage(pet.front, pet.x , pet.y , 24, 16)
          ctx.drawImage(pet.back, pet.x , pet.y , 24, 16)
        } else {
          ctx.scale(-1,1)
          // console.log(pet.direction, `x`, pet.x)
          ctx.drawImage(pet.front, -pet.x - 20, pet.y , 24, 16)
          ctx.drawImage(pet.back, -pet.x - 20, pet.y , 24, 16)
        }

        ctx.restore()

      }

    let randomWander = [ -1, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1,]
    let randomWanderIndex = Math.floor(Math.random()*randomWander.length)
    let randomWanderIndex2 = Math.floor(Math.random()*randomWander.length)
    let randomWanderIndex3 = Math.floor(Math.random()*randomWander.length)
    let randomWanderIndex4 = Math.floor(Math.random()*randomWander.length)

    let randomPetIndex = Math.floor(Math.random()*rawPets.length)
    let randomPetIndex2 = Math.floor(Math.random()*rawPets.length)
    let randomPetIndex3 = Math.floor(Math.random()*rawPets.length)
    let randomPetIndex4 = Math.floor(Math.random()*rawPets.length)
     
    let newloadingCoords = [...relativeLoadingCoords]
    let newloadingYCoords = [...relativeLoadingYCoords]

    newloadingCoords[randomPetIndex] = randomWander[randomWanderIndex] + relativeLoadingCoords[randomPetIndex]
    if (newloadingCoords[randomPetIndex] < 60) newloadingCoords[randomPetIndex] = 60
    if (newloadingCoords[randomPetIndex] > 220 ) newloadingCoords[randomPetIndex] = 220 
    if (randomWander[randomWanderIndex] < 0) {petsWithImages[randomPetIndex].direction = `left`}
    if (randomWander[randomWanderIndex] > 0) {petsWithImages[randomPetIndex].direction = `right`}
    petsWithImages[randomPetIndex].x = newloadingCoords[randomPetIndex]
    
    if (petsWithImages.length > 3) {
      newloadingCoords[randomPetIndex2] = randomWander[randomWanderIndex2] + relativeLoadingCoords[randomPetIndex2]
      if (newloadingCoords[randomPetIndex2] < 60) newloadingCoords[randomPetIndex2] = 60
      if (newloadingCoords[randomPetIndex2] > 220 ) newloadingCoords[randomPetIndex2] = 220 
      if (randomWander[randomWanderIndex2] < 0) {petsWithImages[randomPetIndex2].direction = `left`}
      if (randomWander[randomWanderIndex2] > 0) {petsWithImages[randomPetIndex2].direction = `right`}
      petsWithImages[randomPetIndex2].x = newloadingCoords[randomPetIndex2]
    }

    if (petsWithImages.length > 6) {
      newloadingCoords[randomPetIndex3] = randomWander[randomWanderIndex3] + relativeLoadingCoords[randomPetIndex3]
      if (newloadingCoords[randomPetIndex3] < 60) newloadingCoords[randomPetIndex3] = 60
      if (newloadingCoords[randomPetIndex3] > 220 ) newloadingCoords[randomPetIndex3] = 220 
      if (newloadingCoords[randomPetIndex3] < relativeLoadingCoords[randomPetIndex3]) {petsWithImages[randomPetIndex3].direction = `left`}
      if (newloadingCoords[randomPetIndex3] > relativeLoadingCoords[randomPetIndex3]) {petsWithImages[randomPetIndex3].direction = `right`}
      petsWithImages[randomPetIndex3].x = newloadingCoords[randomPetIndex3]
    }
    
    if (petsWithImages.length > 8) {    
      newloadingCoords[randomPetIndex4] = randomWander[randomWanderIndex4] + relativeLoadingCoords[randomPetIndex4]
      if (newloadingCoords[randomPetIndex4] < 60) newloadingCoords[randomPetIndex4] = 60
      if (newloadingCoords[randomPetIndex4] > 220 ) newloadingCoords[randomPetIndex4] = 220 
      if (newloadingCoords[randomPetIndex4] < relativeLoadingCoords[randomPetIndex4]) {petsWithImages[randomPetIndex4].direction = `left`}
      if (newloadingCoords[randomPetIndex4] > relativeLoadingCoords[randomPetIndex4]) {petsWithImages[randomPetIndex4].direction = `right`}
      petsWithImages[randomPetIndex4].x = newloadingCoords[randomPetIndex4]

    }

    let runnerIndex = null // initialize a variable to select a random pet
    let runnerRand = Math.random() // random roll to see if a pet starts running
    // console.log(`runnerRand`, runnerRand)
    
   
    let runnerValue = -2 // set the default pet running movement to be 3 to the left
    if (runnerRand < 0.2 ) { // if the random roll is less than .2
      // console.log(`runner chosen`)

      runnerIndex = Math.floor(Math.random()*rawPets.length) // roll a random indexed pet to be a runner
      // console.log(`runnerIndex`, runnerIndex)
      if (petsWithImages[runnerIndex].direction === 'right') { runnerValue = 2 } // if the pet's direction is right, have them move 3 to the right
      petsWithImages[runnerIndex].isRunning = true
      petsWithImages[runnerIndex].runnerValue = runnerValue
    } 
    // console.log(1/(petsWithImages.length) + .05)
    if (runnerRand > 1/(petsWithImages.length) + .125) {
      // console.log(`fired`)
      runnerIndex = Math.floor(Math.random()*rawPets.length)

      petsWithImages[runnerIndex].isRunning = false
      petsWithImages[runnerIndex].runnerValue = 0
    }
      
      // console.log(`runnerIndex`, runnerIndex)      

      for (let i = 0; i < petsWithImages.length; i++ ) {
        let runner = petsWithImages[i]
        // console.log(runner.isRunning)

        if (newloadingYCoords[i] < 110 && newloadingYCoords[i] > 30) {
          console.log(`should be dropping`)
          if ( newloadingYCoords > 1000 ){

          } else if (newloadingYCoords[i] + 10 > 110) {
          newloadingYCoords[i] = 110
          petsWithImages[i].y = 110
          } else {
          newloadingYCoords[i] = newloadingYCoords[i] + 10
          petsWithImages[i].y = petsWithImages[i].y + 10
          }
        }

        // if (i === hoverIndex ) {
        //   petsWithImages[i].isRunning = false
        //   petsWithImages[i].runnerValue = 0
        // }

        if (i === grabIndex && grabX !== null) {
          petsWithImages[i].isRunning = false
          petsWithImages[i].runnerValue = 0
          if (grabX < 1000){
              if (grabX > 230) grabX = 230
              if (grabX < 60) grabX = 60
          }
          if (grabY < 1000) {
            if (grabY > 140) grabY = 140
            if (grabY < 10) grabY = 10
          }

          petsWithImages[i].x = grabX - 10
          petsWithImages[i].y = grabY - 10
          newloadingCoords[i] = grabX - 10
          newloadingYCoords[i] = grabY - 10          
        }
        
        if (runner.isRunning) {
        // console.log(`runner`, runner)

        if( runner.runnerValue < 0) petsWithImages[i].direction = 'left'
        if( runner.runnerValue > 0) petsWithImages[i].direction = 'right'
        
        newloadingCoords[i] = runner.runnerValue + newloadingCoords[i]
        
        if (newloadingCoords[i] < 60) {newloadingCoords[i] = 60
          petsWithImages[i].direction = `right`
          petsWithImages[i].runnerValue = 2
        }
        if (newloadingCoords[i ] > 220) {newloadingCoords[i ] = 220
          petsWithImages[i].direction = `left`
          petsWithImages[i].runnerValue = -2
        }
        petsWithImages[i].x = newloadingCoords[i]
        }
      }

      // if (hoverIndex !== null) {
      //   console.log(`hoverX`, hoverX)
      //   petsWithImages[hoverIndex].x = hoverX
      //   newloadingCoords[hoverIndex] = hoverX
      // }
      
      setLoadingCoords(newloadingCoords)
      relativeLoadingCoords = [...newloadingCoords]
      relativeLoadingYCoords = [...newloadingYCoords]
    }, 80)

    // setInterval( ()=> {
    //   setStateRunnerIndex(null)
    //   console.log(`clearedRunnerIndex`)
    // }, 4000 )

    return () => {clearInterval(intervalId)
    }
  }
    
}, [rawPets])


    
  // ctx.drawImage("/backRock.png", 200, 150, 32, 32)
  // ctx.drawImage("/frontRock.png", 200, 150, 32, 32)
    
  return (
    <div >
        <div width="100%" height='100%'>Mansion</div>
        <button onClick={handleLogout}>log out</button>
        {rawPets.length < 10 ? <button onClick={() => createPet(`new pet`)}>adopt a pet</button> : <span> you may only have 10 pets</span>}
        < Dropdown options = {rawPets} />
        <button onClick={(() => navigate('/field_race'))}>race these pets!</button>
        {currentPets[selectedPet]}
        <div className='mansion-backdrop'>
            <canvas id="canvas" style={{height: 600, width: 900}}></canvas>
        </div>
    </div>
  )
}

export default Mansion