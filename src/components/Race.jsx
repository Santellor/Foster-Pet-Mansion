//dependency imports
import '../race.css'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import getPetImages from '../utils/getPetImages.js'
import generateRandomPet from '../utils/genRandomPet.js'

export default function Race(pet) {
  //variables
  const hungerThreshold = 90
  const [timeUntilStart, setTimeUntilStart] = useState(3)
  const [raceOver, setRaceOver] = useState(false)
  const [winner, setWinner] = useState("")
  const movementTick = 10

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const petsToRace = useSelector((state) => state.petsToRace)
  const timer = useSelector((state) => state.timer)
  const [competitors, setCompetitors] = useState([])
  const [grassLine, setGrassLine] = useState((405))

  //calculate average pet speed -> used for calculating movement on movment tick
  const averageSpeed = (pet) => {
    if (pet.hunger >= hungerThreshold) {
        return Math.round(pet.speed)
    }
    else {
        return Math.round(pet.speed * (pet.hunger / 100))
    }
  }

  //calculate average swim for future traithlon events
  const averageSwim = (pet) => {
    if (pet.hunger >= hungerThreshold) {
        return Math.round(pet.swim)
    }
    else {
        return Math.round(pet.swim * (pet.hunger / 100))
    }
  }

  //convert pet data to pet object
  const convertCompToObject = async (pets) => {
    const opps = []

    //convert pets from mansion
    for (const pet of pets) {
      const images = await getPetImages(pet)
      let yVal = grassLine
      if (timer >= 0) {
        yVal -= 40
      }
      opps.push({
        name: pet.petName,
        hunger: pet.hunger,
        speed: averageSpeed(pet),
        luck: pet.luck,
        x: 50,
        y: yVal,
        frontImages: [],
        backImages: [],
        frontAnim: 0,
        backAnim: 0,
        frontAnimations: images[0],
        backAnimations: images[1],
        id: pet.petId,
        headStart: 0,
        frontHalf: pet.frontHalf,
        backHalf: pet.backHalf,
        swim: averageSwim(pet),
        hasWon: false,
        luckyWin: false
      })
    }

    //fill missing competitors with randomly generated pets
    if (timer < 0) {
      while (opps.length < 5) {
        const pet = generateRandomPet()
        const images = await getPetImages(pet)
        opps.push({
          name: `Competitor ${(opps.length-1) + 1}`,
          hunger: pet.hunger,
          speed: averageSpeed(pet),
          luck: pet.luck,
          x: 50,
          y: grassLine,
          frontImages: [],
          backImages: [],
          frontAnim: 0,
          backAnim: 0,
          frontAnimations: images[0],
          backAnimations: images[1],
          frontHalf: pet.frontHalf,
          backHalf: pet.backHalf,
          swim: averageSwim(pet),
          luckyWin: false
        })
      }
    }
    else {
      while (opps.length < 8) {
        const pet = generateRandomPet()
        const images = await getPetImages(pet)
        let yVal = grassLine - 40
        opps.push({
          name: `Competitor ${(opps.length-1) + 1}`,
          speed: averageSpeed(pet),
          hunger: pet.hunger,
          luck: pet.luck,
          x: 50,
          y: yVal,
          frontImages: [],
          backImages: [],
          frontAnim: 0,
          backAnim: 0,
          frontAnimations: images[0],
          backAnimations: images[1],
          id: 'yahoo',
          headStart: 0,
          frontHalf: pet.frontHalf,
          backHalf: pet.backHalf,
          swim: averageSwim(pet),
          hasWon: false,
          luckyWin: false
        })
      }
    }
    setCompetitors(opps)
  }

  //calculate luck -> used for skipping course
  const skipCourse = (pet, trackLength) => {
    const unluckFactor = 23
    const randomChanceValue = Math.floor(Math.random() * (trackLength*(unluckFactor*10))) + 1; // Random number between 1 and 1100
    const canvas = document.getElementById('canvas')

    // Calculate the threshold based on track length
    if (randomChanceValue <= pet.luck) {
      pet.x = canvas.width - 64
    }
    return randomChanceValue <= pet.luck;
  }

  const randomMovement = (pet) => {
    const randomNum = Math.floor(Math.random() * (100 + pet.luck)) + 1;

    if (randomNum <= 90) {
      return 0;
    } else if (randomNum <= (100 + pet.luck)) {
      return 1;
    }
  };

  //pets taking hunger after an event
  const takeHunger = (pet) => {
      pet.hunger -= pet.hungerDefault
  }

  //generate competitors
  useEffect(() => {
    //convert pet components to competitor objects
    convertCompToObject(petsToRace)
  }, [])
  
  //render movement
  useEffect(() => {
      const canvas = document.getElementById('canvas')
      const ctx = canvas.getContext("2d");
      const canvasWidth = canvas.width;
      ctx.imageSmoothingEnabled = false;
  
      //generate front half images
      const loadFrontHalfImages = async () => {
        const promises = competitors.flatMap(data => {
          return data.frontAnimations.map(src => {
            return new Promise((resolve, reject) => {
              const image = new Image();
              image.onload = () => {
                data.frontImages.push(image);
                resolve({ image, ...data });
              };
              image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
              image.src = src;
            });
          });
        });
      
        return Promise.all(promises);
      };

      //generate back half images
      const loadBackHalfImages = async () => {
        const promises = competitors.flatMap(data => {
          return data.backAnimations.map(src => {
            return new Promise((resolve, reject) => {
              const image = new Image();
              image.onload = () => {
                data.backImages.push(image);
                resolve({ image, ...data });
              };
              image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
              image.src = src;
            });
          });
        });
      
        return Promise.all(promises);
      };
  
      //draw initial front half images
      const drawFrontHalfImages = (loadedFrontHalfImages) => {
        loadedFrontHalfImages.forEach(({ frontImages, x, y }) => {
          ctx.drawImage(frontImages[0], x, y, 64, 64);
        });
      };

      //draw initial back half images
      const drawBackHalfImages = (loadedBackHalfImages) => {
        loadedBackHalfImages.forEach(({ backImages, x, y }) => {
          ctx.drawImage(backImages[0], x, y, 64, 64);
        });
      };
  
      if (!raceOver) {
        loadFrontHalfImages().then(drawFrontHalfImages);
        loadBackHalfImages().then(drawBackHalfImages)
      }
  
      //render movement
      if (timeUntilStart <= 0 && !raceOver) {
        const animateImages = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height)

          if (!raceOver) {
            competitors.forEach(data => {
              let { frontImages, backImages, x, y, speed } = data;

              if (!raceOver) {
                x += (speed / movementTick) + (randomMovement(data) / movementTick);

                if (speed === 0) {
                  x -= 2
                }
      
                if (x > canvasWidth - 64) {
                  endRace(data)
                }
                // if (x > canvasWidth - 64) {
                //   x = -64;
                // }

                //front animations
                if (data.frontAnim >= frontImages.length) {
                  data.frontAnim = 0
                }
                ctx.drawImage(frontImages[data.frontAnim], x, y, 64, 64);
                data.frontAnim += 1

                //back animations
                if (data.backAnim >= backImages.length) {
                  data.backAnim = 0
                }
                ctx.drawImage(backImages[data.backAnim], x, y, 64, 64);
                data.backAnim += 1

                data.x = x

                skipCourse(data, canvasWidth) && !raceOver ? endRace(data) : null
              }
            });
          }
        };
  
        const intervalId = setInterval(animateImages, movementTick);
  
        return () => clearInterval(intervalId);
      }
    }, [timeUntilStart, raceOver]);

  // useEffect to run code after component mounts
  useEffect(() => {
      if (timeUntilStart <= 0) {
          return;
      }

      const intervalId = setInterval(() => {
          setTimeUntilStart(prevTimer => prevTimer - 1);
      }, 1000);

      return () => clearInterval(intervalId);
  }, [timeUntilStart]);

  //triathlon speed timer
  useEffect(() => {
    let i = 1
    if (timeUntilStart <= 0 && timer === 0) {
      const intervalId = setInterval(() => {
          dispatch({
            type: "TRIATHLON",
            payload: timer + i
          })
          i++
      }, 10);

      return () => clearInterval(intervalId);
    }
}, [timeUntilStart]);

  //execute win sequence
  const endRace = (winner) => {
    for (const pet of petsToRace) {
      //traditional race ending
      if (timer < 0) {
        setRaceOver(true)
        setWinner(winner)
        dispatch({
          type: `RACE_PETS`,
          payload: []
        })
        
        //finish winning drawings
        setTimeout(() => {
          const canvas = document.getElementById('canvas')
          const ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          competitors.forEach((data) => {
            if (data.name != winner.name) {
              ctx.drawImage(data.frontImages[0], data.x, (data.y-58), 64, 64)
              ctx.drawImage(data.backImages[0], data.x, (data.y-58), 64, 64)
            }
          })

        const image = new Image();
        image.src = "/crown.png";
        image.onload = () => {
            ctx.drawImage(winner.frontImages[0], 600, 150, 64, 64);
            ctx.drawImage(winner.backImages[0], 600, 150, 64, 64);  
            ctx.drawImage(image, 600, 107, 64, 64); // Draw crown after winner's avatar
        };
        }, 1);
      }

      //triathlon ending
      if (timer >= 0 && typeof winner.id === 'number') {
        setTimeout(() => {
          const dupedArr = competitors.map(competitor => ({
            ...competitor,
            frontImages: [],
            backImages: []
          }));      
          dispatch({
            type: `RACE_PETS`,
            payload: dupedArr
          })
          navigate('/ocean_race')
        }, 2)
      }
      if (typeof winner.id === 'string' && timer >= 0) {
        if (!winner.hasWon) {
          for (let i = 0; i < competitors.length; i++) {
            const pet = competitors[i];
            if (Number.isInteger(pet.id)) {
                const chosen  = pet;
                winner.headStart = (winner.x - chosen.x)
                if (winner.headStart > 852) {
                  winner.headStart = 852
                }
                winner.hasWon = true
                break; // Exit the loop as soon as we find a pet with an integer id
            }
          }
        }
      }
    }  
  }

  const formatTime = (hundredths) => {
    // Convert hundredths of a second to milliseconds
    let milliseconds = hundredths * 10;

    // Calculate minutes, seconds, and hundredths of a second
    let minutes = Math.floor(milliseconds / (60 * 1000));
    let seconds = Math.floor((milliseconds % (60 * 1000)) / 1000);
    let hundredthsOfSecond = Math.floor((milliseconds % 1000) / 10);

    // Ensure two-digit formatting for minutes, seconds, and hundredths of a second
    let formattedMinutes = minutes.toString().padStart(2, '0');
    let formattedSeconds = seconds.toString().padStart(2, '0');
    let formattedHundredths = hundredthsOfSecond.toString().padStart(2, '0');

    // Return formatted time string with MM:SS:mm format
    return `${formattedMinutes}:${formattedSeconds}:${formattedHundredths}`;
  };

  const toMansion = () => {
    navigate('/mansion')
  }

  //html rendering
  return (
      <div className={`moving-background ${timeUntilStart <= 0 && !raceOver ? 'race-started' : ''}`}>
          <h1 className="test">{timeUntilStart <= 0 ? "Race underway" : `Race starting in ${timeUntilStart}`}</h1>
          <h3>{timer >= 0 ? formatTime(timer) : ""}</h3>
          <h1>{raceOver ? `${winner.name} was the winner!`: " "}</h1>
          <canvas id="canvas" width={1250} height={500}></canvas>
          { raceOver ? <button onClick={toMansion}>Return to Mansion</button> : <></>}
      </div>
  )
}