//dependency imports
import '../swim.css'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import getPetImages from '../utils/getPetImages.js'
import generateRandomPet from '../utils/genRandomPet.js'

export default function Swim(pet) {
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
  const [waterLine, setWaterLine] = useState((250))

  //calculate average pet swim -> used for calculating movement on movment tick
  const averageSwim = (pet) => {
    if (pet.hunger >= hungerThreshold) {
        return Math.round(pet.swim)
    }
    else {
        return Math.round(pet.swim * (pet.hunger / 100))
    }
  }

  //convert pet data to objects
  const convertCompToObject = async (pets) => {
    const opps = []

    //convert pets from mansion
    for (const pet of pets) {
      const images = await getPetImages(pet)
      let yVal = waterLine
      if (timer >= 0) {
        yVal -= 40
      }
      opps.push({
        name: pet.name,
        swim: pet.swim,
        luck: pet.luck,
        x: 50 + pet.headStart,
        y: yVal,
        frontImages: [],
        backImages: [],
        frontAnim: 0,
        backAnim: 0,
        frontAnimations: images[0],
        backAnimations: images[1],
        id: pet.id,
        frontHalf: pet.frontHalf,
        backHalf: pet.backHalf
      })
    }

    //fill missing competitors with randomly generated pets
    if (timer < 0) {
      while (opps.length < 5) {
        const pet = generateRandomPet()
        const images = await getPetImages(pet)
        opps.push({
          name: `Competitor ${(opps.length-1) + 1}`,
          swim: averageSwim(pet),
          luck: pet.luck,
          x: 50,
          y: waterLine,
          frontImages: [],
          backImages: [],
          frontAnim: 0,
          backAnim: 0,
          frontAnimations: images[0],
          backAnimations: images[1],
          frontHalf: pet.frontHalf,
          backHalf: pet.backHalf
        })
      }
    }
    setCompetitors(opps)
  }

  //calculate luck -> used for skipping course
  const skipCourse = (pet, trackLength) => {
    const unluckFactor = 23
    const randomChanceValue = Math.floor(Math.random() * (trackLength*(unluckFactor*10))) + 1; // Random number between 1 and 1100

    // Calculate the threshold based on track length
    return randomChanceValue <= pet.luck;
  }

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
              let { frontImages, backImages, x, y, swim } = data;

              if (!raceOver) {
                x += (swim / movementTick);

                if (swim === 0) {
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
    if (timeUntilStart <= 0 && timer >= 0) {
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
        endRace(true)
        setTimeout(() => {
          competitors.forEach((data) => {
            data.frontImages = []
            data.backImages = []
          })
          dispatch({
            type: `RACE_PETS`,
            payload: competitors
          })
          navigate('/forest_race')
        }, 2)
      }
      if (typeof winner.id === 'string' && timer >= 0) {
        if (!winner.hasWon) {
          winner.headStart = (100)
          winner.hasWon = true
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
      <div className={`swim-background ${timeUntilStart <= 0 && !raceOver ? 'swim-started' : ''}`}>
          <h1 className="test">{timeUntilStart <= 0 ? "Race underway" : `Race starting in ${timeUntilStart}`}</h1>
          <h3>{timer >= 0 ? formatTime(timer) : ""}</h3>
          <h1>{raceOver ? `${winner.name} was the winner!`: " "}</h1>
          <canvas id="canvas" width={1250} height={500}></canvas>
          { raceOver ? <button onClick={toMansion}>Return to Mansion</button> : <></>}
      </div>
  )
}