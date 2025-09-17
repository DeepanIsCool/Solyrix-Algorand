import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary'
import { WalletProvider } from '@txnlab/use-wallet-react'
import { WalletId, WalletManager } from '@txnlab/use-wallet'

const walletManager = new WalletManager({
  wallets: [
    WalletId.PERA,
    WalletId.DEFLY,
    WalletId.EXODUS,
    WalletId.KMD
  ]
})

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <WalletProvider manager={walletManager}>
        <App />
      </WalletProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
