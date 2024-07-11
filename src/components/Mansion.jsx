import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import '../mansion.css'
import Pet from './Pet'
import getPetImages from '../utils/getPetImages'
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
    const [loadingXCoords, setLoadingXCoords] = useState()
    const [loadingYCoords, setLoadingYCoords] = useState()
    const [petsLoaded, setPetsLoaded] = useState(false)
    
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
              
            

        const dataToState = () => {
          console.log(`petDataFromBackEnd`, petDataFromBackEnd[0])
          console.log(`pets in mansion`, petsInMansion[0])
          setRawPets(petDataFromBackEnd)
          setCurrentPets(petsInMansion)
          setPetsLoaded(true)
        }

        const loadImages = async (i) => {
          let imageSources = await getPetImages(petDataFromBackEnd[i])
          imageSources = imageSources.flat()
          // console.log(imageSources)
    
          let front0 = await createImage(imageSources[0])
          let front1 = await createImage(imageSources[1])
    
          let back0 = await createImage(imageSources[2])
          let back1 = await createImage(imageSources[3])
          
        return [front0, front1, back0, back1]
        }

        await Promise.all(petDataFromBackEnd.map( async (pet, i) => {
            // console.log(pet)
            
            const images = await loadImages(i)
            console.log(`should be first`)
            
            petDataFromBackEnd[i].front0 = images[0]
            petDataFromBackEnd[i].front1 = images[1]
            petDataFromBackEnd[i].back0 = images[2]
            petDataFromBackEnd[i].back1 = images[3]
            
            petsInMansion.push(< PetTag 
              pet={pet}
              key={i}
              feedPet={feedPet}
              renamePet={renamePet}
              rehomePet={rehomePet}
              />)
              
            })
          )
          .then(() => {
              // console.log(`sneaky boy is skipping class`)
              dataToState()
              // console.log(`sneaky boy is skipping class again`)
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

    console.log(currentPets)
    console.log(rawPets)

  if (petsLoaded) {
    
    // console.log( `cooords`, loadingCoords)
    let grabbing
    let hoverIndex = null
    let hoverX = null
    let hoverY = null
    let grabIndex
    let grabX = null
    let grabY = null
    let dpi = window.devicePixelRatio
    const mansion = document.getElementById("canvas")
    const mansionBox = mansion.getBoundingClientRect()
      const mansionWidth = mansionBox.right-mansionBox.left 
      const mansionHeight = mansionBox.bottom-mansionBox.top
      
    //scale the canvas
    canvas.setAttribute('width', mansionWidth * dpi);
    canvas.setAttribute('height', mansionHeight * dpi);
    
    console.log(mansion.width, mansion.height)
    let petHeight = mansion.height/10
    let petWidth = mansion.width/10
    let leftBound = petWidth
    let rightBound = mansion.width - leftBound
    let topBound = petHeight
    let bottomBound = mansion.height - topBound
    let ground = mansion.height * 3/4
    let roof = mansionHeight/4

    console.log(`leftBound`, leftBound)
    console.log(`rightBound`, rightBound)
    console.log(`topBound`, topBound)
    console.log(`bottomBound`, bottomBound,)
    console.log(`ground`, ground)
    console.log(`roof`, roof)
    console.log(`rawPets`, rawPets)
    console.log(`dpi`, dpi)
    let relativeLoadingXCoords = []
    let relativeLoadingYCoords = []

    if (loadingXCoords !== undefined) {
        relativeLoadingXCoords = loadingXCoords
        relativeLoadingYCoords = loadingYCoords
    } else {
      for (let i = 0; i < rawPets.length; i++) {
        relativeLoadingXCoords.push(Math.floor((mansion.width * 2 / 3)/rawPets.length) * (i+1))
        relativeLoadingYCoords.push(ground + Math.random() * petHeight - petHeight/2)
      }
    }
    console.log(`relLoadingXCoords`, relativeLoadingXCoords)
    console.log(`relLoadingYCoords`, relativeLoadingYCoords)
    console.log(`rawPets`, rawPets)

    mansion.addEventListener('mousedown', (e) => {
      const rect = mansion.getBoundingClientRect()
        let x = e.clientX - rect.left 
        let y = e.clientY - rect.top 

        x = Math.floor(x) * dpi
        y = Math.floor(y) * dpi
        
        console.log(`x`, x, `y`, y)        
        // if

        let closest
        for (let i = 0; i < relativeLoadingXCoords.length; i++ ) {
          if (y >= relativeLoadingYCoords[i] && y - relativeLoadingYCoords[i] <= petHeight ) {
            if (x >= relativeLoadingXCoords[i] && x - relativeLoadingXCoords[i] <= petWidth) {
              if (closest === undefined) {
                closest = i
                console.log(`solo`, closest) 
              } else if (x-relativeLoadingXCoords[i] < x-relativeLoadingXCoords[closest]) {
                closest = i 
                console.log(`close`) 
              } else {
              }
            }
          }
        }
          grabbing = true
          if (closest !== undefined) setSelectedPet(closest)
          grabIndex = closest
        console.log(`closest`, grabIndex, grabbing)
    },false )

    mansion.addEventListener('mousemove', (e) => {
      
      const rect = mansion.getBoundingClientRect()
      let x = e.clientX - rect.left 
      let y = e.clientY - rect.top 

      x = Math.floor(x) * dpi
      y = Math.floor(y) * dpi

      let closest
        for (let i = 0; i < relativeLoadingXCoords.length; i++ ) {
          if (y >= relativeLoadingYCoords[i] && y - relativeLoadingYCoords[i] <= petHeight ) {
            if (x >= relativeLoadingXCoords[i] && x - relativeLoadingXCoords[i] <= petWidth) {
              if (closest === undefined) {
                closest = i
                console.log(`solo`, closest) 
              } else if (x-relativeLoadingXCoords[i] < x-relativeLoadingXCoords[closest]) {
                closest = i 
                console.log(`close`) 
              } else {
              }
            }
          }
        }
      // console.log(`closest`, hoverClosest,)

      if (grabbing) {
        grabX = x
        grabY = y
        hoverIndex = null
        hoverX = null
        // console.log(`muaha`, x, `muaha`, y)
      } else if (closest !== undefined) {
        hoverIndex = closest
        hoverX = x
        hoverY = y
        console.log(`hoverIndex`, hoverIndex)
      } else {
        hoverIndex = null
        hoverX = null
           grabX = null
           grabY = null
      }
    },false )

    mansion.addEventListener('mouseup', (e) => {
      grabbing = false
      grabIndex = null
      grabX = null
      grabY = null
      console.log(`clearing`,)
    },false )
    
    const ctx = mansion.getContext("2d")
    ctx.imageSmoothingEnabled = false
    ctx.scale(1,1)

    const petCoords = rawPets.map((pet, i) => {
      // console.log(`pet`, pet, `i`, i)
      // console.log(relativeLoadingXCoords)
      let newPet = pet
      newPet.x = relativeLoadingXCoords[i]
      newPet.y = relativeLoadingYCoords[i]

      return newPet      
    })
    console.log(`petCoords`, petCoords)
    const randomFacing = () => {
      let direction = Math.random() > 0.5 ? `left` : `right`
      console.log(direction)
      return direction
    }

    let petsWithImages = petCoords.map((pet) => {
      
        pet.direction = randomFacing()
      // console.log(`pet in map`, pet)


      return pet
    })

    console.log(`init`)

    const drawMansion = () => {
    
    // console.log(`petsWithImages`, petsWithImages)
    ctx.clearRect(0, 0, mansion.width, mansion.height)
    // console.log(`cleared`)
  
    for (let i = 0; i < petsWithImages.length ; i++ ) {
      let pet = petsWithImages[i]
      // console.log(`pet in draw`, pet.back0)

      ctx.save()
      // console.log(`new drawing`)
        if (pet.direction === 'right' && pet.back0) {
          // console.log(pet.direction, `x`, pet.x)
          ctx.drawImage(pet.front0, pet.x , pet.y , petWidth, petHeight)
          ctx.drawImage(pet.back0, pet.x , pet.y , petWidth, petHeight)
        } else {
          ctx.scale(-1,1)
          ctx.trans
          // console.log(pet.direction, `x`, pet.x)
          ctx.drawImage(pet.front0, -pet.x-petWidth, pet.y , petWidth, petHeight)
          ctx.drawImage(pet.back0, -pet.x-petWidth, pet.y , petWidth, petHeight)
        }

        ctx.restore()

      }

    let randomWander = [ -2, -0.01, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.01, 2,]
    // let randomWander = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,]
    let randomWanderIndex = Math.floor(Math.random()*randomWander.length)
    let randomWanderIndex2 = Math.floor(Math.random()*randomWander.length)
    let randomWanderIndex3 = Math.floor(Math.random()*randomWander.length)
    let randomWanderIndex4 = Math.floor(Math.random()*randomWander.length)

    let randomPetIndex = Math.floor(Math.random()*rawPets.length)
    let randomPetIndex2 = Math.floor(Math.random()*rawPets.length)
    let randomPetIndex3 = Math.floor(Math.random()*rawPets.length)
    let randomPetIndex4 = Math.floor(Math.random()*rawPets.length)
     
    let newloadingXCoords = [...relativeLoadingXCoords]
    let newloadingYCoords = [...relativeLoadingYCoords]

    newloadingXCoords[randomPetIndex] = randomWander[randomWanderIndex] + relativeLoadingXCoords[randomPetIndex]
    if (newloadingXCoords[randomPetIndex] < leftBound) newloadingXCoords[randomPetIndex] = leftBound
    if (newloadingXCoords[randomPetIndex] > rightBound ) newloadingXCoords[randomPetIndex] = rightBound 
    if (randomWander[randomWanderIndex] < 0) {petsWithImages[randomPetIndex].direction = `left`}
    if (randomWander[randomWanderIndex] > 0) {petsWithImages[randomPetIndex].direction = `right`}
    petsWithImages[randomPetIndex].x = newloadingXCoords[randomPetIndex]
    
    if (petsWithImages.length > 3) {
      newloadingXCoords[randomPetIndex2] = randomWander[randomWanderIndex2] + relativeLoadingXCoords[randomPetIndex2]
      if (newloadingXCoords[randomPetIndex2] < leftBound) newloadingXCoords[randomPetIndex2] = leftBound
      if (newloadingXCoords[randomPetIndex2] > rightBound ) newloadingXCoords[randomPetIndex2] = rightBound 
      if (randomWander[randomWanderIndex2] < 0) {petsWithImages[randomPetIndex2].direction = `left`}
      if (randomWander[randomWanderIndex2] > 0) {petsWithImages[randomPetIndex2].direction = `right`}
      petsWithImages[randomPetIndex2].x = newloadingXCoords[randomPetIndex2]
    }

    if (petsWithImages.length > 6) {
      newloadingXCoords[randomPetIndex3] = randomWander[randomWanderIndex3] + relativeLoadingXCoords[randomPetIndex3]
      if (newloadingXCoords[randomPetIndex3] < leftBound) newloadingXCoords[randomPetIndex3] = leftBound
      if (newloadingXCoords[randomPetIndex3] > rightBound ) newloadingXCoords[randomPetIndex3] = rightBound 
      if (newloadingXCoords[randomPetIndex3] < relativeLoadingXCoords[randomPetIndex3]) {petsWithImages[randomPetIndex3].direction = `left`}
      if (newloadingXCoords[randomPetIndex3] > relativeLoadingXCoords[randomPetIndex3]) {petsWithImages[randomPetIndex3].direction = `right`}
      petsWithImages[randomPetIndex3].x = newloadingXCoords[randomPetIndex3]
    }
    
    if (petsWithImages.length > 8) {    
      newloadingXCoords[randomPetIndex4] = randomWander[randomWanderIndex4] + relativeLoadingXCoords[randomPetIndex4]
      if (newloadingXCoords[randomPetIndex4] < leftBound) newloadingXCoords[randomPetIndex4] = leftBound
      if (newloadingXCoords[randomPetIndex4] > rightBound ) newloadingXCoords[randomPetIndex4] = rightBound 
      if (newloadingXCoords[randomPetIndex4] < relativeLoadingXCoords[randomPetIndex4]) {petsWithImages[randomPetIndex4].direction = `left`}
      if (newloadingXCoords[randomPetIndex4] > relativeLoadingXCoords[randomPetIndex4]) {petsWithImages[randomPetIndex4].direction = `right`}
      petsWithImages[randomPetIndex4].x = newloadingXCoords[randomPetIndex4]

    }

    let runnerIndex = null // initialize a variable to select a random pet
    
    let runnerRand = Math.random() // random roll to see if a pet starts running
    // console.log(`runnerRand`, runnerRand)
    
   
    let runnerValue = -5 // set the default pet running movement to be 3 to the left
    if (runnerRand < 0.2 ) { // if the random roll is less than .2
      // console.log(`runner chosen`)

      runnerIndex = Math.floor(Math.random()*rawPets.length) // roll a random indexed pet to be a runner
      // console.log(`runnerIndex`, runnerIndex)
      if (petsWithImages[runnerIndex].direction === 'right') { runnerValue = 5 } // if the pet's direction is right, have them move 3 to the right
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

        if (newloadingYCoords[i] < ground && newloadingYCoords[i] > roof) {
          console.log(`should be dropping`)
          

          if (newloadingYCoords[i] + 40 > ground) {
          newloadingYCoords[i] = ground + Math.random() * petHeight/4 - Math.random() * petHeight/4
          petsWithImages[i].y = ground + Math.random() * petHeight/4 - Math.random() * petHeight/4
          } else {
          newloadingYCoords[i] = newloadingYCoords[i] + 40
          petsWithImages[i].y = petsWithImages[i].y + 40
          }
        }
        

        if (i === hoverIndex ) {
          petsWithImages[i].isRunning = false
          petsWithImages[i].runnerValue = 0
        }
        if (i === grabIndex && grabX !== null) {
          console.log(`grabbing`, grabIndex, `at`, grabX, grabY )
          petsWithImages[i].isRunning = false
          petsWithImages[i].runnerValue = 0
          
              if (grabX > rightBound) grabX = rightBound
              if (grabX < leftBound) grabX = leftBound
              
              if (grabY < topBound) grabY = topBound
              if (grabY > bottomBound) grabY = bottomBound
              
              
              petsWithImages[i].x = grabX - petWidth / 2
              petsWithImages[i].y = grabY - petHeight / 2
              newloadingXCoords[i] = grabX - petWidth / 2
              newloadingYCoords[i] = grabY - petHeight / 2        
              
            }
        
        if (runner.isRunning) {
        // console.log(`runner`, runner)

        if( runner.runnerValue < 0) petsWithImages[i].direction = 'left'
        if( runner.runnerValue > 0) petsWithImages[i].direction = 'right'
        
        newloadingXCoords[i] = runner.runnerValue + newloadingXCoords[i]
        
        if (newloadingXCoords[i] < leftBound) {newloadingXCoords[i] = leftBound
          petsWithImages[i].direction = `right`
          // petsWithImages[i].runnerValue = 5
          petsWithImages[i].runnerValue = 0
        }
        if (newloadingXCoords[i ] > rightBound) {newloadingXCoords[i ] = rightBound
          petsWithImages[i].direction = `left`
          // petsWithImages[i].runnerValue = -5
          petsWithImages[i].runnerValue = 0
        }
        petsWithImages[i].x = newloadingXCoords[i]
        }
      }

      if (hoverIndex !== null) {

        // if pet is hungry, chase the cursor
        // console.log(`hoverX`, hoverX)
        // petsWithImages[hoverIndex].x = hoverX - petWidth / 2
        // newloadingXCoords[hoverIndex] = hoverX - petHeight / 2
        // if (hoverX > rightBound) hoverX = rightBound - petWidth / 2
        // if (hoverX < leftBound) hoverX = leftBound
        petsWithImages[hoverIndex].x = relativeLoadingXCoords[hoverIndex]
        newloadingXCoords[hoverIndex] = relativeLoadingXCoords[hoverIndex]
      }
      // console.log(newloadingXCoords)
      // console.log(newloadingYCoords)
      setLoadingXCoords(newloadingXCoords)
      setLoadingYCoords(newloadingYCoords)
      relativeLoadingXCoords = [...newloadingXCoords]
      relativeLoadingYCoords = [...newloadingYCoords]
    }

    const intervalId = setInterval(() => {  
      drawMansion()
    }, 60)

    return () => {clearInterval(intervalId)
    }
  }
    
}, [rawPets, setPetsLoaded])

  return (
    <div >
        <div>Mansion</div>
        <button onClick={handleLogout}>log out</button>
        {rawPets.length < 10 ? <button onClick={() => createPet(`new pet`)}>adopt a pet</button> : <span> you may only have 10 pets</span>}
        < Dropdown options = {rawPets} />
        <button onClick={(() => navigate('/field_race'))}>race these pets!</button>
        {currentPets[selectedPet]}
        <div className='mansion-backdrop'>
            <canvas id="canvas" className='canvas'></canvas>
        </div>
    </div>
  )
}

export default Mansion