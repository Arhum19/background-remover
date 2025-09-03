import { useState } from 'react'

export function useHistory() {
  const [history, setHistory] = useState([])
  const [index, setIndex] = useState(-1)

  const pushState = (state) => {
    const newHistory = history.slice(0, index + 1)
    newHistory.push(state)
    setHistory(newHistory)
    setIndex(newHistory.length - 1)
  }

  const undo = () => {
    if (index <= 0) return null
    const nextIndex = index - 1
    setIndex(nextIndex)
    return history[nextIndex]
  }

  const redo = () => {
    if (index >= history.length - 1) return null
    const nextIndex = index + 1
    setIndex(nextIndex)
    return history[nextIndex]
  }

  const canUndo = index > 0
  const canRedo = index < history.length - 1 && index >= 0

  return { history, pushState, undo, redo, canUndo, canRedo }
}

