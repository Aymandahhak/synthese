'use client'

import React, { createContext, useState, useContext, useEffect } from 'react'

const ThemeContext = createContext({
  theme: 'light',
  setTheme: () => null
})

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    // Apply theme class to body
    document.body.classList.remove('light', 'dark')
    document.body.classList.add(theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
