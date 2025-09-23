import { ref } from 'vue';

export function useNotifications() {
  const showLiveRestrictedMessageState = ref(false);
  
  const playNotificationSound = (audioRef) => {
    if (!audioRef) return;
    
    try {
      audioRef.pause();
      audioRef.currentTime = 0;
      const playPromise = audioRef.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise.catch((err) => {
          console.log("Erro ao tocar som:", err);
        });
      }
    } catch (error) {
      console.log("Erro ao tocar som:", error);
    }
  };
  
  const showNotification = (message, type = "success") => {
    const notification = document.createElement("div");
    notification.className = "notification";
    notification.textContent = message;
    
    let backgroundColor = "var(--accent-primary)";
    let textColor = "var(--bg-primary)";
    
    if (type === "error") {
      backgroundColor = "var(--error-color)";
      textColor = "var(--text-primary)";
    } else if (type === "warning") {
      backgroundColor = "var(--warning-color)";
      textColor = "var(--bg-primary)";
    }
    
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: ${backgroundColor};
      color: ${textColor};
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 600;
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  };
  
  const showLiveRestrictedMessage = () => {
    showNotification(
      "A aba Live está temporariamente indisponível para manutenção",
      "warning"
    );
  };
  
  const hasSignificantDataChange = (oldSurebets, newSurebets) => {
    if (!oldSurebets || !newSurebets) return false;
    
    const oldKeys = Object.keys(oldSurebets);
    const newKeys = Object.keys(newSurebets);
    
    const hasNewKeys = newKeys.some(key => !oldKeys.includes(key));
    if (hasNewKeys) return true;
    
    for (const key of newKeys) {
      if (oldSurebets[key] && newSurebets[key]) {
        const oldData = JSON.stringify(oldSurebets[key]);
        const newData = JSON.stringify(newSurebets[key]);
        if (oldData !== newData) {
          const oldProfit = oldSurebets[key][0]?.profit || 0;
          const newProfit = newSurebets[key][0]?.profit || 0;
          
          if (Math.abs(newProfit - oldProfit) > 0.1) {
            return true;
          }
        }
      }
    }
    
    return false;
  };
  
  return {
    showLiveRestrictedMessageState,
    playNotificationSound,
    showNotification,
    showLiveRestrictedMessage,
    hasSignificantDataChange,
  };
}
