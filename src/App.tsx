import { useState } from 'react';
import { Button } from './components/Button';

function App() {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Action completed!");
    }, 2000);
  };
  return (
    <div className='text-center'>
     
      <Button onClick={handleClick} loading={loading} buttonName='Submit' />
 
    </div>
  )
}

export default App
