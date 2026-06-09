import React, { useState, useEffect, useRef } from 'react';
import styles from './Circle.module.css';

const Circle = ({ initialPosition, size, color, animationDuration, id }) => {
    const [currentPosition, setCurrentPosition] = useState(initialPosition);
    const [currentColor, setCurrentColor] = useState(color);
    const circleRef = useRef(null);

    const handleClick = () => {
        // Generate a random bright color
        const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
        setCurrentColor(randomColor);

        // Revert to original color after a short delay
        setTimeout(() => {
            setCurrentColor(color);
        }, 200);
    };

    // This useEffect is for initial positioning and potentially for updates from parent
    useEffect(() => {
        setCurrentPosition(initialPosition);
        setCurrentColor(color);
    }, [initialPosition, color]);

    return (
        <div
            ref={circleRef}
            className={styles.circle}
            style={{
                width: size,
                height: size,
                backgroundColor: currentColor,
                top: currentPosition.y,
                left: currentPosition.x,
                animation: `${styles.float} ${animationDuration}s ease-in-out infinite alternate`,
                transition: currentColor !== color ? 'background-color 0.1s ease-in-out' : 'none',
            }}
            onClick={handleClick}
        ></div>
    );
};

export default Circle;
