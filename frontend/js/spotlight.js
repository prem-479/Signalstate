/**
 * Signalstate - Spotlight Effect
 * Handles mouse-tracking radial glows for interactive cards.
 */

document.addEventListener('DOMContentLoaded', () => {
    const spotlightCards = document.querySelectorAll('[data-spotlight]');

    const handleMouseMove = (e) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    };

    spotlightCards.forEach(card => {
        card.addEventListener('mousemove', handleMouseMove);
    });
});
