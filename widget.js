/**
 * Tripmozy.com - Embeddable Floating Travel Planner Widget
 * 
 * Paste this single script onto ANY website (WordPress, Shopify, Webflow, etc.)
 * to display a clean floating Tripmozy AI Trip Planner button in the corner:
 * 
 * <script src="https://tripmozy.com/widget.js" data-trip-planner-url="https://tripmozy.com"></script>
 */

(function () {
  const currentScript = document.currentScript;
  const targetUrl = currentScript?.getAttribute('data-trip-planner-url') || 'index.html';

  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    .tripmozy-widget-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      background: #2563eb;
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 9999px;
      padding: 12px 22px;
      box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.4), 0 6px 10px -4px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 14px;
      font-weight: 700;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .tripmozy-widget-btn:hover {
      background: #1d4ed8;
      transform: translateY(-2px);
      box-shadow: 0 14px 28px -5px rgba(37, 99, 235, 0.5);
    }
    .tripmozy-modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 1000000;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      display: none;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .tripmozy-modal-overlay.active {
      display: flex;
    }
    .tripmozy-modal-content {
      width: 100%;
      max-width: 960px;
      height: 88vh;
      background: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      position: relative;
      border: 1px solid #e2e8f0;
    }
    .tripmozy-close-btn {
      position: absolute;
      top: 14px;
      right: 14px;
      background: #ffffff;
      color: #64748b;
      border: 1px solid #cbd5e1;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
      transition: all 0.15s;
      box-shadow: 0 2px 5px rgba(0,0,0,0.06);
    }
    .tripmozy-close-btn:hover {
      background: #f1f5f9;
      color: #0f172a;
      border-color: #94a3b8;
    }
    .tripmozy-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
  `;
  document.head.appendChild(style);

  // Create Button
  const btn = document.createElement('button');
  btn.className = 'tripmozy-widget-btn';
  btn.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
    </svg>
    <span>Plan Trip with Tripmozy (₹)</span>
  `;

  // Create Modal
  const modal = document.createElement('div');
  modal.className = 'tripmozy-modal-overlay';
  modal.innerHTML = `
    <div class="tripmozy-modal-content">
      <button class="tripmozy-close-btn" aria-label="Close">&times;</button>
      <iframe class="tripmozy-iframe" src="${targetUrl}" allow="geolocation"></iframe>
    </div>
  `;

  document.body.appendChild(btn);
  document.body.appendChild(modal);

  btn.addEventListener('click', () => {
    modal.classList.add('active');
  });

  const closeBtn = modal.querySelector('.tripmozy-close-btn');
  closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });
})();
