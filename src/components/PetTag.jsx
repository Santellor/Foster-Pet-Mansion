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
                <button className='hover:text-highlight hover:bg-secondary-light/80 hover:text-center hover:justify-center min-w-[5.5rem] w-max' onClick={completeRehoming}> confirm </button>
                <button className='hover:text-highlight hover:bg-secondary-light/80 hover:text-center hover:justify-center min-w-[5.5rem] w-max' onClick={toggleRehoming}> back </button>
          </> : <button className='hover:text-highlight hover:bg-secondary-light/80 hover:text-center hover:justify-center min-w-[5.5rem] w-max'onClick={toggleRehoming}> rehome </button>

  return (
    <div className='bg-neutral/75 flex flex-col items-center justify-center'> 
        {naming? 
         <div className='flex flex-col items-center justify-center'> 
                <input type='text' className='justify-self-center text-center hover:text-highlight' value={changedName} onChange={(e) => setChangedName(e.target.value)}/> 
                <div className=' hover:text-highlight'>
                    <button onClick={completeNaming}>done</button> 
                </div>
         </div> 
        : 
         <div className='hover:text-highlight hover:bg-secondary-light/80 font-bold bg-secondary-light/75 p-1 text-center justify-center min-w-[5.5rem] w-max' onClick={startNaming}>
                {pet.petName}   
         </div>
        }
            
        <div className='hover:text-highlight hover:bg-secondary-light/80 hover:text-center hover:justify-center min-w-[5.5rem] w-max text-center' onClick={() => feedPet(callbackId, callbackHunger)}>
            <button>feed: </button> {pet.hunger}
        </div>
        <div className='px-2'>
            speed: {pet.speed}
        </div>
        <div className='px-2'>
            swim: {pet.swim}
        </div>
        <div className='px-2'>
            jump: {pet.jump}
        </div>
        <div className='px-2'>
            luck: {pet.luck}
        </div>
        {rehomingButtons}
    </div>
  )
}

export default PetTag