"use client";

import React, { useState } from 'react';
import { Box, Typography, Button, TextField, Drawer, Checkbox, ListItem, List, ListItemText, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { Search, ShoppingCart } from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import { getAllInventoryData, auth } from '@/firebaseConfig';
import { useRouter } from 'next/navigation';

const Home: React.FC = () => {
  const [popup, setPopup] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchBar, setSearchBar] = useState<string>('')

  const [errorMsg, setErrorMsg] = useState<string>('')
  const [error, setError] = useState<boolean>(false)

  const [cart, setCart] = useState<[]>([])

  const router = useRouter()
  const products_data = getAllInventoryData()

  const toggleDrawer = (open: boolean) => {
    return (event: React.MouseEvent | React.KeyboardEvent) => {
      if (event.type === "keydown" && (event as React.KeyboardEvent).key === "Tab" || (event as React.KeyboardEvent).key === "Shift") {
        return;
      }
      setDrawerOpen(open);
    };
  };
  
  const filterOptions = [
    "Apparel",
    "Bags & Shoes",
    "Snacks",
    "Miscellaneous",
  ];

  const handleDrawerAdminPress = () => {
    if (!auth.currentUser) {
      setErrorMsg("Access Denied. Please login first.")
      setError(true)
    } else {
      // admin@minimart.com, adminpassword
      if (auth.currentUser.email != "admin@minimart.com") {
        setErrorMsg("Access Denied.")
        setError(true)
      } else {
        console.log("Push to admin console page")
      }
    }
  }

  const handleCartPress = () => {
    setPopup("cart")
  }

  const shopTypeButtons = [
    { label: "About Us", action: () => console.log("About Us clicked") },
    { label: "Vouchers", action: () => console.log() },
    { label: "Transaction History", action: () => console.log() },
    { label: "Admin", action: handleDrawerAdminPress },
    { label: "Sign Out", action: () => console.log("Sign Out clicked") },
  ];

  const drawerContent = (
    <Box role="presentation" sx={{ width: 250, padding: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
        Categories
      </Typography>
      <List>
        {filterOptions.map((option) => (
          <ListItem key={option} disablePadding>
            <Checkbox />
            <ListItemText primary={option} />
          </ListItem>
        ))}
      </List>
      <List sx={{ mt: 1 }}>
        {shopTypeButtons.map((button) => (
          <ListItem key={button.label} disablePadding>
            <Button
              variant="text"
              onClick={button.action}
              sx={{
                width: '100%',
                justifyContent: 'flex-start',
                textTransform: 'none',
                fontWeight: 'bold',
                color: 'primary.main',
                '&:hover': { backgroundColor: 'primary.light' },
              }}
            >
              {button.label}
            </Button>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'gray.100' }}>
      {/* Header */}
      <Box
        component="header"
        sx={{
          backgroundColor: 'green',
          color: 'white',
          py: 4,
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 10,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 4 }}>
          {/* Left Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            <IconButton color="inherit" onClick={toggleDrawer(true)} sx={{ zIndex: 100 }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mr: 2 }}>
              Muhammadiyah Minimart
            </Typography>
            <TextField
              value={searchBar}
              onChange={e => setSearchBar(e.target.value)}
              variant="outlined"
              placeholder="Search for products"
              size="small"
              sx={{
                backgroundColor: 'white',
                borderRadius: 1,
                flex: 1,
              }}
            />
            <IconButton color="inherit">
              <Search />
            </IconButton>
            <IconButton color='inherit' onClick={handleCartPress}>
              <ShoppingCart/>
            </IconButton>
          </Box>

          {/* Right Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: 'white',
                color: 'green',
                fontWeight: 'bold',
                '&:hover': { backgroundColor: 'lightgray' }
              }}
              onClick={() => router.push("/login")}
            >
              Login
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ display: 'flex', flexGrow: 1, pt: 16 }}>
        {/* Product Catalog */}
        <Box sx={{ flexGrow: 1, p: 6 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 4 }}>
            Product Catalog
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
              gap: 6,
            }}
          >
            {Array(40)
              .fill(null)
              .map((_, index) => (
                <Box
                  key={index}
                  sx={{
                    backgroundColor: 'white',
                    p: 4,
                    borderRadius: 2,
                    boxShadow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <Box sx={{ height: 128, width: '100%', backgroundColor: 'gray.200', mb: 4 }}></Box>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                    Product Name
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2, width: '100%' }}
                    startIcon={<ShoppingCart />}
                  >
                    Add to Cart
                  </Button>
                </Box>
              ))}
          </Box>
        </Box>
      </Box>

      {/* Drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        {drawerContent}
      </Drawer>

      {/* Error Dialog */}
      <Dialog open={error}>
        <DialogTitle>Error</DialogTitle>
        <DialogContent>{errorMsg}</DialogContent>
        <DialogActions>
          <Button onClick={() => {setError(false); setErrorMsg('')}}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Cart Dialog */}
    </Box>
  );
};

export default Home;

