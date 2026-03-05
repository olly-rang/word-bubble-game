import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export class HandTracker {
    private handLandmarker: HandLandmarker | null = null;
    private video: HTMLVideoElement | null = null;
    private lastVideoTime = -1;

    async initialize() {
        const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
                delegate: "GPU"
            },
            runningMode: "VIDEO",
            numHands: 1
        });
    }

    async start(videoElement: HTMLVideoElement) {
        this.video = videoElement;
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720 },
            });
            this.video.srcObject = stream;
            this.video.addEventListener("loadeddata", () => {
                this.video?.play();
            });
        }
    }

    getFingerPosition() {
        if (!this.handLandmarker || !this.video || this.video.readyState < 2) return null;

        const startTimeMs = performance.now();
        if (this.lastVideoTime !== this.video.currentTime) {
            this.lastVideoTime = this.video.currentTime;
            const results = this.handLandmarker.detectForVideo(this.video, startTimeMs);

            if (results.landmarks && results.landmarks.length > 0) {
                // Landmark 8 is the Index Finger Tip
                const indexFinger = results.landmarks[0][8];
                return {
                    // Flip X because webcam is mirrored
                    x: (1 - indexFinger.x) * window.innerWidth,
                    y: indexFinger.y * window.innerHeight
                };
            }
        }
        return null;
    }
}

export const handTracker = new HandTracker();
