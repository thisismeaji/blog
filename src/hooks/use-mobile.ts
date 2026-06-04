import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

export function useSidebarIsMobile() {
  const [isSidebarMobile, setIsSidebarMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia("(max-width: 1399px)")
    const onChange = () => {
      setIsSidebarMobile(window.innerWidth < 1400)
    }
    mql.addEventListener("change", onChange)
    setIsSidebarMobile(window.innerWidth < 1400)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isSidebarMobile
}

