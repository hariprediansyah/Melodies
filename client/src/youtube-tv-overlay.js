const youtubeTVOverlay = `
(function() {
  // Create overlay container
  const overlay = document.createElement('div');
  overlay.id = 'melodies-overlay';
  overlay.style.cssText = \`
    position: fixed;
    top: 20px;
    left: 20px;
    z-index: 9999;
    pointer-events: none;
  \`;

  // Create back button
  const backButton = document.createElement('button');
  backButton.id = 'melodies-back-btn';
  backButton.innerHTML = '← Back to Melodies';
  backButton.style.cssText = \`
    background: rgba(0, 0, 0, 0.8);
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    pointer-events: auto;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  \`;

  // Add hover effect
  backButton.addEventListener('mouseenter', () => {
    backButton.style.background = 'rgba(255, 0, 0, 0.9)';
    backButton.style.transform = 'scale(1.05)';
  });

  backButton.addEventListener('mouseleave', () => {
    backButton.style.background = 'rgba(0, 0, 0, 0.8)';
    backButton.style.transform = 'scale(1)';
  });

  // Add click handler
  backButton.addEventListener('click', () => {
    if (window.electronAPI) {
      window.electronAPI.loadHome();
    }
  });

  // Append elements
  overlay.appendChild(backButton);
  document.body.appendChild(overlay);

  // Auto-hide overlay after 3 seconds
  setTimeout(() => {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.5s ease';
  }, 3000);

  // Show overlay on mouse move
  let hideTimeout;
  document.addEventListener('mousemove', () => {
    overlay.style.opacity = '1';
    clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => {
      overlay.style.opacity = '0';
    }, 3000);
  });

  console.log('Melodies YouTube TV overlay loaded');
})();
`
