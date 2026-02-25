import { createContext, useContext, useEffect, useState } from 'react'
import { getSiteSettings } from '../services/api'

/**
 * Site settings shape:
 * {
 *   site_name: string;
 *   site_description: string;
 *   contact_phone: string;
 *   contact_email: string;
 *   site_logo: string;
 *   address: string;
 *   [key: string]: string;
 * }
 */
const SiteSettingsContext = createContext({
  settings: {},
  isLoading: true
})

export const SiteSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getSiteSettings()
        if (Array.isArray(data)) {
          const mapped = {}
          data.forEach((item) => {
            if (item && item.key) {
              mapped[item.key] = item.value
            }
          })
          setSettings(mapped)
        }
      } catch (err) {
        console.error('Error loading site settings:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadSettings()
  }, [])

  return (
    <SiteSettingsContext.Provider value={{ settings, isLoading }}>
      {children}
    </SiteSettingsContext.Provider>
  )
}

export const useSiteSettings = () => {
  return useContext(SiteSettingsContext)
}

export default SiteSettingsContext


