//dependency imports
import '../race.css'
import { useState, useEffect, useRef } from 'react'

export default function Race(pet) {
    //variables
    const trackLength = 200 //pixels
    const hungerThreshold = 90
    const [timeUntilStart, setTimeUntilStart] = useState(3)
    const canvasWidth = 1300
    const movementTick = 10

    // const Fred = {speed: 10, x: 50, y: 370, image: "", src: "https://www.creativefabrica.com/wp-content/uploads/2023/05/19/Create-An-8bit-Shiba-Dog-Graphic-69994037-1.png"}
    // const Rock = {speed: 5, x: 50, y: 370, image: "", src: "https://i.redd.it/w1ctilzr8df71.png"}
    // const Bob = {speed: 12, x: 50, y: 370, image: "", src: "https://art.pixilart.com/thumb/ccaa41d2a718edb.png"}

    // const competitors = [Rock, Bob, Fred]

    //calculate average pet speed -> used for calculating movement on movment tick
    const averageSpeed = (pet) => {
        if (pet.hunger >= hungerThreshold) {
            return Math.round(pet.speed) / (100 / movementTick )
        }
        else {
            return Math.round(pet.speed * (pet.hunger / 100))/ (100 / movementTick)
        }
    }

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

    //pull  user's active pet
    //generate 4 random pets
    //position all pets at the starting line
    //render movement
    useEffect(() => {
        const canvas = document.getElementById('canvas')
        const ctx = canvas.getContext("2d");
    
        const canvasWidth = canvas.width;
    
        const loadImages = () => {
          const promises = competitors.map(data => {
            return new Promise((resolve, reject) => {
              const image = new Image();
              image.onload = () => resolve({ image, ...data });
              image.onerror = reject;
              image.src = data.src;
              data.image = image
            });
          });
    
          return Promise.all(promises);
        };
    
        const drawImages = (loadedImages) => {
          loadedImages.forEach(({ image, x, y }) => {
            ctx.drawImage(image, x, y, image.width / 1.5, image.height / 1.5);
          });
        };
    
        loadImages().then(drawImages);
    
        if (timeUntilStart <= 0) {
          const animateImages = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            competitors.forEach(data => {
              let { image, x, y, speed } = data;
              x += (speed / movementTick);
    
              if (x > canvasWidth) {
                x = -image.width / 1.5;
              }
            console.log(image)
              ctx.drawImage(image, x, y, image.width / 1.5, image.height / 1.5);

              data.x = x
            });
          };
    
          const intervalId = setInterval(animateImages, movementTick);
    
          return () => clearInterval(intervalId);
        }
      }, [timeUntilStart]);

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
    //html rendering
    return (
        <div className={`moving-background ${timeUntilStart <= 0 ? 'race-started' : ''}`}>
            <h1 className="test">{timeUntilStart <= 0 ? "Race underway" : `Race starting in ${timeUntilStart}`}</h1>
            <canvas id="canvas" width="1300" height="600"></canvas>
        </div>
    )
}