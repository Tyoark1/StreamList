import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

// Page Imports
import StreamList from './pages/StreamList.jsx';
import Movies from './pages/Movies.jsx';
import Cart from './pages/Cart.jsx';
import About from './pages/About.jsx';
import Login from './pages/Login.jsx';
import Account from './pages/Account.jsx';
import Checkout from './pages/Checkout.jsx';
import Register from './pages/Register.jsx';
import Subscriptions from './pages/Subscriptions.jsx';

// Component Imports
import ProtectedRoute from './components/ProtectedRoute';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />, 
      },

      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/",
            element: <StreamList />,
          },
          {
            path: "/movies",
            element: <Movies />,
          },
          {
            path: "/Subscriptions",
            element: <Subscriptions />,
          },
          {
            path: "/cart",
            element: <Cart />,
          },
          {
            path: "/account",
            element: <Account />,
          },
          {
            path: "/checkout",
            element: <Checkout />,
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);