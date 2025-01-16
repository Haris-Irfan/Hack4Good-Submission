"use client";

import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, Drawer, Checkbox, ListItem, List, ListItemText, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Select } from "@mui/material";
import { Search, ShoppingCart } from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import { getAllInventoryData, auth } from '@/firebaseConfig';
import { useRouter } from 'next/navigation';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

const Home: React.FC = () => {
  interface cartItem {
    item_name : string,
    quantity : number
  }

  const [popup, setPopup] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchBar, setSearchBar] = useState<string>('')

  const [errorMsg, setErrorMsg] = useState<string>('')
  const [error, setError] = useState<boolean>(false)

  const [cart, setCart] = useState<cartItem[]>([])
  const [products, setProducts] = useState<QueryDocumentSnapshot<DocumentData, DocumentData>[]>([])
  const [filteredProducts, setFilteredProducts] = useState<QueryDocumentSnapshot<DocumentData, DocumentData>[]>([])
  const router = useRouter()

  useEffect(() => {
    const getProducts = async () => {
      try {
        const data = await getAllInventoryData()
        if (data) {
          setProducts(data)
          setFilteredProducts(data)
        }
      } catch (error) {
        console.error(error)
      }
    }
    getProducts()
  }, [])

  useEffect(() => {
    if (searchBar == '') {
      setFilteredProducts(products)
    } else {
      const data = products.filter(x => x.data()["item_name"].toLowerCase().includes(searchBar.toLowerCase()))
      setFilteredProducts(data)
    }
  }, [searchBar])

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

  const handleAddToCartPress = (index : number) => {
    const cart_item = cart.find(x => x.item_name == products[index].data()["item_name"])
    if (cart_item) {
      if (cart_item.quantity < products[index].data()["quantity"]) {
        cart_item.quantity += 1
      } else {
        setError(true)
        setErrorMsg("Exceeds inventory quantity!")
      }
    } else {
      if (products[index].data()["quantity"] > 0) {
        cart.push({
          item_name : products[index].data()["item_name"],
          quantity: 1
        })
      }
    }
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
            {filteredProducts
              .map((x, index) => (
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
                    {x.data()["item_name"]}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2, width: '100%' }}
                    startIcon={<ShoppingCart />}
                    onClick={() => handleAddToCartPress(index)}
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
      <Dialog open={popup == "cart"} maxWidth='sm' fullWidth>
        <DialogTitle>Shopping Cart</DialogTitle>
        <DialogContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align='center'>Item</TableCell>
                  <TableCell align='right'>Quantity</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                  {
                    cart.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell align='center'>{item.item_name}</TableCell>
                        <TableCell align='right'>{item.quantity}</TableCell>
                      </TableRow>
                    ))
                  }
                </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPopup(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Home;

