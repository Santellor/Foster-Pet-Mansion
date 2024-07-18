import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import hybridizePets from '../utils/hybridize'


const Dropdown = ({options, type, limit, viewToggle, loadPets, raceButtons}) => {

    const userId = useSelector((state) => state.userId)
    const [selectionArray, setSelectionArray] = useState([])
    const [positionArray, setPositionArray] = useState([])
    const [optionElements, setOptionElements] = useState([])
    const [message, setMessage] = useState('')
    const [clicked, setClicked] = useState(false)
    const [hybridizing, setHybridizing] = useState(false)
    const dispatch = useDispatch()

    const handleSelection = (i) => {

        // console.log(`fired at index: `, i )

        let selectionSet = new Set(selectionArray)
        // console.log(`selectionSet`, selectionSet)

        if (selectionSet.has(options[i])) {
            selectionSet.delete(options[i])
            const newSelectionArray = [...selectionSet]
            setSelectionArray(newSelectionArray)
            
            const newPositionArray = [...positionArray]
            newPositionArray[i] = false
            setPositionArray(newPositionArray)
            // console.log(`pet already selected`, newSelectionArray, newPositionArray)

        } else if (selectionArray.length < limit) {
            const newSelectionArray = [...selectionArray]
            newSelectionArray.push(options[i])
            setSelectionArray(newSelectionArray)

            const newPositionArray = [...positionArray]
            newPositionArray[i] = true
            setPositionArray(newPositionArray)
            // console.log(`not currently selected`, newSelectionArray, newPositionArray)

        } else {
            // console.log(`too many pets`)
            setMessage(`select up to ${limit} pets`)
        }
        
    }

    const LoadOptions = () => {
        // console.log(`options`, options)
        // console.log(`optionElements`, optionElements)
        const loadedOptions = options.map((pet, i) => {
            return positionArray[i]? 
                pet = <div className='text-highlight hover:cursor-pointer' key={i} onClick={() => handleSelection(i)}>
                         { pet.petName}
                      </div> : 
                pet = <div className='hover:text-highlight hover:cursor-pointer' key={i} onClick={() => handleSelection(i)}>
                         {pet.petName}
                      </div>
        })
        setOptionElements(loadedOptions)
    }

    const toggleClicked = () => {
        const swapper = !clicked
        setClicked(swapper)
    }

    const handleSubmit = () => {
        const noImages = selectionArray.map((pet) => {
            return pet = 
            {
                petId:pet.petId,
                petName:pet.petName,
                hunger:pet.hunger,
                hungerDefault:pet.hungerDefault,
                speed:pet.speed,
                swim:pet.swim,
                jump:pet.jump,
                luck:pet.luck,
                frontHalf:pet.frontHalf,
                backHalf:pet.backHalf,  
            }
        })
        if (type === `Race`) {
            dispatch({
                type: `RACE_PETS`,
                payload: noImages
            })
            setMessage('')
        }  
        if (type === `DNA`) {
            dispatch({
                type: `HYBRID_PETS`,
                payload: noImages
            })
            setMessage('')
        }  
            toggleClicked(false)

    }

    const selectedPetNames = selectionArray.length === 0 ? 
        `choose up to ${limit} pets` :
        selectionArray.map((pet, i) => {
        if (pet === undefined) pet = {petName:''}
        return pet = ` ${i + 1}) ${pet.petName}`
    })

    // end the rehoming process
const completeHybridizing = async () => {
    await hybridizePets(selectionArray[0], selectionArray[1], userId)
    loadPets()
    dispatch({
      type: `HYBRID_PETS`,
      payload: []
    })
    setHybridizing(false)
    setSelectionArray([])
  }

  const toggleHybridizing = () => {
    const swapper = !hybridizing
    setHybridizing(swapper)
  }
  
  // manages which rehoming buttons are visible 
  const hybridizingButtons = 
      hybridizing? 
        <>
              <button className='self-center hover:text-highlight px-1 bg-primary-light mr-2' onClick={completeHybridizing}> yes, i'm sure </button>
              <button className='self-center hover:text-highlight px-1 bg-primary-light ml-2' onClick={toggleHybridizing}> no, go back </button>
        </> : <button className='self-center hover:text-highlight px-1 bg-primary-light' onClick={toggleHybridizing}> hybridize </button>

    useEffect(() => {
       LoadOptions()
    }, [clicked, positionArray])

    useEffect(() => {
        if (clicked) {}
        setPositionArray([])
        setSelectionArray([])
        dispatch({
            type: `HYBRID_PETS`,
            payload: []
        })
        dispatch({
            type: `RACE_PETS`,
            payload: []
        })
        setMessage('')
        setClicked(false)
        setHybridizing(false)
    }, [viewToggle])

    const buttonScrubber = () => {
        return selectionArray.length === 2 && type === 'DNA' ? 'w-[40vw]' : ''
      }
    
  return (
    <div >
        {message}
    {clicked? (
        <div className=' bg-secondary-light border-2 border-primary-dark'>
            {optionElements}
            <button className=' hover:text-highlight' onClick={handleSubmit}>Done</button>
        </div>
        ) : (
        <div className='flex flex-row'>
            <div className=' hover:text-highlight item-center hover:cursor-pointer content-center w-max'onClick={toggleClicked}>
                {selectedPetNames} 
            </div>
            <div className={`flex flex-row ml-4`}>
                {(selectionArray.length === 2 && type === 'DNA') ? hybridizingButtons : <></>}
                {(selectionArray.length > 0 && type === 'Race') ? raceButtons : <></>}
            </div>
        </div>
        )}
    </div>
  )
}

export default Dropdown