import './App.css';
import {BrowserRouter, Routes, Route, Redirect} from 'react-router-dom';
import Home from './pages/Home';
import EditorPage from './pages/EditorPage';
import PreviewPage from './pages/PreviewPage';
import NotFoundPage from './pages/NotFoundPage';
import { AppProvider } from './contexts/main_context/index';
import {Toaster} from 'react-hot-toast'
import { memo } from 'react';

function App() {
  return (
    <AppProvider>
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

    </AppProvider>
  );
}

export default memo(App);



