import { useState, useEffect } from 'react'
import PetTag from './PetTag'

const Pet = ({ pet, feedPet, renamePet, rehomePet }) => {
    const [changedName, setChangedName] = useState('')
    const [naming, setNaming] = useState(false)
    const [rehoming, setRehoming] = useState(false)

    // these values ensure that the callback values don't get scrambled 
    let callbackId = pet.petId
    let callbackHunger = pet.hunger
    let callbackName = pet.petName
    // console.log(callbackName)
     
    // begin the naming process
    const startNaming = () => {
        setChangedName(callbackName)
        const swapper = !naming
        setNaming(swapper)
    }

    // end the naming process
    const completeNaming = () => {
        setChangedName('')
        setNaming(false)
        renamePet(callbackId, changedName)
    }

    // toggle whether the user is attempting to rehome a pet
    const toggleRehoming = () => {
      const swapper = !rehoming
      setRehoming(swapper)
    }

    // end the rehoming process
    const completeRehoming = () => {
      rehomePet(callbackId)
      setRehoming(false)
    }

    // manages which rehoming buttons are visible 
    const rehomingButtons = 
        rehoming? 
          <>
                <button onClick={completeRehoming}> yes, i'm sure </button>
                <button onClick={toggleRehoming}> no, go back </button>
          </> : <button onClick={toggleRehoming}> rehome this pet </button>

  return (
    <div> 
        <p> {/* onMouseOver={< PetTag  
                    pet={pet}
                    feedPet={feedPet}
                    renamePet={renamePet}
                    rehomePet={rehomePet}/>}> */}
        {pet.petName}</p>
    </div>
  )
}

export default Pet