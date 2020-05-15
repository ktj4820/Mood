import React,{useState,useEffect, useRef} from 'react'
import * as faceapi from 'face-api.js'
import { NeuDiv, NeuSlider } from "neumorphism-react";
import ReactDOM from 'react-dom'
import './Camera.css'
export default function Camera() {
    const videoSrc = useRef()
    const [updateRate, setUpdateRate] = useState(500)
    const [mood, setMood] = useState(null)
    const [age, setAge] = useState(null)
    const [gender, setGender] = useState(null)
    useEffect(()=>{
        loadModels()
        let video = document.getElementsByClassName("video")[0]
        video.setAttribute('autoplay', '');
        video.setAttribute('muted', '');
        video.setAttribute('playsinline', '');
        console.log(video)
    },[])
    const startVideo=async()=> {
        try{
            let stream = navigator.mediaDevices
            stream
            .getUserMedia({video: true})
            .then(stream => handleVideo(stream))
            .catch(videoError);
        }
        catch(err){
            console.log(err)
            alert("device not supported")
            alert(err)
        }
      }

    const handleVideo=(stream)=> {
      // Update the state, triggering the component to re-render with the correct stream
      videoSrc.current.srcObject = stream
      handleFaces()
    }
    const videoError=(err)=> {
        alert(err)
    }
    const handleFaces=async()=>{
        const displaySize = { width: videoSrc.current.width, height: videoSrc.current.height }
        faceapi.matchDimensions(displaySize, displaySize)
        setInterval(async () => {
            const detections = await faceapi.detectSingleFace(videoSrc.current, 
                new faceapi.TinyFaceDetectorOptions()).withFaceExpressions().withAgeAndGender()
            if(detections){
                console.log(detections)
                handleExpression(detections)
            }
          }, updateRate)
    }
    const loadModels=async()=>{
        console.log("loading models")
        try{
        return Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
            faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
            faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
            faceapi.nets.faceExpressionNet.loadFromUri('/models'),
            faceapi.nets.ageGenderNet.loadFromUri('/models')
          ]).then(startVideo)
        }
        catch(err){
            alert(err)
        }
    }
    const handleExpression=(det)=>{
        const {expressions, gender, age} = det
        setAge(age.toFixed(0))
        setGender(gender)
        var currentmood = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);
        setMood(currentmood)
    }
      return (
          <div className="mainContainer">
                <NeuDiv className="containerDiv" color="#477854" >
                    <h3 className="resultText">
                      {mood ? "You look like you´re an "+mood+" "+age+" year old "+gender
                      :
                      "Analysing your face"}
                    </h3>
                </NeuDiv>
                <NeuDiv className="containerDiv" width="auto" height="auto" color="#477854">
                    <video
                        autoPlay
                        muted={true}
                        playsInline
                        className="video"
                        ref={videoSrc}
                        autoPlay={true}
                    />
                </NeuDiv>
                <NeuDiv className="containerDiv" color="#477854">
                    <h5>Adjust the detection rate</h5>
                        <NeuSlider
                          color="#477854"
                          className="sliderBar"
                          onChange={(value) => setUpdateRate(value)}
                          distance={2}
                          min={100}
                          max={5000}
                        />
                        <h4>{updateRate/1000}s</h4>
                </NeuDiv>
        </div>
        )
    }
