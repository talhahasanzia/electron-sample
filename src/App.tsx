import { useState } from 'react'
import './App.css'
import SignIn from './components/SignIn'
import CreationForm from './components/CreationForm'
import FormsList from './components/FormsList'

type User = {
  email: string
}

type View = 'list' | 'create'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [currentView, setCurrentView] = useState<View>('list')

  const handleSignOut = () => {
    setUser(null)
    setCurrentView('list')
  }

  const handleCreateNew = () => {
    setCurrentView('create')
  }

  const handleFormCreated = () => {
    setCurrentView('list')
  }

  const handleCancel = () => {
    setCurrentView('list')
  }

  return (
    <>
      {user ? (
        currentView === 'list' ? (
          <FormsList
            createdBy={user.email}
            onSignOut={handleSignOut}
            onCreateNew={handleCreateNew}
          />
        ) : (
          <CreationForm
            createdBy={user.email}
            onSignOut={handleSignOut}
            onFormCreated={handleFormCreated}
            onCancel={handleCancel}
          />
        )
      ) : (
        <SignIn onSignIn={(u) => setUser({ email: u.email })} />
      )}
    </>
  )
}

export default App
