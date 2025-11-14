import { useState } from 'react'
import './App.css'
import SignIn from './components/SignIn'
import CreationForm from './components/CreationForm'

type User = {
  email: string
}

function App() {
  const [user, setUser] = useState<User | null>(null)

  return (
    <>
      {user ? (
        <CreationForm createdBy={user.email} onSignOut={() => setUser(null)} />
      ) : (
        <SignIn onSignIn={(u) => setUser({ email: u.email })} />
      )}
    </>
  )
}

export default App
