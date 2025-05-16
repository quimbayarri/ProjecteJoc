"use client"
import dynamic from "next/dynamic"
import { useState, useEffect } from "react"

// Importem el joc de manera dinàmica per evitar problemes amb SSR
const Game = dynamic(() => import("../components/Game"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="text-white text-2xl">Carregant el joc...</div>
    </div>
  ),
})

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black p-2">{mounted && <Game />}</main>
  )
}
