import { Fragment} from 'react'
import {Routes,Route} from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import MyAccount from './pages/MyAccount'
import Solved from './pages/Solved'
import Recommended from './pages/Recommended'
function App() {

  return (
    <Fragment>
      <Routes>
        <Route path='/'element={<Home/>}/>
        <Route path='/login'element={<Login/>}/>
        <Route path='/register'element={<Register/>}/>
        <Route path = '/myAccount/:username' element={<MyAccount/>}/>
        <Route path='/solved' element={<Solved/>}/>
        <Route path='/daily' element={<Recommended/>}/>
      </Routes>
    </Fragment>
  )
}

export default App
