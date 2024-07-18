import { useState, useEffect } from 'react'
import '../mansion.css'

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
                <button className='hover:text-highlight hover:bg-secondary-light/80 hover:text-center hover:justify-center hover:w-[12vw]' onClick={completeRehoming}> yes, i'm sure </button>
                <button className='hover:text-highlight hover:bg-secondary-light/80 hover:text-center hover:justify-center hover:w-[12vw]' onClick={toggleRehoming}> no, go back </button>
          </> : <button className='hover:text-highlight hover:bg-secondary-light/80 hover:text-center hover:justify-center hover:w-[12vw]'onClick={toggleRehoming}> rehome </button>

  return (
    <div className='bg-neutral/75 flex flex-col items-center justify-center'> 
        {naming? 
         <div className='flex flex-col items-center justify-center w-[12vw] hover:text-highlight'> 
                <input type='text' className='justify-self-center text-center w-[16vw]' value={changedName} onChange={(e) => setChangedName(e.target.value)}/> 
                <button onClick={completeNaming}>done</button> 
         </div> 
        : 
         <div className='hover:text-highlight hover:bg-secondary-light/80 font-bold bg-secondary-light/75 py-1 text-center justify-center w-[12vw]' onClick={startNaming}>
                {pet.petName}   
         </div>
        }
            
        <div className='hover:text-highlight hover:bg-secondary-light/80 hover:text-center hover:justify-center hover:w-[12vw]' onClick={() => feedPet(callbackId, callbackHunger)}>
            <button>feed: </button> {pet.hunger}
        </div>
        <div className='needs-padding'>
            speed: {pet.speed}
        </div>
        <div className='needs-padding'>
            swim: {pet.swim}
        </div>
        <div className='needs-padding'>
            jump: {pet.jump}
        </div>
        <div className='needs-padding'>
            luck: {pet.luck}
        </div>
        {rehomingButtons}
    </div>
  )
}

export default PetTag