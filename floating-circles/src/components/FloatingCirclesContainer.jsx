import React, { useState, useEffect, useRef, useCallback } from 'react';
import Circle from './Circle';

const initialCircleConfigs = [
    { id: 1, size: 80, color: '#FF6347', initialTop: 10, initialLeft: 15, animationDuration: 10 },
    { id: 2, size: 120, color: '#FFD700', initialTop: 30, initialLeft: 80, animationDuration: 12 },
    { id: 3, size: 60, color: '#32CD32', initialTop: 60, initialLeft: 5, animationDuration: 8 },
    { id: 4, size: 100, color: '#6A5ACD', initialTop: 80, initialLeft: 40, animationDuration: 11 },
    { id: 5, size: 70, color: '#FF69B4', initialTop: 5, initialLeft: 60, animationDuration: 9 },
    { id: 6, size: 90, color: '#00CED1', initialTop: 45, initialLeft: 25, animationDuration: 13 },
    { id: 7, size: 110, color: '#FFA07A', initialTop: 20, initialLeft: 50, animationDuration: 10.5 },
    { id: 8, size: 50, color: '#BA55D3', initialTop: 70, initialLeft: 70, animationDuration: 9.5 },
    { id: 9, size: 130, color: '#20B2AA', initialTop: 35, initialLeft: 10, animationDuration: 11.5 },
    { id: 10, size: 75, color: '#FF4500', initialTop: 55, initialLeft: 90, animationDuration: 8.5 },
];

const FloatingCirclesContainer = () => {
    const [circles, setCircles] = useState([]);
    const animationFrameId = useRef(null);
    const containerRef = useRef(null);

    // Initialize circles with random velocities and calculated positions
    useEffect(() => {
        const initialCircles = initialCircleConfigs.map(config => {
            const initialX = (config.initialLeft / 100) * window.innerWidth;
            const initialY = (config.initialTop / 100) * window.innerHeight;
            return {
                ...config,
                x: initialX,
                y: initialY,
                dx: (Math.random() - 0.5) * 4, // Random initial speed between -2 and 2
                dy: (Math.random() - 0.5) * 4, // Random initial speed between -2 and 2
            };
        });
        setCircles(initialCircles);
    }, []);

    const animate = useCallback(() => {
        setCircles(prevCircles => {
            const newCircles = prevCircles.map(circle => ({ ...circle })); // Create a deep copy for mutation
            const containerWidth = containerRef.current ? containerRef.current.clientWidth : window.innerWidth;
            const containerHeight = containerRef.current ? containerRef.current.clientHeight : window.innerHeight;

            newCircles.forEach(circle => {
                circle.x += circle.dx;
                circle.y += circle.dy;

                // Bounce off horizontal walls
                if (circle.x + circle.size > containerWidth || circle.x < 0) {
                    circle.dx *= -1;
                    if (circle.x < 0) circle.x = 0;
                    if (circle.x + circle.size > containerWidth) circle.x = containerWidth - circle.size;
                }

                // Bounce off vertical walls
                if (circle.y + circle.size > containerHeight || circle.y < 0) {
                    circle.dy *= -1;
                    if (circle.y < 0) circle.y = 0;
                    if (circle.y + circle.size > containerHeight) circle.y = containerHeight - circle.size;
                }
            });

            // Collision detection and response between circles
            for (let i = 0; i < newCircles.length; i++) {
                for (let j = i + 1; j < newCircles.length; j++) {
                    const circleA = newCircles[i];
                    const circleB = newCircles[j];

                    const dx = circleB.x - circleA.x;
                    const dy = circleB.y - circleA.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < (circleA.size / 2 + circleB.size / 2)) {
                        // Collision detected
                        const angle = Math.atan2(dy, dx);
                        const sin = Math.sin(angle);
                        const cos = Math.cos(angle);

                        const posA = { x: 0, y: 0 };
                        const velA = {
                            x: circleA.dx * cos + circleA.dy * sin,
                            y: circleA.dy * cos - circleA.dx * sin
                        };

                        const posB = {
                            x: dx * cos + dy * sin,
                            y: dy * cos - dx * sin
                        };
                        const velB = {
                            x: circleB.dx * cos + circleB.dy * sin,
                            y: circleB.dy * cos - circleB.dx * sin
                        };

                        const tempVelX = velA.x;
                        velA.x = velB.x;
                        velB.x = tempVelX;

                        circleA.dx = velA.x * cos - velA.y * sin;
                        circleA.dy = velA.y * cos + velA.x * sin;
                        circleB.dx = velB.x * cos - velB.y * sin;
                        circleB.dy = velB.y * cos + velB.x * sin;

                        const overlap = (circleA.size / 2 + circleB.size / 2) - distance;
                        const separationX = (overlap / 2) * Math.cos(angle);
                        const separationY = (overlap / 2) * Math.sin(angle);

                        circleA.x -= separationX;
                        circleA.y -= separationY;
                        circleB.x += separationX;
                        circleB.y += separationY;
                    }
                }
            }
            return newCircles;
        });
        animationFrameId.current = requestAnimationFrame(animate);
    }, []);

    useEffect(() => {
        animationFrameId.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrameId.current);
    }, [animate]);

    // Handle window resizing
    const handleResize = useCallback(() => {
        setCircles(prevCircles => {
            const containerWidth = containerRef.current ? containerRef.current.clientWidth : window.innerWidth;
            const containerHeight = containerRef.current ? containerRef.current.clientHeight : window.innerHeight;

            return prevCircles.map(circle => ({
                ...circle,
                x: Math.min(Math.max(0, circle.x), containerWidth - circle.size),
                y: Math.min(Math.max(0, circle.y), containerHeight - circle.size),
            }));
        });
    }, []);

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [handleResize]);

    return (
        <div ref={containerRef} style={{ width: '100vw', height: '100vh', position: 'relative' }}>
            {circles.map(circle => (
                <Circle
                    key={circle.id}
                    id={circle.id}
                    initialPosition={{ x: circle.x, y: circle.y }}
                    size={circle.size}
                    color={circle.color}
                    animationDuration={circle.animationDuration}
                />
            ))}
        </div>
    );
};

export default FloatingCirclesContainer;
