"use client";
import { useEffect, useState, useRef } from "react";
import Navbar from "../components/Navbar";
import Link from "next/link";
import { IoCameraOutline } from "react-icons/io5";
import { HiOutlineMicrophone } from "react-icons/hi";
import { LuCast } from "react-icons/lu";
import { HiSpeakerWave } from "react-icons/hi2";



const Permissions = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [permissions, setPermissions] = useState<{
    microphone: boolean;
    camera: boolean;
    screen: boolean;
    speaker: boolean;
  }>({
    microphone: false,
    camera: false,
    screen: false,
    speaker: false,
  });

  const steps: (keyof typeof permissions)[] = [
    "camera",
    "microphone",
    "screen",
    "speaker",
  ];
  const allPermissionsGranted = Object.values(permissions).every(Boolean);

  const requestPermission = async (step: keyof typeof permissions) => {
    try {
      if (step === "camera") {
        const camStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        setPermissions((prev) => ({ ...prev, camera: !!camStream }));
      } else if (step === "microphone") {
        const micStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        setPermissions((prev) => ({ ...prev, microphone: !!micStream }));
      } else if (step === "screen") {
        await navigator.mediaDevices.getDisplayMedia();
        setPermissions((prev) => ({ ...prev, screen: true }));
      } else if (step === "speaker") {
        const audio = new Audio("/audioclip.mp3");
        audio.play();
        audio.onended = () => {
          setPermissions((prev) => ({ ...prev, speaker: true }));
        };
        return;
      }
    } catch (error) {
      console.warn(
        `${step.charAt(0).toUpperCase() + step.slice(1)} access not granted:`,
        error
      );
    }
  };

  const handlePermission = async () => {
    const step = steps[currentStep];
    await requestPermission(step);
    setCurrentStep((prev) => prev + 1);
  };

  useEffect(() => {
    if (currentStep < steps.length) {
      handlePermission();
    }
  }, [currentStep]);

  const handleCheckboxClick = async (step: keyof typeof permissions) => {
    if (!permissions[step]) {
      await requestPermission(step);
    }
  };

  return (
    <div className="p-4 text-black rounded-md">
      <h2 className="text-2xl font-bold mb-2 text-left">Ready to join?</h2>
      <ul className="space-y-2">
        {steps.map((step, index) => (
          <li
            key={step}
            className={`flex items-center gap-4 text-black border w-[400px] h-[60px] justify-between px-6 py-3 rounded-lg 
                ${permissions[step]
                ? "border-green-700 bg-green-200/80"
                : "border-red-700 bg-red-200/80"
              }`}
          >
            <span className="flex items-center gap-2">
              {step === "camera" ? (
                <IoCameraOutline className="text-2xl opacity-80" />
              ) : step === "microphone" ? (
                <HiOutlineMicrophone className="text-2xl opacity-80" />
              ) : step === "screen" ? (
                <LuCast className="text-2xl opacity-80" />
              ) : (
                <HiSpeakerWave className="text-2xl opacity-80" />
              )}
              <span className="text-xl capitalize">{step}</span>
            </span>

            <input
              type="checkbox"
              checked={permissions[step]}
              readOnly
              onClick={
                step !== "speaker" ? () => handleCheckboxClick(step) : undefined
              }
              className="h-6 w-6 accent-green-800 cursor-pointer "
            />
          </li>
        ))}
      </ul>
      {allPermissionsGranted ? (
        <Link href="/record">
          <button className="mt-6 w-[100%] font-bold bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
            Start Interview
          </button>
        </Link>
      ) : (
        <button
          className="mt-6 w-[100%] font-bold bg-gray-300 text-gray-600 py-2 px-4 rounded cursor-not-allowed"
          disabled
        >
          Waiting for permissions...
        </button>
      )}
    </div>
  );
};


const Home = () => {
  const [showPermissions, setShowPermissions] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const requestCameraAccess = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        setCameraPermission(true);
        setVideoStream(stream);
      } catch (error) {
        console.warn("Camera access denied:", error);
      }
    };

    requestCameraAccess();
  }, []);

  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);

  return (
    <div className="min-h-screen flex flex-col ">
      {/* Content */}
      <div className="flex items-center gap-10 justify-center flex-1 flex-row-reverse">
        {/* Video Section */}
        <div className="w-[460px] h-[345px] bg-black overflow-hidden rounded-3xl flex items-center justify-center">
          {cameraPermission && videoStream ? (
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full rounded-xl"
            />
          ) : (
            <p className="text-gray-400 text-center">
              Please enable camera permissions to view the video feed.
            </p>
          )}
        </div>

        {/* Right Section */}
        <div className="rounded-md p-8 max-w-xl text-center">
          {showPermissions ? (
            <Permissions />
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-4 text-black text-left ml-8">
                AI Interview Instructions
              </h1>
              <ul className="list-decimal scale-90 text-xl list-inside text-left text-gray-900 space-y-2">
                <li>Ensure your audio and video permissions are enabled.</li>
                <li>Answer all questions sincerely and confidently.</li>
                <li>Complete the test without interruptions.</li>
                <li>
                  Provide detailed responses, including examples and projects.
                </li>
                <li>Speak clearly and structure your answers logically.</li>
              </ul>
              <button
                onClick={() => setShowPermissions(true)}
                className="mt-6 w-[90%] font-bold bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
              >
                Start Now
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
