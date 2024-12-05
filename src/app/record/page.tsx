"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import Confetti from "react-confetti";

const Record = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunks: Blob[] = [];

  const questions = [
    "What is your name?",
    "What is your area of expertise?",
    "Explain your previous work experience?",
  ];

  useEffect(() => {
    startRecording();
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: "video/webm" });
        setRecordedBlob(blob);
        setIsPreview(true);

        // Stop all tracks to release the camera
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Ensure that the recording stops after 30 seconds
      setTimeout(() => {
        if (isRecording) {
          stopRecording();
        }
      }, 30000);
    } catch (err) {
      console.error("Error accessing media devices.", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSaveAndNext = () => {
    console.log("Video saved:", recordedBlob);

    if (questionIndex < questions.length - 1) {
      setQuestionIndex(questionIndex + 1);
      setIsPreview(false);

      startRecording();
    } else {
      setIsCompleted(true);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      {!isCompleted ? (
        <div className="w-full max-w-lg bg-white rounded-lg shadow-md p-6">
          <h1 className="text-xl font-semibold text-gray-700 mb-4">
            Question {questionIndex + 1} of {questions.length}
          </h1>

          {!isPreview ? (
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-center text-gray-600">
                {questions[questionIndex]}
              </h2>
              <TimerComponent stopRecording={stopRecording} />
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-60 bg-black rounded-lg"
              ></video>
              <button
                onClick={stopRecording}
                className="w-full py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                Stop Recording
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-600 text-center">
                Preview Your Recording
              </h2>
              <video
                src={recordedBlob ? URL.createObjectURL(recordedBlob) : ""}
                controls
                className="w-full h-60 rounded-lg"
              ></video>
              <button
                onClick={handleSaveAndNext}
                className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Save & Next
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full max-w-lg text-center p-6 bg-white rounded-lg shadow-md ">
          <Confetti className="absolute inset-0 z-10" />
          <h1 className="text-2xl font-semibold text-gray-700 mb-4">
            Test Completed
          </h1>
          <p className="text-gray-500 mb-6">
            Thank you for completing the AI interview!
          </p>
          <Link
            href="/"
            className="inline-block py-3 px-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Go to Home
          </Link>
        </div>
      )}
    </div>
  );
};

export default Record;

const TimerComponent = ({ stopRecording }: { stopRecording: () => void }) => {
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    if (seconds > 0) {
      const timerId = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds - 1);
      }, 1000);

      return () => clearInterval(timerId);
    } else {
      stopRecording();
    }
  }, [seconds, stopRecording]);

  return (
    <div className="text-center">
      <p className="text-lg font-medium text-gray-600">
        Timer{" "}
        <span className="px-3 py-1 bg-yellow-100 text-red-500 rounded-lg">
          00:{seconds < 10 ? `0${seconds}` : seconds}s
        </span>
      </p>
    </div>
  );
};
