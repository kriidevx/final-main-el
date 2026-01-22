import { ReactNode } from 'react'
import Sidebar from '@/components/dashboard/sidebar'
import Navbar from '@/components/dashboard/navbar'
import { ModeSelector } from '@/components/dashboard/mode-selector'
import { EmergencyButton } from '@/components/dashboard/emergency-button'

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold">Vision Beyond EL</h1>
            <div className="flex items-center space-x-4">
              <ModeSelector />
              <EmergencyButton />
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  )
}
