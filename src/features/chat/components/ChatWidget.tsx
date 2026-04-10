import { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { ChatDrawer } from './ChatDrawer'

interface ChatWidgetProps {
  onClick?: () => void
}

export function ChatWidget(_props: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <ChatDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />

      {/* Botón flotante
          - bottom-20 en móvil para no tapar el bottom nav (h ≈ 56px)
          - bottom-6 en desktop donde no hay bottom nav
      */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        aria-label={isOpen ? 'Cerrar chat financiero' : 'Abrir chat financiero'}
        aria-expanded={isOpen}
        className={`
          fixed bottom-20 right-4 lg:bottom-6 lg:right-6
          z-[58] w-14 h-14 rounded-full shadow-xl
          bg-fn-emerald hover:bg-fn-emerald-dark
          text-white flex items-center justify-center
          transition-all duration-200 hover:scale-105 active:scale-95
          animate-[fadeSlideUp_0.3s_ease-out]
        `}
      >
        {isOpen
          ? <X size={22} />
          : <MessageCircle size={22} />
        }
      </button>
    </>
  )
}
