import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import '../mansion.css'
import Pet from './Pet'
import getPetImages from '../utils/getPetImages'
import Dropdown from './Dropdown'
import PetTag from './PetTag'



const Mansion = () => {

    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch()
    const userId = location.state !== null ? location.state.userId : useSelector((state) => state.userId)
    const petsToRace = useSelector((state) => state.petsToRace)
    const petsToHybrid = useSelector((state) => state.petsToHybrid)
    const [currentPets, setCurrentPets] = useState([])
    const [selectedPet, setSelectedPet] = useState([0])
    const [rawPets, setRawPets] = useState([])
    const [petOptions, setPetOptions] = useState([])
    const [loadingXCoords, setLoadingXCoords] = useState()
    const [loadingYCoords, setLoadingYCoords] = useState()
    const [petsLoaded, setPetsLoaded] = useState(false)
    const [petIdArray, setPetIdArray] = useState([])
    
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
      if (userId !== null && userId !== undefined) {
            const {data} = await axios.get(`/api/get_pets/${userId}`)
            let petDataFromBackEnd = [...data.pets]

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
            
            petDataFromBackEnd.forEach( (pet, i) => {
              petsInMansion.push(< PetTag 
                pet={{
                  petId: pet.petId,
                  petName:pet.petName,
                  hunger:pet.hunger,
                  speed:pet.speed,
                  swim:pet.swim,
                  jump:pet.jump,
                  luck:pet.luck,
                  frontHalf:pet.frontHalf,
                  backHalf:pet.backHalf,  
                }}
                key={i}
                feedPet={feedPet}
                renamePet={renamePet}
                rehomePet={rehomePet}
                />)
            })

            const createImage = async (src) => {
              return new Promise((resolve, reject) => {
                const image = new Image()
                image.src = src
                image.onload = () => {
                  resolve(image)
                }
                image.onerror = () => reject(console.log(`nope`))
              })
            }
            
        const loadImages = async (i) => {
          console.log(petDataFromBackEnd[i])
          if (petDataFromBackEnd[i].frontHalf === `fish` && petDataFromBackEnd[i].backHalf === `fish`) {
            let front0 = await createImage(`./frontFishBowl0.png`)
            let front1 = await createImage(`./frontFishBowl0.png`)
    
            let back0 = await createImage(`./backFishBowl0.png`)
            let back1 = await createImage(`./backFishBowl0.png`)

            return [front0, front1, back0, back1]

          } else {
            let imageSources = await getPetImages(petDataFromBackEnd[i])
            imageSources = imageSources.flat()

            let front0 = await createImage(imageSources[0])
            let front1 = await createImage(imageSources[1])
      
            let back0 = await createImage(imageSources[2])
            let back1 = await createImage(imageSources[3])
            
            return [front0, front1, back0, back1]
          }
        }

        await Promise.all(petDataFromBackEnd.map( async (pet, i) => {
            
            const images = await loadImages(i)            
            petDataFromBackEnd[i].front0 = images[0]
            petDataFromBackEnd[i].front1 = images[1]
            petDataFromBackEnd[i].back0 = images[2]
            petDataFromBackEnd[i].back1 = images[3]
            })  
          )

          .then(() => {
              setRawPets(petDataFromBackEnd)
              setCurrentPets(petsInMansion)
              setPetsLoaded(true)
            })
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
        newPet[stat] = result
      };

      const addPetToDB = async (entry) => {
        console.log(`entry`, entry)
        let body = {}
        body.entry = entry
        await axios.post(`/api/post_pet`, body)   
      }

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

    // declare variables to be used by the drawing function. These are often updated in functions below
    let grabbing
    let hoverIndex = null
    let hoverX = null
    let hoverY = null
    let grabIndex
    let grabX = null
    let grabY = null

    const mansion = document.getElementById("canvas")
    const mansionBox = mansion.getBoundingClientRect()
      const mansionWidth = mansionBox.right-mansionBox.left 
      const mansionHeight = mansionBox.bottom-mansionBox.top
      
    //scale the canvas
    //scaling of the device that is viewing
    let dpi = window.devicePixelRatio
    canvas.setAttribute('width', mansionWidth * dpi);
    canvas.setAttribute('height', mansionHeight * dpi);

    // set the boundaries, sprite height, ground, and roof according to the scale of the canvas    
    let petHeight = mansion.height/10
    let petWidth = mansion.width/10
    let leftBound = petWidth
    let rightBound = mansion.width - leftBound - petWidth/6
    let topBound = petHeight
    let bottomBound = mansion.height - topBound
    let ground = mansion.height * 3.4/5
    let roof = mansionHeight/3

    // create arrays to track x location and y location on the grid
    let relativeLoadingXCoords = []
    let relativeLoadingYCoords = []

    if (loadingXCoords !== undefined) {
        relativeLoadingXCoords = loadingXCoords
        relativeLoadingYCoords = loadingYCoords

        for (let i = 0; i < rawPets.length-loadingXCoords.length; i++ ){
          relativeLoadingXCoords.push(mansionWidth/2 - petWidth/2)
          relativeLoadingYCoords.push(mansionWidth/2)
        }
    } else {
      for (let i = 0; i < rawPets.length; i++) {
        relativeLoadingXCoords.push((Math.floor((mansion.width * 4/5 )/rawPets.length) * (i+1)))
        relativeLoadingYCoords.push(ground + Math.random() * petHeight - petHeight/2  + topBound)
      }
    }

    // if user clicks, find the closest pet and mark it as closest. The closest pet is indexed so it can be grabbed
    mansion.addEventListener('mousedown', (e) => {
      const rect = mansion.getBoundingClientRect()
        let x = e.clientX - rect.left 
        let y = e.clientY - rect.top 

        x = Math.floor(x) * dpi
        y = Math.floor(y) * dpi

        let closest
        for (let i = 0; i < relativeLoadingXCoords.length; i++ ) {
          if (y >= relativeLoadingYCoords[i] && y - relativeLoadingYCoords[i] <= petHeight * 1.2) {
            if (x >= relativeLoadingXCoords[i] && x - relativeLoadingXCoords[i] <= petWidth * 1.2) {
              if (closest === undefined) {
                closest = i
              } else if (x-relativeLoadingXCoords[i] < x-relativeLoadingXCoords[closest]) {
                closest = i 
              } else {
              }
            }
          }
        }
          grabbing = true
          if (closest !== undefined) setSelectedPet(closest)
          grabIndex = closest
    },false )

    // if a user moves the mouse, find the closest pet to where it moved. 
      // if the pet is being grabbed, match the x and y to the mouse (handled below).
      // if the mouse is hovering over a pet, freeze the pet (handled below).

    mansion.addEventListener('mousemove', (e) => {
      const rect = mansion.getBoundingClientRect()
      let x = e.clientX - rect.left 
      let y = e.clientY - rect.top 

      x = Math.floor(x) * dpi
      y = Math.floor(y) * dpi

      let closest
        for (let i = 0; i < relativeLoadingXCoords.length; i++ ) {
          if (y >= relativeLoadingYCoords[i] && y - relativeLoadingYCoords[i] <= petHeight * 1.2) {
            if (x >= relativeLoadingXCoords[i] && x - relativeLoadingXCoords[i] <= petWidth * 1.2) {
              if (closest === undefined) {
                closest = i
              } else if (x-relativeLoadingXCoords[i] < x-relativeLoadingXCoords[closest]) {
                closest = i 
              } else {
              }
            }
          }
        }

      if (grabbing) {
        grabX = x
        grabY = y
        hoverIndex = null
        hoverX = null
      } else if (closest !== undefined) {
        hoverIndex = closest
        hoverX = x
        hoverY = y
      } else {
        hoverIndex = null
        hoverX = null
           grabX = null
           grabY = null
      }
    },false )

    // if the user releases a click, clear grab
    mansion.addEventListener('mouseup', (e) => {
      grabbing = false
      grabIndex = null
      grabX = null
      grabY = null
    },false )

    // if the mouse leaves the window, clear grab
    mansion.addEventListener('mouseout', (e) => {
      grabbing = false
      grabIndex = null
      grabX = null
      grabY = null
    },false )

    // declare drawing context and set out drawing specifications
    const ctx = mansion.getContext("2d")
    ctx.imageSmoothingEnabled = false
    ctx.scale(1,1)
    ctx.clearRect(0, 0, mansion.width, mansion.height)

    // store the pet IDs in state. this is used to maintain placement of the pets in the grid when one is removed
    let newPetIdArray = []
    rawPets.forEach((pet) => {
      newPetIdArray.push(pet.petId)
    })
    setPetIdArray(newPetIdArray)

    // If there are less pets than stored pet IDs, find the missing one and correct the x and y arrays
    if (petIdArray.length > rawPets.length) {
      console.log(`I, THE CARTESIAN REAPER, HAVE BEEN SUMMONED`, petIdArray.length, rawPets.length)
      
      let DEATHINDEX
      let newPetIdArray = []
      rawPets.forEach((pet, i) => {
        newPetIdArray.push(pet.petId)
      })

      let newPetIdSet = new Set(newPetIdArray)
      console.log(`WHERE ARE MY CHILDREN?`, newPetIdSet)

      petIdArray.forEach((pet, i) => {
        console.log(`HMMMM...`,pet)
        if (!newPetIdSet.has(pet)) { 
          DEATHINDEX = i
          console.log(`MY CHILD, NUMBER ${pet}, HAS BEEN SENT TO ANOTHER PLANE`, DEATHINDEX)
        }
      })
    
      relativeLoadingXCoords.splice(DEATHINDEX,1)
      relativeLoadingYCoords.splice(DEATHINDEX,1)
      setPetIdArray(newPetIdArray)
    }

    // only begin drawing if there is pet data to begin with
    if (rawPets.length > 0) {

    // choose a random direction for pets to face on load
    const randomFacing = () => {
      let direction = Math.random() > 0.5 ? `left` : `right`
      return direction
    }

    // make an array of objects with all the data needed to draw and animate the images
    let petsWithImages = rawPets.map((pet, i) => {
        pet.direction = randomFacing()
        pet.x = relativeLoadingXCoords[i]
        pet.y = relativeLoadingYCoords[i]
        pet.active = false

      return pet
    })

    console.log(`init`, petsWithImages)

    // this function is called every 80 milliseconds to draw an image in 12.5 fps, nice and crunchy for the pixelart
    const drawMansion = () => {

    //copy existing coordinate arrays
    let newloadingXCoords = [...relativeLoadingXCoords]
    let newloadingYCoords = [...relativeLoadingYCoords]

    // determine if a pet is a pure-bred rock
    const rockClause = (i) => { return petsWithImages[i].frontHalf === 'rock' && petsWithImages[i].backHalf === 'rock'}

    // determine if a pet drowns on land
    const fishClause = (i) => { return petsWithImages[i].frontHalf === 'fish' && petsWithImages[i].backHalf == 'fish'}
    
    // silly way to get a 1/15 chance that a selected pet changes direction. This makes me laugh, so its still here
    let randomWander = [ -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,]
    for (let i = 0; i < petsWithImages.length; i++) {
      let randomPetIndex = Math.floor(Math.random()*rawPets.length)
      let randomWanderIndex = Math.floor(Math.random()*randomWander.length)
    
    if (randomWander[randomWanderIndex] < 0 && petsWithImages[randomPetIndex].speed > 0) {
      petsWithImages[randomPetIndex].direction = `left`
    }
    if (randomWander[randomWanderIndex] > 0 && petsWithImages[randomPetIndex].speed > 0) {
      petsWithImages[randomPetIndex].direction = `right`
    }
    }
    

    
    // set the default pet running movement to right
    let baseRunUnit = petWidth/32
    let runnerValue = baseRunUnit 
    
    // initialize a variable to select a random pet and a random roll to see if a pet starts running
    let runnerIndex = null 
    let runnerRand = Math.random() 
    if (runnerRand < 0.2 ) {
      runnerIndex = Math.floor(Math.random()*rawPets.length) // roll a random indexed pet to be a runner
      if (!fishClause(runnerIndex)) {
        if (petsWithImages[runnerIndex].direction === 'left') { runnerValue = -baseRunUnit } // if the pet's direction is left, negative x movement
        petsWithImages[runnerIndex].isRunning = true
        // petsWithImages[runnerIndex].active = true 
        petsWithImages[runnerIndex].runnerValue = runnerValue
      } else {
        petsWithImages[runnerIndex].isRunning = true
        // petsWithImages[runnerIndex].active = true 
        petsWithImages[runnerIndex].runnerValue = 0

      }
    } 

    // single pets never stop running without this little calculation. keeping a separate function helps me read it
    const giveHimABreak = () => {
      return petsWithImages.length > 1 ? 1/(petsWithImages.length) + .125 : 0.75
    }

    if (runnerRand > giveHimABreak()) {
      runnerIndex = Math.floor(Math.random()*rawPets.length)

      petsWithImages[runnerIndex].isRunning = false
      petsWithImages[runnerIndex].runnerValue = 0
    }
      
    // this loop performs the calculations for final pet positions
      for (let i = 0; i < petsWithImages.length; i++ ) {
        let pet = petsWithImages[i]

        // hovering
        if (i === hoverIndex ) {
          pet.isRunning = false
          pet.runnerValue = 0
        }

         // gravity
         if (newloadingYCoords[i] < ground) {
          if (newloadingYCoords[i] < roof && newloadingXCoords[i] > leftBound * 2 && newloadingXCoords[i] < rightBound - leftBound * 2){
          } else if (newloadingYCoords[i] + petHeight / 2 > ground) {
          newloadingYCoords[i] = ground 
          pet.y = ground
          } else {
          newloadingYCoords[i] = newloadingYCoords[i] + petHeight / 2
          pet.y = pet.y + petHeight / 2
          }
        }

        // running
        if (pet.isRunning) {
          if( pet.runnerValue < 0 && pet.speed > 0) pet.direction = 'left'
          if( pet.runnerValue > 0 && pet.speed > 0) pet.direction = 'right'
  
          if (pet.runnerValue < 0) pet.runnerValue = pet.speed * -baseRunUnit 
          if (pet.runnerValue > 0) pet.runnerValue = pet.speed * baseRunUnit 
          
          newloadingXCoords[i] = pet.runnerValue + newloadingXCoords[i]          
          if (newloadingXCoords[i] < leftBound) {newloadingXCoords[i] = leftBound
            pet.direction = `right`
            pet.runnerValue = baseRunUnit
          }
          if (newloadingXCoords[i ] > rightBound) {newloadingXCoords[i ] = rightBound
            pet.direction = `left`
            pet.runnerValue = -baseRunUnit
          }
          pet.x = newloadingXCoords[i]

          if (!fishClause(i) && !rockClause(i) && newloadingYCoords[i] > topBound && newloadingYCoords[i] < bottomBound && (newloadingYCoords[i] < ground + petHeight || newloadingYCoords[i] < roof)){
          let verticalDirection = [ 0, -1, 1, 0,]
            let verticalResult = verticalDirection[Math.floor(Math.random() * (verticalDirection.length - 1))]
            const verticalRandom = baseRunUnit * pet.speed/4 * verticalResult
            newloadingYCoords[i] = verticalRandom + newloadingYCoords[i]
            pet.y = newloadingYCoords[i]}
        }
        
        // grabbing
        if (i === grabIndex && grabX !== null) {
          console.log(`grabbing`, grabIndex, `at`, grabX, grabY )
          pet.isRunning = false
          pet.runnerValue = 0
          
              if (grabX > rightBound) grabX = rightBound
              if (grabX < leftBound) grabX = leftBound
              
              if (grabY < topBound) grabY = topBound
              if (grabY > bottomBound) grabY = bottomBound
              
              pet.x = grabX - petWidth / 2
              pet.y = grabY - petHeight / 2
              newloadingXCoords[i] = grabX - petWidth / 2
              newloadingYCoords[i] = grabY - petHeight / 2        
              
            }
        // animation frames
        if (Math.abs(newloadingXCoords[i] - relativeLoadingXCoords[i]) >= baseRunUnit / petWidth) {
          pet.active = !pet.active
          if (pet.active) {
            // petsWithImages[i].y = petsWithImages[i].y - 3 
          } else {
            // petsWithImages[i].y = petsWithImages[i].y + 4
          }
        } else {
          pet.active = false
        }
          
      }

      if (hoverIndex !== null) {

        // if pet is hungry, chase the cursor
        // petsWithImages[hoverIndex].x = hoverX - petWidth / 2
        // newloadingXCoords[hoverIndex] = hoverX - petHeight / 2
        // if (hoverX > rightBound) hoverX = rightBound - petWidth / 2
        // if (hoverX < leftBound) hoverX = leftBound
        newloadingXCoords[hoverIndex] = relativeLoadingXCoords[hoverIndex]
      }
      
      setLoadingXCoords(newloadingXCoords)
      setLoadingYCoords(newloadingYCoords)
      relativeLoadingXCoords = [...newloadingXCoords]
      relativeLoadingYCoords = [...newloadingYCoords]
       
      let finalPets = petsWithImages.map((pet) => {
         return {
            petName: pet.petName,
            frontHalf: pet.frontHalf,
            backHalf: pet.backHalf,
            back0: pet.back0,
            back1: pet.back1,
            front0: pet.front0,
            front1: pet.front1,
            direction: pet.direction,
            active: pet.active,
            x: pet.x,
            y: pet.y,
         }
      })
      
      finalPets.sort((a, b) => a.y - b.y)
      
      ctx.clearRect(0, 0, mansion.width, mansion.height)
      
      for (let i = 0; i < finalPets.length ; i++ ) {

        const spriteYOffset = (frontHalf, backHalf) => { 
          if (frontHalf === 'hamster' && backHalf === 'hamster') {
            return 1/4 * petHeight
          } else if ((frontHalf === 'parrot' && backHalf === 'parrot') || 
                     (frontHalf === 'pigeon' && backHalf === 'pigeon') ||
                     (frontHalf === 'rabbit'  && backHalf === 'rabbit')) {
            return 3/16 * petHeight 
          } else {
            return 0
          }

        }

        let pet = finalPets[i]
        let scalar = 1
        
        ctx.save()

        if (pet.y < roof) scalar = 1 - (roof - pet.y)/(4 *(roof))
        if (pet.y > ground) scalar = 1 + (pet.y - ground)/(2 *(bottomBound - ground))
        if (pet.active) {
          if (pet.direction === 'right' && pet.back0) {
            ctx.scale(1 ,1)
            ctx.drawImage(pet.front1, pet.x , pet.y + spriteYOffset(pet.frontHalf, pet.backHalf), petWidth * scalar, petHeight * scalar)
            ctx.drawImage(pet.back1, pet.x , pet.y + spriteYOffset(pet.frontHalf, pet.backHalf), petWidth * scalar, petHeight * scalar)
          } else {
            ctx.scale(-1,1)
            ctx.drawImage(pet.front1, -pet.x-petWidth * scalar, pet.y + spriteYOffset(pet.frontHalf, pet.backHalf), petWidth * scalar, petHeight * scalar)
            ctx.drawImage(pet.back1, -pet.x-petWidth * scalar, pet.y + spriteYOffset(pet.frontHalf, pet.backHalf), petWidth * scalar, petHeight * scalar)
          }
        } else {
          if (pet.direction === 'right' && pet.back0) {
            ctx.scale(1,1)
            ctx.drawImage(pet.front0, pet.x , pet.y + spriteYOffset(pet.frontHalf, pet.backHalf), petWidth * scalar, petHeight * scalar)
            ctx.drawImage(pet.back0, pet.x , pet.y + spriteYOffset(pet.frontHalf, pet.backHalf), petWidth * scalar, petHeight * scalar)
          } else {
            ctx.scale(-1,1)
            ctx.drawImage(pet.front0, -pet.x-petWidth * scalar, pet.y + spriteYOffset(pet.frontHalf, pet.backHalf), petWidth * scalar, petHeight * scalar)
            ctx.drawImage(pet.back0, -pet.x-petWidth * scalar, pet.y + spriteYOffset(pet.frontHalf, pet.backHalf), petWidth * scalar, petHeight * scalar)
          }
        }
              
        ctx.restore()
      }
        
      }
      
      const intervalId = setInterval(() => {  
      if (rawPets.length > 0) {
        drawMansion()
      }
    }, 80)

    return () => {clearInterval(intervalId)
    }
  }
    
}, [rawPets, setPetsLoaded])

  return (
    <div >
        <button onClick={handleLogout}>log out</button>
        {rawPets.length < 10 ? <button onClick={() => createPet(`new pet`)}>adopt a pet</button> : <span> you may only have 10 pets</span>}
        < Dropdown options={rawPets} type={'Race'} limit={5}/> 
        {(petsToRace.length > 0) ? <button onClick={(() => navigate('/field_race'))}>race these pets!</button> : <span>  </span>}
        { rawPets.length < 10 ? < Dropdown options={rawPets} type={'Hybrid'} limit={2} loadPets={loadPets}/> : <span> rehome a pet before making a hybrid </span>}
        {currentPets[selectedPet]}
        <div className='mansion-backdrop'>
            <canvas id="canvas" className='canvas'></canvas>
        </div>
    </div>
  )
}

export default Mansion