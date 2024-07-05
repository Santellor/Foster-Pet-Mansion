//dependency imports
import '../race.css'
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import getPetImages from '../utils/getPetImages'

export default function Race(pet) {
    //variables
    const trackLength = 200 //pixels
    const hungerThreshold = 90
    const [timeUntilStart, setTimeUntilStart] = useState(3)
    const [raceOver, setRaceOver] = useState(false)
    const [winner, setWinner] = useState("")
    const movementTick = 10
    const navigate = useNavigate()
    const petsToRace = useSelector((state) => state.petsToRace)
    const initialCompetitors = []
    const [competitors, setCompetitors] = useState(initialCompetitors)

    const Maxford = {name: "Maxford", speed: 10, x: 50, y: 365, frontImages: [], backImages: [], frontAnimations: ["/frontPyroAvigator0.png", "/frontPyroAvigator1.png"], backAnimations: ["/backPyroAvigator0.png", "/backPyroAvigator1.png"], frontAnim: 0, backAnim: 0}
    const Rock = {name: "Rock", speed: 5, x: 50, y: 365, frontImages: [], backImages: [], frontAnimations: ["/frontRock0.png"], backAnimations: ["/backRock0.png"], frontAnim: 0, backAnim: 0}

    //calculate average pet speed -> used for calculating movement on movment tick
    const averageSpeed = (pet) => {
      if (pet.hunger >= hungerThreshold) {
          return Math.round(pet.speed) / (100 / movementTick )
      }
      else {
          return Math.round(pet.speed * (pet.hunger / 100)) / (100 / movementTick)
      }
  }

    //convert pet data to pet object
  const convertCompToObject = async (pets) => {
    for (const pet of pets) {
      const images = await getPetImages(pet)
      console.log(`Redux Pet Images: ${getPetImages(pet)[0]}`)
      competitors.push({
        name: pet.petName,
        speed: averageSpeed(pet),
        x: 50,
        y: 365,
        frontImages: [],
        backImages: [],
        frontAnim: 0,
        backAnim: 0,
        frontAnimations: images[0],
        backAnimations: images[1]
      })
    }
  }

  convertCompToObject(petsToRace)

    //calculate luck -> used for skipping course
    const skipCourse = (pet) => {
        if (((Math.floor(Math.random() * pet.luck[1]) + pet.luck[0]) / (trackLength / 10)) <= (Math.floor(Math.random() * 101))) {
            return true
        }
    }

    //pets taking hunger after an event
    const takeHunger = (pet) => {
        pet.hunger -= pet.hungerDefault
    }

    //pull  user's active pets
    //generate 4 random pets
    //position all pets at the starting line
    //render movement
    useEffect(() => {
        const canvas = document.getElementById('canvas')
        const ctx = canvas.getContext("2d");
        const canvasWidth = canvas.width;
        ctx.imageSmoothingEnabled = false;
    
        //generate front half images
        const loadFrontHalfImages = () => {
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
        const loadBackHalfImages = () => {
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
                  x += (speed / movementTick);
        
                  if (x > canvasWidth) {
                    endRace(data)
                  }
                  if (x > canvasWidth) {
                    x = -64;
                  }

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
            console.log('Countdown finished!');
            return;
        }

        const intervalId = setInterval(() => {
            setTimeUntilStart(prevTimer => prevTimer - 1);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [timeUntilStart]);

    //calculate winner
    const endRace = (winner) => {
      setRaceOver(true)
      setWinner(winner.name)

      const canvas = document.getElementById('canvas')
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      competitors.forEach((data) => {
        if (data.name != winner.name) {
          ctx.drawImage(data.frontImages[0], data.x, 315, 64, 64)
          ctx.drawImage(data.backImages[0], data.x, 315, 64, 64)
        }
      })

      //ctx.clearRect(winner.x, winner.y, 64, 64)
      ctx.drawImage(winner.frontImages[0], 600, 150, 64, 64);
      ctx.drawImage(winner.backImages[0], 600, 150, 64, 64);
      const image = new Image();
      image.onload = () => {
          ctx.drawImage(image, 600, 107, 64, 64); // Draw crown after winner's avatar
      };
      image.src = "/crown.png";
      ctx.drawImage(image, 600, 214, 64, 64)
    }

    const toMansion = () => {
      navigate('/mansion')
    }

    //html rendering
    return (
        <div className={`moving-background ${timeUntilStart <= 0 && !raceOver ? 'race-started' : ''}`}>
            <h1 className="test">{timeUntilStart <= 0 ? "Race underway" : `Race starting in ${timeUntilStart}`}</h1>
            <h1>{raceOver ? `${winner} was the winner!`: " "}</h1>
            <canvas id="canvas" width="1100" height="500"></canvas>
            { raceOver ? <button onClick={toMansion}>Return to Mansion</button> : <></>}
        </div>
    )
}