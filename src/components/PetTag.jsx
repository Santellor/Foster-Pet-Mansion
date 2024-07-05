import { useState, useEffect } from 'react'

const PetTag = ({ pet, feedPet, renamePet, rehomePet }) => {
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
        <br />
        {naming?  <> <input type='text' value={changedName} onChange={(e) => setChangedName(e.target.value)}/> <button onClick={completeNaming}>rename</button> </> 
        : <>  {pet.petName}   <button onClick={startNaming} >rename</button> </> } <br /> 
        hunger: {pet.hunger} <button onClick={() => feedPet(callbackId, callbackHunger)}>feed me</button> <br />
        speed: {pet.speed} <br />
        swim: {pet.swim} <br />
        jump: {pet.jump} <br />
        luck: {pet.luck} <br />
        front: {pet.frontHalf} <br />
        back: {pet.backHalf} <br />
        {rehomingButtons}
    </div>
  )
}

export default PetTag