document.addEventListener('DOMContentLoaded', () => {
    const circles = document.querySelectorAll('.circle');
    const container = document.body;

    const circleData = Array.from(circles).map(circle => {
        const size = parseInt(getComputedStyle(circle).width);
        const initialTop = parseFloat(getComputedStyle(circle).top) / 100 * window.innerHeight;
        const initialLeft = parseFloat(getComputedStyle(circle).left) / 100 * window.innerWidth;
        const originalColor = getComputedStyle(circle).backgroundColor; // Store original color

        return {
            element: circle,
            x: initialLeft,
            y: initialTop,
            dx: (Math.random() - 0.5) * 4, // Random initial speed between -2 and 2
            dy: (Math.random() - 0.5) * 4, // Random initial speed between -2 and 2
            size: size,
            originalColor: originalColor // Add original color to data
        };
    });

    function animate() {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        circleData.forEach(data => {
            data.x += data.dx;
            data.y += data.dy;

            // Bounce off horizontal walls
            if (data.x + data.size > containerWidth || data.x < 0) {
                data.dx *= -1;
                // Adjust position to prevent sticking
                if (data.x < 0) data.x = 0;
                if (data.x + data.size > containerWidth) data.x = containerWidth - data.size;
            }

            // Bounce off vertical walls
            if (data.y + data.size > containerHeight || data.y < 0) {
                data.dy *= -1;
                // Adjust position to prevent sticking
                if (data.y < 0) data.y = 0;
                if (data.y + data.size > containerHeight) data.y = containerHeight - data.size;
            }

            data.element.style.left = `${data.x}px`;
            data.element.style.top = `${data.y}px`;
        });

        // Collision detection and response between circles
        for (let i = 0; i < circleData.length; i++) {
            for (let j = i + 1; j < circleData.length; j++) {
                const circleA = circleData[i];
                const circleB = circleData[j];

                const dx = circleB.x - circleA.x;
                const dy = circleB.y - circleA.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < (circleA.size / 2 + circleB.size / 2)) {
                    // Collision detected
                    // Simple response: reverse velocities and separate
                    const angle = Math.atan2(dy, dx);
                    const sin = Math.sin(angle);
                    const cos = Math.cos(angle);

                    // Rotate circleA's position and velocity
                    const posA = { x: 0, y: 0 }; // circleA is at the origin after rotation
                    const velA = {
                        x: circleA.dx * cos + circleA.dy * sin,
                        y: circleA.dy * cos - circleA.dx * sin
                    };

                    // Rotate circleB's position and velocity
                    const posB = {
                        x: dx * cos + dy * sin,
                        y: dy * cos - dx * sin
                    };
                    const velB = {
                        x: circleB.dx * cos + circleB.dy * sin,
                        y: circleB.dy * cos - circleB.dx * sin
                    };

                    // Swap velocities along the normal (x-axis after rotation)
                    const tempVelX = velA.x;
                    velA.x = velB.x;
                    velB.x = tempVelX;

                    // Rotate velocities back
                    circleA.dx = velA.x * cos - velA.y * sin;
                    circleA.dy = velA.y * cos + velA.x * sin;
                    circleB.dx = velB.x * cos - velB.y * sin;
                    circleB.dy = velB.y * cos + velB.x * sin;

                    // Separate circles to prevent sticking
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

        requestAnimationFrame(animate);
    }

    animate();

    // Handle window resizing
    window.addEventListener('resize', () => {
        circleData.forEach(data => {
            const currentLeft = parseFloat(data.element.style.left);
            const currentTop = parseFloat(data.element.style.top);

            data.x = Math.min(Math.max(0, currentLeft), window.innerWidth - data.size);
            data.y = Math.min(Math.max(0, currentTop), window.innerHeight - data.size);
        });
    });

    // Add click effect
    circles.forEach(circle => {
        circle.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent event from bubbling up to body if any
            const clickedCircleData = circleData.find(data => data.element === circle);

            if (clickedCircleData) {
                // Generate a random bright color
                const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
                clickedCircleData.element.style.backgroundColor = randomColor;
                clickedCircleData.element.style.transition = 'background-color 0.1s ease-in-out'; // Smooth transition

                // Revert to original color after a short delay
                setTimeout(() => {
                    clickedCircleData.element.style.backgroundColor = clickedCircleData.originalColor;
                }, 200); // Flash for 200ms
            }
        });
    });
});