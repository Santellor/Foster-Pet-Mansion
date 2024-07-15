import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import hybridizePets from '../utils/hybridize'


const Dropdown = ({options, type, limit, loadPets}) => {

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
                pet = <div key={i} onClick={() => handleSelection(i)}>
                         { '-> '+pet.petName}
                      </div> : 
                pet = <div key={i} onClick={() => handleSelection(i)}>
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
        if (type === `Hybrid`) {
            dispatch({
                type: `HYBRID_PETS`,
                payload: noImages
            })
            setMessage('')
        }  
            toggleClicked(false)

    }

    const selectedPetNames = selectionArray.length === 0 ? 
        ` click to choose up to ${limit} pets` :
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
              <button onClick={completeHybridizing}> yes, i'm sure </button>
              <button onClick={toggleHybridizing}> no, go back </button>
        </> : <button onClick={toggleHybridizing}> hybridize </button>

    useEffect(() => {
       LoadOptions()
    }, [clicked, positionArray])
    
  return (
    <div >
        {message}
    {clicked? (
        <div>
            {optionElements}
            <button onClick={handleSubmit}>Submit</button>
        </div>
        ) : (
        <div>
            <div onClick={toggleClicked}>
                {type}:{selectedPetNames} 
            </div>
            <div>
                {(selectionArray.length === 2 && type === 'Hybrid') ? hybridizingButtons : <></>}
            </div>
        </div>
        )}
    </div>
  )
}

export default Dropdown