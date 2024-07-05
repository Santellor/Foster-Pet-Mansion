import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

const Dropdown = ({options}) => {

    const [selectionArray, setSelectionArray] = useState([])
    const [positionArray, setPositionArray] = useState([])
    const [optionElements, setOptionElements] = useState([])
    const [message, setMessage] = useState('')
    const [clicked, setClicked] = useState(false)
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
            // console.log(`a`, newSelectionArray, newPositionArray)

        } else if (selectionArray.length < 5) {
            const newSelectionArray = [...selectionArray]
            newSelectionArray.push(options[i])
            setSelectionArray(newSelectionArray)

            const newPositionArray = [...positionArray]
            newPositionArray[i] = true
            setPositionArray(newPositionArray)
            // console.log(`b`, newSelectionArray, newPositionArray)

        } else {
            // console.log(`c`)
            setMessage('You cannot have more than 5 pets race together')
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
        dispatch({
            type: `RACE_PETS`,
            payload: selectionArray
        })
        toggleClicked(false)

    }

    const selectedPetNames = selectionArray.length === 0 ? 
        ` click to choose up to 5 pets` :
        selectionArray.map((pet, i) => {
        if (pet === undefined) pet = {petName:''}
        return pet = ` ${i + 1}) ${pet.petName}`
    })

    useEffect(() => {
    //    console.log(`selectionArray`, selectionArray)
    //    console.log(`positionArray`, positionArray)
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
        <div onClick={toggleClicked}>
            Racing Pets:{selectedPetNames} 
        </div>
        )}
    </div>
  )
}

export default Dropdown