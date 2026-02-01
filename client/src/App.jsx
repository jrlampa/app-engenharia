import React from 'react';
import FormularioTracao from './components/FormularioTracao';

function App() {
  return (
    <div className="App">
      <header style={{ textAlign: 'center', padding: '20px', backgroundColor: '#282c34', color: 'white' }}>
        <h1>Engenharia App</h1>
      </header>
      <main>
        <FormularioTracao />
      </main>
    </div>
  );
}

export default App;
