import React, { useEffect, useRef, useState } from 'react';
import { WORD_LIST, COLORS } from '../types';
import type { Bubble } from '../types';
import { audioManager } from '../services/audioManager';
import { handTracker } from '../services/handTracker';

interface BubbleCanvasProps {
    onPop?: (bubble: Bubble) => void;
}

const BubbleCanvas: React.FC<BubbleCanvasProps> = ({ onPop }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const bubblesRef = useRef<Bubble[]>([]);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const initTracking = async () => {
            await handTracker.initialize();
            if (videoRef.current) {
                await handTracker.start(videoRef.current);
            }
            setIsReady(true);
        };
        initTracking();
    }, []);

    // Animation loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        bubblesRef.current = Array.from({ length: 8 }).map((_, i) => ({
            id: Math.random().toString(36).substr(2, 9),
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: 40 + Math.random() * 40,
            word: WORD_LIST[i % WORD_LIST.length].kr,
            color: COLORS[i % COLORS.length],
            isGolden: Math.random() > 0.9,
            velocity: {
                x: (Math.random() - 0.5) * 1.5,
                y: (Math.random() - 0.5) * 1.5
            }
        }));

        let animationFrame: number;

        const popBubble = (id: string) => {
            const popped = bubblesRef.current.find(b => b.id === id);
            if (popped && onPop) {
                onPop(popped);
            }
            bubblesRef.current = bubblesRef.current.filter(b => b.id !== id);
            audioManager.playPop();
            // Respawn
            const newBubble: Bubble = {
                id: Math.random().toString(36).substr(2, 9),
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                radius: 40 + Math.random() * 40,
                word: WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)].kr,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                isGolden: Math.random() > 0.8, // Slightly increased chance for demo
                velocity: {
                    x: (Math.random() - 0.5) * 1.5,
                    y: (Math.random() - 0.5) * 1.5
                }
            };
            bubblesRef.current.push(newBubble);
        };

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 1. Get Finger Position
            const finger = handTracker.getFingerPosition();

            // 2. Update and Draw Bubbles
            bubblesRef.current.forEach(bubble => {
                bubble.x += bubble.velocity.x;
                bubble.y += bubble.velocity.y;

                if (bubble.x - bubble.radius < 0 || bubble.x + bubble.radius > canvas.width) bubble.velocity.x *= -1;
                if (bubble.y - bubble.radius < 0 || bubble.y + bubble.radius > canvas.height) bubble.velocity.y *= -1;

                // Collision Check (Finger or Mouse)
                if (finger) {
                    const dist = Math.sqrt((bubble.x - finger.x) ** 2 + (bubble.y - finger.y) ** 2);
                    if (dist < bubble.radius) {
                        popBubble(bubble.id);
                    }
                }

                // Draw Bubble
                ctx.beginPath();
                ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);

                // Special handling for Golden Bubbles
                if (bubble.isGolden) {
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';
                } else {
                    ctx.shadowBlur = 0;
                }

                const gradient = ctx.createRadialGradient(
                    bubble.x - bubble.radius * 0.2,
                    bubble.y - bubble.radius * 0.2,
                    0,
                    bubble.x,
                    bubble.y,
                    bubble.radius
                );

                if (bubble.isGolden) {
                    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
                    gradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.7)');
                    gradient.addColorStop(1, 'rgba(218, 165, 32, 0.5)');
                } else {
                    gradient.addColorStop(0, 'white');
                    gradient.addColorStop(0.3, bubble.color);
                    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
                }

                ctx.fillStyle = gradient;
                ctx.fill();
                ctx.lineWidth = bubble.isGolden ? 3 : 1;
                ctx.strokeStyle = bubble.isGolden ? 'gold' : 'rgba(255, 255, 255, 0.3)';
                ctx.stroke();

                // Draw Text
                ctx.fillStyle = bubble.isGolden ? '#946000' : '#2c3e50';
                ctx.font = `bold ${bubble.radius * 0.4}px Outfit`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(bubble.word, bubble.x, bubble.y);
            });

            ctx.shadowBlur = 0; // Reset shadow for other drawings

            // 3. Draw Finger Feedback
            if (finger) {
                ctx.beginPath();
                ctx.arc(finger.x, finger.y, 10, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.fill();
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
                ctx.stroke();
            }

            animationFrame = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrame);
        };
    }, []);

    return (
        <>
            <video
                ref={videoRef}
                style={{ display: 'none', position: 'absolute' }}
                playsInline
            />
            <canvas ref={canvasRef} />
            {!isReady && (
                <div className="glass-panel" style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    padding: '1rem 2rem',
                    zIndex: 100
                }}>
                    AI 엔진 초기화 중...
                </div>
            )}
        </>
    );
};

export default BubbleCanvas;
