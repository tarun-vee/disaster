export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-4">ReliefNet</h1>
      <p className="text-xl text-color-text-secondary">Smart Resource Allocation for Emergency Response and Disaster Management</p>
      <div className="mt-8 flex gap-4">
        <a href="/login" className="btn-secondary">Login</a>
        <a href="/register" className="btn-primary">Get Started</a>
      </div>
    </div>
  )
}
