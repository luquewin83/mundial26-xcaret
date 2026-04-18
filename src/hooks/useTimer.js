import { useState, useEffect } from 'react'

export function useTimer(kickOff) {
  const [timeLeft, setTimeLeft] = useState(null)

  useEffect(() => {
    if (!kickOff) return

    const calculate = () => {
      const now = new Date()
      const target = new Date(kickOff)
      const diff = target - now

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isFinished: true })
        return
      }

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
        isFinished: false,
      })
    }

    calculate()
    const id = setInterval(calculate, 1000)
    return () => clearInterval(id)
  }, [kickOff])

  return timeLeft
}
