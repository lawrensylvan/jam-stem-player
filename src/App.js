import './App.css'
import JamStemPlayer from './JamStemPlayer'
import songLibrary from './song_library'

function App() {
  return (
    <div className="App">
      <JamStemPlayer songDef={songLibrary[0]} />
    </div>
  );
}

export default App
