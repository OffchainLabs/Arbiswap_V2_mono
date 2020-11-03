import React, { Suspense } from 'react'

import { useArbTokenBridge } from 'token-bridge-sdk'
import { useL1Provider4 } from '../hooks/useL1Provider'
import App from './App'
import { ethers } from 'ethers-old'

export default function BridgedApp() {
  const ethProvider = useL1Provider4(process.env.REACT_APP_L1_URL as string)
  // @ts-ignore
  const arbProvider = new ethers.providers.Web3Provider(window.ethereum)
  const arbSigner = arbProvider.getSigner(0)
const { eth: {withdraw: withdrawEth}, token: {withdraw: withdrawToken, add: addToken}, bridgeTokens}  = useArbTokenBridge(  
    // @ts-ignore
    ethProvider,
    arbProvider,
    // TODO
    "0xC34Fd04E698dB75f8381BFA7298e8Ae379bFDA71",
        // @ts-ignore
    ethProvider.getSigner( window.ethereum?.selectedAddress),
    arbSigner
  )
  
    const bridge = { withdrawEth, withdrawToken, addToken, bridgeTokens}
  return (
    <App bridge={bridge}/>
  )
}
