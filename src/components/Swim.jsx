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
  const movementTick = 80

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const petsToRace = useSelector((state) => state.petsToRace)
  const timer = useSelector((state) => state.timer)
  const [competitors, setCompetitors] = useState([])
  const [waterLine, setWaterLine] = useState(310)

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
    let i = 0
    for (const pet of pets) {
      const images = await getPetImages(pet)
      let yVal = waterLine
      if (timer >= 0) {
        yVal -= 60
      }
      opps.push({
        petName: pet.petName,
        swim: pet.swim,
        luck: pet.luck,
        x: 50 + (pet.headStart ? pet.headStart : 0),
        y: yVal + i*10,
        frontImages: [],
        backImages: [],
        frontAnim: 0,
        backAnim: 0,
        frontAnimations: images[0],
        backAnimations: images[1],
        id: pet.id,
        frontHalf: pet.frontHalf,
        backHalf: pet.backHalf,
        hasWon: false,
        headStart: 0
      })
      i++
    }

    //fill missing competitors with randomly generated pets
    if (timer < 0) {
      let i = 0
      while (opps.length < 5) {
        const pet = generateRandomPet()
        const images = await getPetImages(pet)
        opps.push({
          petName: `Competitor ${(opps.length-1) + 1}`,
          swim: averageSwim(pet),
          luck: pet.luck,
          x: 50,
          y: waterLine + i*10,
          frontImages: [],
          backImages: [],
          frontAnim: 0,
          backAnim: 0,
          frontAnimations: images[0],
          backAnimations: images[1],
          frontHalf: pet.frontHalf,
          backHalf: pet.backHalf
        })
        i++
      }
    }
    setCompetitors(opps)
  }

  //calculate luck -> used for skipping course
  const skipCourse = (pet, trackLength) => {
    const unluckFactor = 25000 // 1000 * refresh rate of 12.5 frames per second * 2 for balance
    const randomChanceValue = Math.floor(Math.random() * (unluckFactor)) + 1; // Random number between 1 and 25000
    const canvas = document.getElementById('canvas')

    if (randomChanceValue <= pet.luck) {
      pet.x = canvas.width
    }
    return randomChanceValue <= pet.luck;
  }

  const randomMovement = (pet) => {
    const randomNum = Math.floor(Math.random() * (120 + pet.luck)) + 1;

    if (randomNum > (100)) {
      return 1;
    } else {
      return 0;
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
      canvas.setAttribute('width', 960 );
      canvas.setAttribute('height', 420 );
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
                x += (swim ) /1.5 + (randomMovement(data))

                if (swim === 0) {
                  x -= 1
                  y += 10
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
                data.y = y

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
          if (!raceOver) ctx.clearRect(0, 0, canvas.width, canvas.height);

          competitors.forEach((data) => {
            if (data.petName != winner.petName) {
              ctx.drawImage(data.frontImages[0], data.x, (data.y), 64, 64)
              ctx.drawImage(data.backImages[0], data.x, (data.y), 64, 64)
            }
          })

        const image = new Image();
        image.src = "/crown.png";
        image.onload = () => {
          ctx.drawImage(winner.frontImages[0], canvas.width/2, canvas.height/2, 64, 64);
          ctx.drawImage(winner.backImages[0], canvas.width/2, canvas.height/2, 64, 64);  
          ctx.drawImage(image, canvas.width/2, canvas.height/2 - 32, 64, 64); // Draw crown after winner's avatar
        };
        }, 1);
      }

      //triathlon ending
      const canvas = document.getElementById('canvas')
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
          navigate('/forest_race')
        }, 2)
      }
      if (typeof winner.id === 'string' && timer >= 0) {
        if (!winner.hasWon) {
          for (let i = 0; i < competitors.length; i++) {
            const pet = competitors[i];
            if (Number.isInteger(pet.id)) {
                const chosen  = pet;
                winner.headStart = (winner.x - chosen.x)
                if (winner.headStart > (canvas.width * (1/3))) {
                  winner.headStart = (canvas.width * (1/3))
                }
                if (winner.headStart < 0) {
                  winner.headStart = 0
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

  const buttonScrubber = () => {
    return raceOver ? 'bg-primary-light' : ''
  }

  //html rendering
  return (
    <div className='flex flex-col items-center'>
      <div className='flex flex-row justify-center content-center h-[4rem] py-2 w-[100vw] text-md md:text-2xl sm:text-xl xs-lg text-primary-dark bg-secondary-light border-y-8 border-primary-light'>
         <div>
            {raceOver ? <h1>{winner.petName} was the winner!</h1> : <h1 className="test">{timeUntilStart <= 0 ? "Race underway" : `Race starting in ${timeUntilStart}`}</h1>}
         </div>
         <div className='ml-4'>
            <h3>{timer >= 0 ? formatTime(timer) : ""}</h3>
         </div>
      </div>
      <div className='relative'>
        <div className={`swim-background ${timeUntilStart <= 0 && !raceOver ? 'swim-started' : ''}`}>
            <canvas id="canvas" className='swim-canvas'></canvas>
        </div>
        <div className='top-1 absolute left-[50%] translate-x-[-50%] w-max flex justify-center content-center'>
            <div className={` ${buttonScrubber()} p-0.5 ml-2 text-sm md:text-xl sm:text-lg xs-md hover:text-highlight`}>
              { raceOver ? <button onClick={toMansion}>Return to Mansion</button> : <></>}
            </div>
        </div>
      </div>
    </div>
  )
}