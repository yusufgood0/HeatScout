import './style.css'
import { registerSW } from 'virtual:pwa-register'

// Register service worker with auto-update
const updateSW = registerSW({
  onNeedRefresh() {
    const shouldUpdate = confirm('New content available. Reload to update?')
    if (shouldUpdate) updateSW(true)
  },
  onOfflineReady() {
    console.log('App ready to work offline')
    showToast('Ready to work offline!')
  },
})

// ─── App State ───────────────────────────────────────────────────────────────

interface AppState {
  isOnline: boolean
  installPrompt: BeforeInstallPromptEvent | null
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const state: AppState = {
  isOnline: navigator.onLine,
  installPrompt: null,
}

// ─── PWA Install Prompt ───────────────────────────────────────────────────────

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  state.installPrompt = e as BeforeInstallPromptEvent
  showInstallBanner()
})

window.addEventListener('appinstalled', () => {
  state.installPrompt = null
  hideInstallBanner()
  showToast('App installed successfully!')
})

// ─── Online / Offline Detection ───────────────────────────────────────────────

window.addEventListener('online', () => {
  state.isOnline = true
  updateStatusIndicator()
  showToast('Back online!')
})

window.addEventListener('offline', () => {
  state.isOnline = false
  updateStatusIndicator()
  showToast('You are offline. App still works!')
})

// ─── Render ──────────────────────────────────────────────────────────────────

function render(): void {
  const app = document.getElementById('app')!
  app.innerHTML = `
    <div class="layout">
      <header class="header">
        <div class="header-inner">
          <div class="logo">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" stroke="currentColor" stroke-width="1.5" fill="none"/>
              <polygon points="14,7 21,11 21,17 14,21 7,17 7,11" stroke="currentColor" stroke-width="1" fill="currentColor" fill-opacity="0.15"/>
            </svg>
            <span>VitePWA</span>
          </div>
          <div class="header-right">
            <div id="status-indicator" class="status-indicator ${state.isOnline ? 'online' : 'offline'}">
              <span class="status-dot"></span>
              <span class="status-label">${state.isOnline ? 'Online' : 'Offline'}</span>
            </div>
          </div>
        </div>
      </header>

      <main class="main">
        <section class="hero">
          <div class="hero-eyebrow">Progressive Web App</div>
          <h1 class="hero-title">Vite <span class="accent">+</span> TypeScript <span class="accent">+</span> PWA</h1>
          <p class="hero-sub">A production-ready starter. Install it, use it offline, ship it to GitHub Pages.</p>
          <div class="hero-actions">
            <button id="install-btn" class="btn btn-primary" style="display:none">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1v9M4 7l4 4 4-4M2 13h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
              Install App
            </button>
            <a href="https://vitejs.dev" target="_blank" rel="noopener" class="btn btn-ghost">Vite Docs ↗</a>
          </div>
        </section>

        <section class="features">
          <div class="feature-grid">
            ${features.map(f => `
              <div class="feature-card">
                <div class="feature-icon">${f.icon}</div>
                <h3 class="feature-title">${f.title}</h3>
                <p class="feature-desc">${f.desc}</p>
              </div>
            `).join('')}
          </div>
        </section>

        <section class="counter-section">
          <h2 class="section-title">Counter</h2>
          <p class="section-sub">State persists in localStorage across refreshes.</p>
          <div class="counter">
            <button class="counter-btn" id="decrement">−</button>
            <span class="counter-value" id="counter-value">${getCount()}</span>
            <button class="counter-btn" id="increment">+</button>
          </div>
          <button class="btn btn-ghost btn-sm" id="reset-btn">Reset</button>
        </section>
      </main>

      <footer class="footer">
        <p>Built with <a href="https://vitejs.dev" target="_blank" rel="noopener">Vite</a> · <a href="https://vite-pwa-org.netlify.app" target="_blank" rel="noopener">vite-plugin-pwa</a> · TypeScript</p>
      </footer>
    </div>

    <!-- Install Banner -->
    <div id="install-banner" class="install-banner" style="display:none">
      <span>Install this app for a better experience</span>
      <div class="install-banner-actions">
        <button id="banner-install-btn" class="btn btn-primary btn-sm">Install</button>
        <button id="banner-dismiss-btn" class="btn btn-ghost btn-sm">Dismiss</button>
      </div>
    </div>

    <!-- Toast -->
    <div id="toast" class="toast" aria-live="polite"></div>
  `

  bindEvents()
}

// ─── Feature Cards Data ───────────────────────────────────────────────────────

const features = [
  {
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>`,
    title: 'Lightning Fast',
    desc: 'Powered by Vite for instant HMR and optimized production builds.',
  },
  {
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    title: 'Works Offline',
    desc: 'Service worker caches assets so your app loads even without network.',
  },
  {
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
    title: 'TypeScript',
    desc: 'Full type safety from day one. Strict mode enabled out of the box.',
  },
  {
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    title: 'Installable',
    desc: 'Full PWA manifest. Users can install it on any device, any OS.',
  },
  {
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>`,
    title: 'Auto Updates',
    desc: 'New builds are detected automatically. Users get a refresh prompt.',
  },
  {
    icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>`,
    title: 'GitHub Pages Ready',
    desc: 'Deploy with a single command using the included workflow scaffold.',
  },
]

// ─── Counter Logic ────────────────────────────────────────────────────────────

function getCount(): number {
  return parseInt(localStorage.getItem('pwa-count') ?? '0', 10)
}

function setCount(n: number): void {
  localStorage.setItem('pwa-count', String(n))
  const el = document.getElementById('counter-value')
  if (el) el.textContent = String(n)
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────

function updateStatusIndicator(): void {
  const el = document.getElementById('status-indicator')
  const label = el?.querySelector('.status-label')
  if (!el || !label) return
  el.className = `status-indicator ${state.isOnline ? 'online' : 'offline'}`
  label.textContent = state.isOnline ? 'Online' : 'Offline'
}

let toastTimer: ReturnType<typeof setTimeout>
function showToast(msg: string): void {
  const toast = document.getElementById('toast')
  if (!toast) return
  toast.textContent = msg
  toast.classList.add('visible')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => toast.classList.remove('visible'), 3000)
}

function showInstallBanner(): void {
  const banner = document.getElementById('install-banner')
  const btn = document.getElementById('install-btn')
  if (banner) banner.style.display = 'flex'
  if (btn) btn.style.display = 'inline-flex'
}

function hideInstallBanner(): void {
  const banner = document.getElementById('install-banner')
  const btn = document.getElementById('install-btn')
  if (banner) banner.style.display = 'none'
  if (btn) btn.style.display = 'none'
}

async function triggerInstall(): Promise<void> {
  if (!state.installPrompt) return
  await state.installPrompt.prompt()
  const { outcome } = await state.installPrompt.userChoice
  if (outcome === 'accepted') state.installPrompt = null
}

// ─── Event Binding ────────────────────────────────────────────────────────────

function bindEvents(): void {
  document.getElementById('increment')?.addEventListener('click', () => setCount(getCount() + 1))
  document.getElementById('decrement')?.addEventListener('click', () => setCount(getCount() - 1))
  document.getElementById('reset-btn')?.addEventListener('click', () => setCount(0))
  document.getElementById('install-btn')?.addEventListener('click', triggerInstall)
  document.getElementById('banner-install-btn')?.addEventListener('click', triggerInstall)
  document.getElementById('banner-dismiss-btn')?.addEventListener('click', hideInstallBanner)
}

// ─── Boot ─────────────────────────────────────────────────────────────────────

render()
