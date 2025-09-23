import { vi } from 'vitest';

// Mock do localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock do sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock do window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    hostname: 'localhost',
    protocol: 'http:',
    pathname: '/',
    search: '',
    hash: '',
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
  },
  writable: true,
});

// Mock do WebSocket
global.WebSocket = vi.fn(() => ({
  close: vi.fn(),
  send: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  readyState: 1,
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
}));

// Mock do fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
  })
);

// Mock do performance
global.performance = {
  now: vi.fn(() => Date.now()),
  mark: vi.fn(),
  measure: vi.fn(),
  getEntriesByType: vi.fn(() => []),
  getEntriesByName: vi.fn(() => []),
};

// Mock do document
Object.defineProperty(document, 'hidden', {
  writable: true,
  value: false,
});

// Mock do addEventListener
document.addEventListener = vi.fn();
document.removeEventListener = vi.fn();

// Mock do createElement
document.createElement = vi.fn((tagName) => {
  const element = {
    tagName: tagName.toUpperCase(),
    className: '',
    style: {},
    textContent: '',
    innerHTML: '',
    appendChild: vi.fn(),
    removeChild: vi.fn(),
    parentNode: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    setAttribute: vi.fn(),
    getAttribute: vi.fn(),
    removeAttribute: vi.fn(),
    querySelector: vi.fn(),
    querySelectorAll: vi.fn(() => []),
    scrollIntoView: vi.fn(),
  };
  
  if (tagName === 'audio') {
    element.play = vi.fn(() => Promise.resolve());
    element.pause = vi.fn();
    element.currentTime = 0;
  }
  
  return element;
});

// Mock do querySelector
document.querySelector = vi.fn();
document.querySelectorAll = vi.fn(() => []);

// Mock do getComputedStyle
window.getComputedStyle = vi.fn(() => ({
  getPropertyValue: vi.fn(() => ''),
}));

// Mock do URL
global.URL = vi.fn((url) => ({
  protocol: 'http:',
  hostname: 'localhost',
  pathname: '/',
  search: '',
  hash: '',
}));

// Mock do setTimeout e clearTimeout
global.setTimeout = vi.fn((callback, delay) => {
  return setTimeout(callback, delay);
});
global.clearTimeout = vi.fn();

// Mock do setInterval e clearInterval
global.setInterval = vi.fn((callback, delay) => {
  return setInterval(callback, delay);
});
global.clearInterval = vi.fn();

// Mock do console para evitar logs durante os testes
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};