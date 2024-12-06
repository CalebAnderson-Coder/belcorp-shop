import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Container } from '@mui/material';
import { LoginPage } from './pages/LoginPage';
import { ProductListPage } from './pages/ProductListPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { Navbar } from './components/Navbar';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Routes>
            <Route path="/" element={<ProductListPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;
