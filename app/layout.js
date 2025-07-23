import './globals.css'

export const metadata = {
  title: 'Digital Twin Car - 3D Interactive Vehicle Simulation',
  description: 'Real-time 3D car visualization with engine, gear, and speed controls using Next.js and Three.js',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}