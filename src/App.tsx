import Home from '@pages/Home';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AppLayout from '@layouts/Layout';
import NotFound from '@pages/NotFound';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path="projects" element={<> Projects</>} />
            <Route path="about" element={<>About</>} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
