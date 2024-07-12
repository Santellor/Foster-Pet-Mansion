//dependency imports
import '../bike.css'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import getPetImages from '../utils/getPetImages.js'
import generateRandomPet from '../utils/genRandomPet.js'
import axios from 'axios'

export default function Bike(pet) {
  //variables
  const hungerThreshold = 90
  const [timeUntilStart, setTimeUntilStart] = useState(3)
  const [raceOver, setRaceOver] = useState(false)
  const [triathlonEnded, setTriathlonEnded] = useState(false)
  const [winner, setWinner] = useState("")
  const movementTick = 10

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const petsToRace = useSelector((state) => state.petsToRace)
  const userId = useSelector((state) => state.userId)
  const timer = useSelector((state) => state.timer)
  const [competitors, setCompetitors] = useState([])
  const [grassLine, setGrassLine] = useState((290))
  const [bikeImages, setBikeImages] = useState(([]))

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
        name: pet.name,
        hunger: pet.hunger,
        speed: Math.floor(Math.random() * (15 - 5 + 1)) + 5,
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
        headStart: 0,
        frontHalf: pet.frontHalf,
        backHalf: pet.backHalf,
        hasWon: false,
        bikeAnim: 0
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
          speed: Math.floor(Math.random() * (15 - 5 + 1)) + 5,
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
          bikeAnim: 0
        })
      }
    }
    setCompetitors(opps)
  }

  //calculate luck -> used for skipping course
  const skipCourse = (pet, trackLength) => {
    const unluckFactor = 23
    const randomChanceValue = Math.floor(Math.random() * (trackLength*(unluckFactor*10))) + 1; // Random number between 1 and 1100

    if (randomChanceValue <= pet.luck) {
      pet.x = 1250
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

    
    //load bike images
    const images = []
    for (let i = 0; i < 2; i++) {
        const image = new Image
        image.src = `/bike${i}.png`
        image.onload = () => {
            images.push(image)
        }
    }
    setBikeImages(images)
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
            image.src = data.frontAnimations[0];
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
            image.src = data.backAnimations[0];
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

    //draw initial bikes
    competitors.forEach((data) => {
      ctx.drawImage(bikeImages[0], data.x, (data.y + 32), 64, 64)
    })

    if (!raceOver) {
      loadFrontHalfImages().then(drawFrontHalfImages);
      loadBackHalfImages().then(drawBackHalfImages)
    }

    //render movement
    if (timeUntilStart <= 0 && !raceOver) {
      const animateImages = async () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        if (!raceOver) {
          competitors.forEach(data => {
            let { frontImages, backImages, x, y, speed } = data;

            if (!raceOver) {
              x += (speed / movementTick) + (randomMovement(data) / movementTick);
    
              if (x > canvasWidth - 64) {
                endRace(data)
              }
              // if (x > canvasWidth - 64) {
              //   x = -64;
              // }

              //bike animations
              if (data.bikeAnim > 1) {
                  data.bikeAnim = 0
              }
              ctx.drawImage(bikeImages[data.bikeAnim], data.x, (data.y + 32), 64, 64) 
              data.bikeAnim++

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
      if (timeUntilStart <= 0 && timer >= 0 && !raceOver) {
        const intervalId = setInterval(() => {
            dispatch({
              type: "TRIATHLON",
              payload: timer + i
            })
            i++
        }, 10);
  
        return () => clearInterval(intervalId);
      }
  }, [timeUntilStart, raceOver]);

  //execute win sequence
  const handleEndRaceAsync = async (winner) => {
    // Traditional race ending
    if (timer < 0) {
      setRaceOver(true);
      setWinner(winner);
      dispatch({
        type: 'RACE_PETS',
        payload: [],
      });

      // Finish winning drawings
      setTimeout(() => {
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        competitors.forEach((data) => {
          if (data.name !== winner.name) {
            ctx.drawImage(data.frontImages[0], data.x, data.y - 58, 64, 64);
            ctx.drawImage(data.backImages[0], data.x, data.y - 58, 64, 64);
          }
        });

        const image = new Image();
        image.src = '/crown.png';
        image.onload = () => {
          ctx.drawImage(winner.frontImages[0], 600, 150, 64, 64);
          ctx.drawImage(winner.backImages[0], 600, 150, 64, 64);
          ctx.drawImage(image, 600, 107, 64, 64); // Draw crown after winner's avatar
        };
      }, 1);
    }

    // Triathlon ending
    if (timer >= 0) {
      setRaceOver(true);
      setWinner(winner);
      const placements = competitors.sort((pet1, pet2) => pet2.x - pet1.x);
      console.log(placements[2])
      console.log(placements[1])
      console.log(placements[0])
      // Give medals
      const medalEntries = [];
      if (typeof placements[0].id === "number") {
        medalEntries.push({ userId: userId, medalId: 1 });
      }
      if (typeof placements[1].id === "number") {
        medalEntries.push({ userId: userId, medalId: 1 });
      }
      if (typeof placements[2].id === "number") {
        medalEntries.push({ userId: userId, medalId: 1 });
      }
      try {
        await Promise.all(medalEntries.map((entry) => axios.post('/api/post_medal', { entry })));
        const medalCheck = await axios.get(`/api/get_medals/${userId}`);
        console.log(medalCheck.data.medals); // Assuming `medalCheck` contains relevant data
        setTimeout(() => {
          // Triathlon ending ceremony
          const canvas = document.getElementById('canvas');
          const ctx = canvas.getContext('2d');
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Place and draw top 3 competitors
          setTimeout(() => {
            const placement = competitors.sort((pet1, pet2) => pet2.x - pet1.x);

            const image = new Image();
            image.src = '/bronzePodium.png';
            image.onload = () => {
              ctx.drawImage(placement[2].frontImages[0], 702, 126, 64, 64);
              ctx.drawImage(placement[2].backImages[0], 702, 126, 64, 64);
              ctx.drawImage(image, 700, 150, 64, 64);
            };

            setTimeout(() => {
              const image = new Image();
              image.src = '/silverPodium.png';
              image.onload = () => {
                ctx.drawImage(placement[1].frontImages[0], 502, 118, 64, 64);
                ctx.drawImage(placement[1].backImages[0], 502, 118, 64, 64);
                ctx.drawImage(image, 500, 150, 64, 64);
              };

              setTimeout(() => {
                const image = new Image();
                image.src = '/goldPodium.png';
                image.onload = () => {
                  ctx.drawImage(placement[0].frontImages[0], 602, 107, 64, 64);
                  ctx.drawImage(placement[0].backImages[0], 602, 107, 64, 64);
                  ctx.drawImage(image, 600, 150, 64, 64);
                  const image2 = new Image();
                  image2.src = '/crown.png';
                  image2.onload = () => {
                    ctx.drawImage(image2, 602, 63, 64, 64);
                  };
                };
                setTriathlonEnded(true);
              }, 2500);
            }, 2500);
          }, 2500);
        }, 2);
      } catch (error) {
        console.error('Error handling end race:', error);
        // Handle error as needed
      }
    }
  };

  // Function to handle the end of a race
  const endRace = (winner) => {
    handleEndRaceAsync(winner);
  };

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
      <div className={`bike-background ${timeUntilStart <= 0 && !raceOver ? 'bike-started' : ''}`}>
          <h1 className="test">{timeUntilStart <= 0 ? "Race underway" : `Race starting in ${timeUntilStart}`}</h1>
          <h3>{timer >= 0 ? formatTime(timer) : ""}</h3>
          <h1>{((raceOver && timer < 0) || (raceOver && triathlonEnded)) && (
                `${winner.name} was the winner!`
            )}</h1>
          <canvas id="canvas" width={1250} height={500}></canvas>
          { raceOver ? <button onClick={toMansion}>Return to Mansion</button> : <></>}
      </div>
  )
}