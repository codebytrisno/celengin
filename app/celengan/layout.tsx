import { Navbar } from '@/components/layout/navbar'

export default function CelenganLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  )
}
