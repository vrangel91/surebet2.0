// Gerenciador de visibilidade da página para otimizar performance
export class VisibilityManager {
  constructor() {
    this.isVisible = !document.hidden;
    this.visibilityChangeHandlers = new Set();
    this.pageFocusHandlers = new Set();
    this.pageBlurHandlers = new Set();
    this.lastVisibilityChange = Date.now();
    
    this.init();
  }

  init() {
    // Detectar mudanças de visibilidade
    document.addEventListener('visibilitychange', () => {
      const wasVisible = this.isVisible;
      this.isVisible = !document.hidden;
      this.lastVisibilityChange = Date.now();
      
      console.log(`👁️ [Visibility] Página ${this.isVisible ? 'visível' : 'oculta'}`);
      
      // Notificar handlers
      this.visibilityChangeHandlers.forEach(handler => {
        try {
          handler(this.isVisible, wasVisible);
        } catch (error) {
          console.error('❌ [Visibility] Erro em handler:', error);
        }
      });
    });

    // Detectar foco da janela
    window.addEventListener('focus', () => {
      console.log('🎯 [Visibility] Janela ganhou foco');
      this.pageFocusHandlers.forEach(handler => {
        try {
          handler();
        } catch (error) {
          console.error('❌ [Visibility] Erro em focus handler:', error);
        }
      });
    });

    // Detectar perda de foco da janela
    window.addEventListener('blur', () => {
      console.log('😴 [Visibility] Janela perdeu foco');
      this.pageBlurHandlers.forEach(handler => {
        try {
          handler();
        } catch (error) {
          console.error('❌ [Visibility] Erro em blur handler:', error);
        }
      });
    });
  }

  // Adicionar handler para mudanças de visibilidade
  onVisibilityChange(handler) {
    this.visibilityChangeHandlers.add(handler);
    return () => this.visibilityChangeHandlers.delete(handler);
  }

  // Adicionar handler para foco da página
  onPageFocus(handler) {
    this.pageFocusHandlers.add(handler);
    return () => this.pageFocusHandlers.delete(handler);
  }

  // Adicionar handler para perda de foco da página
  onPageBlur(handler) {
    this.pageBlurHandlers.add(handler);
    return () => this.pageBlurHandlers.delete(handler);
  }

  // Verificar se a página está visível
  isPageVisible() {
    return this.isVisible;
  }

  // Verificar se a página está ativa (visível e com foco)
  isPageActive() {
    return this.isVisible && document.hasFocus();
  }

  // Tempo desde a última mudança de visibilidade
  getTimeSinceLastVisibilityChange() {
    return Date.now() - this.lastVisibilityChange;
  }

  // Verificar se a página esteve inativa por um tempo específico
  wasInactiveFor(ms) {
    return !this.isVisible && this.getTimeSinceLastVisibilityChange() > ms;
  }
}

// Instância global
export const visibilityManager = new VisibilityManager();

// Utilitário para criar timers que pausam quando a página não está visível
export class SmartTimer {
  constructor(callback, interval, options = {}) {
    this.callback = callback;
    this.interval = interval;
    this.options = {
      pauseWhenHidden: true,
      resumeDelay: 1000, // 1 segundo de delay ao retomar
      maxPauseTime: 300000, // 5 minutos máximo de pausa
      ...options
    };
    
    this.timerId = null;
    this.isPaused = false;
    this.pauseStartTime = null;
    this.lastExecution = 0;
    
    this.setupVisibilityHandling();
  }

  setupVisibilityHandling() {
    if (this.options.pauseWhenHidden) {
      this.unsubscribe = visibilityManager.onVisibilityChange((isVisible) => {
        if (isVisible && this.isPaused) {
          this.resume();
        } else if (!isVisible && !this.isPaused) {
          this.pause();
        }
      });
    }
  }

  start() {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
    
    this.timerId = setInterval(() => {
      if (!this.options.pauseWhenHidden || visibilityManager.isPageVisible()) {
        this.execute();
      }
    }, this.interval);
    
    console.log(`⏰ [SmartTimer] Timer iniciado (${this.interval}ms)`);
  }

  stop() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    
    console.log('⏹️ [SmartTimer] Timer parado');
  }

  pause() {
    if (this.timerId && !this.isPaused) {
      clearInterval(this.timerId);
      this.isPaused = true;
      this.pauseStartTime = Date.now();
      console.log('⏸️ [SmartTimer] Timer pausado (página oculta)');
    }
  }

  resume() {
    if (this.isPaused) {
      const pauseDuration = Date.now() - this.pauseStartTime;
      
      // Se pausou por muito tempo, não executa imediatamente
      if (pauseDuration > this.options.maxPauseTime) {
        console.log('⏰ [SmartTimer] Pausa muito longa, aguardando próximo ciclo');
        this.start();
        return;
      }
      
      // Delay antes de retomar para evitar execuções em lote
      setTimeout(() => {
        this.isPaused = false;
        this.pauseStartTime = null;
        this.start();
        console.log('▶️ [SmartTimer] Timer retomado');
      }, this.options.resumeDelay);
    }
  }

  execute() {
    const now = Date.now();
    
    // Evitar execuções muito frequentes
    if (now - this.lastExecution < this.interval * 0.8) {
      return;
    }
    
    this.lastExecution = now;
    
    try {
      this.callback();
    } catch (error) {
      console.error('❌ [SmartTimer] Erro na execução:', error);
    }
  }
}

// Utilitário para debounce inteligente
export class SmartDebounce {
  constructor(func, delay, options = {}) {
    this.func = func;
    this.delay = delay;
    this.options = {
      maxWait: delay * 3, // Máximo 3x o delay
      leading: false,
      trailing: true,
      ...options
    };
    
    this.timeoutId = null;
    this.maxTimeoutId = null;
    this.lastCallTime = 0;
    this.lastInvokeTime = 0;
    this.lastArgs = null;
    this.lastThis = null;
    this.result = null;
  }

  invoke(time) {
    const args = this.lastArgs;
    const thisArg = this.lastThis;
    
    this.lastArgs = null;
    this.lastThis = null;
    this.lastInvokeTime = time;
    this.result = this.func.apply(thisArg, args);
    return this.result;
  }

  leadingEdge(time) {
    this.lastInvokeTime = time;
    this.timeoutId = setTimeout(this.timerExpired.bind(this), this.delay);
    return this.options.leading ? this.invoke(time) : this.result;
  }

  remainingWait(time) {
    const timeSinceLastCall = time - this.lastCallTime;
    const timeSinceLastInvoke = time - this.lastInvokeTime;
    const timeWaiting = this.delay - timeSinceLastCall;
    
    return Math.min(timeWaiting, this.options.maxWait - timeSinceLastInvoke);
  }

  shouldInvoke(time) {
    const timeSinceLastCall = time - this.lastCallTime;
    const timeSinceLastInvoke = time - this.lastInvokeTime;
    
    return (this.lastCallTime === 0) || 
           (timeSinceLastCall >= this.delay) || 
           (timeSinceLastCall < 0) || 
           (timeSinceLastInvoke >= this.options.maxWait);
  }

  timerExpired() {
    const time = Date.now();
    if (this.shouldInvoke(time)) {
      return this.trailingEdge(time);
    }
    this.timeoutId = setTimeout(this.timerExpired.bind(this), this.remainingWait(time));
  }

  trailingEdge(time) {
    this.timeoutId = null;
    if (this.options.trailing && this.lastArgs) {
      return this.invoke(time);
    }
    this.lastArgs = null;
    this.lastThis = null;
    return this.result;
  }

  cancel() {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
    }
    this.lastInvokeTime = 0;
    this.lastCallTime = 0;
    this.lastArgs = null;
    this.lastThis = null;
    this.timeoutId = null;
  }

  flush() {
    return this.timeoutId === null ? this.result : this.trailingEdge(Date.now());
  }

  pending() {
    return this.timeoutId !== null;
  }
}
