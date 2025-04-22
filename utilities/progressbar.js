const drawProgressBar = (ctx, x, y, width, height, percentage, color = '#ffffff') => {
    // Draw the background (optional, can be commented out if not needed)
    ctx.fillStyle = 'rgb(255, 255, 255)'; // light gray/white background
    ctx.fillRect(x, y, width, height);
  
    // Clamp percentage between 0 and 100
    const clampedPercent = Math.max(0, Math.min(percentage, 100));
    const filledWidth = (width * clampedPercent) / 100;
  
    // Draw the filled portion
    ctx.fillStyle = color;
    ctx.fillRect(x, y, filledWidth, height);
}

module.exports = { drawProgressBar };