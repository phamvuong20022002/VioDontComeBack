import './App.css';
import {BrowserRouter, Routes, Route, Redirect} from 'react-router-dom';
import Home from './pages/Home';
import EditorPage from './pages/EditorPage';
import PreviewPage from './pages/PreviewPage';
import NotFoundPage from './pages/NotFoundPage';
import { SharedStateProvider } from './helpers/SharedStateContext';
import {Toaster} from 'react-hot-toast'

function App() {
  return (
    <>
      <div>
        <Toaster
          position="top-right"
          toastOption={{
            success:{
              theme:{
                primary:'5271ff',
              }
            }
          }}
          ></Toaster>
      </div>
      {/* <SharedStateProvider> */}
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home/>}></Route>
            <Route path="/editor/:roomId" element={<EditorPage/>}></Route>
            <Route path="/preview/:roomId" element={<PreviewPage/>}></Route>
            <Route path="/*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      {/* </SharedStateProvider> */}

    </>
  );
}

export default App;



