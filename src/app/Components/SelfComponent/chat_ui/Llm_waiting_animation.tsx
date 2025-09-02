import {useEffect, useState} from "react";

const phrases = [
    'Retrieving Memory ...',
    'Constructing Neurons ...',
    'Formulating Responses ...',
    'Fetching Personality ...',
    'Learning More About You ...',
    'Analyzing Synapses ...',
    'Activating Deep Learning Circuits ...',
    'Synthesizing Cognition ...',
    'Indexing Memories ...',
    'Optimizing Neural Pathways ...',
    'Compiling Thoughts ...',
    'Weaving Logic Threads ...',
    'Calculating Probabilities ...',
    'Aligning Neuron Clusters ...',
    'Debugging Consciousness ...'
];

export default function(){
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    useEffect(()=>{
        setInterval(
            () =>{
                setCurrentIndex((currentIndex)=> {
                    if(currentIndex==phrases.length-1) return 0
                    return currentIndex + 1
                });
            },
            5000
        )
    },[])
    return (
        <div>
            <span className={'animate-pulse'}>{phrases[currentIndex]}</span>
        </div>
    )
}