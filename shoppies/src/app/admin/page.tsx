"use client";

import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, Drawer,ListItem, List,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TableContainer, Table,
  TableHead, TableRow, TableCell, TableBody, Paper, Alert,} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { getAllInventoryData, auth, getUserData, getAllUserData } from '@/firebaseConfig';
import { useRouter } from 'next/navigation';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { isUserSuspended, reenableUser, suspendUser, updateUserPassword } from '@/firebaseAdminApiCalls';

const Home: React.FC = () => {

  interface cartItem {
    item_name : string,
    quantity : number,
    cost: number
  }

  const [popup, setPopup] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchBar, setSearchBar] = useState<string>('')

  const [messageType, setMessageType] = useState<string>('') //success or error
  const [msg, setMsg] = useState<string>('')
  const [alert, setAlert] = useState<boolean>(false)

  const [products, setProducts] = useState<QueryDocumentSnapshot<DocumentData, DocumentData>[]>([])
  const [filteredProducts, setFilteredProducts] = useState<QueryDocumentSnapshot<DocumentData, DocumentData>[]>([])

  const [pageView, setPageView] = useState<string>("Account Management")

  const [allUserData, setAllUserData] = useState<DocumentData[]>([])
  const [targetUserEmail, setTargetUserEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')

  const router = useRouter()

  useEffect(() => {
    const getAllUserAccounts = async () => {
      try {
        const data = await getAllUserData()
        if (data) {
          setAllUserData(data)
        }
      } catch (error) {
        console.error(error)
      }
    }
    getAllUserAccounts()
    
  }, [])

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
    if (auth.currentUser) {
      const retrieveUserData = async () => {
        try {
          const data = await getUserData()
          if (data) {
            setUserData(data)
          }
        } catch (error) {
          console.error(error)
        }
      }
      retrieveUserData()
    }
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
  
  const handleSuspendUser = async (index : number) => {
    const user_email = allUserData[index].data().user_email
    try {
      await suspendUser(user_email)
      setMessageType('success')
      setMsg("Successfully suspended user")
      setAlert(true)
    } catch (error) {
      setMessageType('error')
      setMsg("Failed to suspend user" + error)
      setAlert(true)
    }
  }

  const handleReenableUser = async (index : number) => {
    const user_email = allUserData[index].data().user_email
    try {
      await reenableUser(user_email)
      setMessageType('success')
      setMsg("Successfully re-enabled user")
      setAlert(true)
    } catch (error) {
      setMessageType('error')
      setMsg("Failed to re-enable user" + error)
      setAlert(true)
    }
  }

  const handleResetPassword = async () => {
    try {
      await updateUserPassword(targetUserEmail, password)
      setMessageType('success')
      setMsg("Successfully updated user password")
      setAlert(true)
      setPopup(null)
      setTargetUserEmail('')
      setPassword('')
    } catch (error) {
      setMessageType('error')
      setMsg("Failed to update user password" + error)
      setAlert(true)
    }
  }

  const shopTypeButtons = [
    { label: "Account Management", action: () => console.log("Sign Out clicked") },
    { label: "Product Requests", action: () => console.log("Sign Out clicked") },
    { label: "Product Requests Summary", action: () => console.log("Sign Out clicked") },
    { label: "Inventory Management", action: () => console.log("Sign Out clicked") },
    { label: "Inventory Summary", action: () => console.log("Sign Out clicked") },
    { label: "Sign Out", action: () => console.log("Sign Out clicked") },
  ];


  const drawerContent = (
    <Box role="presentation" sx={{ width: 250, padding: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
        Categories
      </Typography>
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
              Muhammadiyah Minimart Admin Console
            </Typography>
          </Box>
          
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ display: 'flex', flexGrow: 1, pt: 16 }}>
        {/* Product Catalog */}
        <Box sx={{ flexGrow: 1, p: 6 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 4 }}>
            {pageView}
          </Typography>
          
          {
            pageView == "Account Management" &&
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align='center'>User Email Address</TableCell>
                  <TableCell align='center'>Voucher Amount</TableCell>
                  <TableCell align='center'>Transaction History</TableCell>
                  <TableCell align='center'></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {
                  allUserData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell align='center'>{item.data().user_email}</TableCell>
                      <TableCell align='center'>{item.data().voucher_amount}</TableCell>
                      <TableCell align='center'>
                        <List>
                          {
                            item.data().transaction_history.map((entry : any, id : number) => (
                              <ListItem key={id} sx={{ justifyContent: 'center' }}>
                                <Typography variant='body2'>{entry.quantity} {entry.item_name} was purchased on {entry.purchase_date.toDate().toLocaleString()}</Typography>
                              </ListItem>
                            ))
                          }
                        </List>
                      </TableCell>
                      <TableCell align='center'>
                        <Button onClick={e => {e.preventDefault(); handleSuspendUser(index)}}>Suspend User</Button>
                        <Button onClick={e => {e.preventDefault(); handleReenableUser(index)}}>Re-enable User</Button>
                        <Button onClick={() => {setPopup("resetPW"); setTargetUserEmail(item.data().user_email)}}>Reset Password</Button>
                      </TableCell>
                    </TableRow>
                  ))
                }
              </TableBody>
            </Table>
          }
          
        </Box>
      </Box>

      {/* Drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        {drawerContent}
      </Drawer>

      {/* Alert Dialog */}
      <Dialog open={alert}>
        <Alert severity={messageType == "success" ? 'success' : "error"} onClose={() => {setAlert(false); setMsg('')}}>{msg}</Alert>
      </Dialog>

 
      {/* Reset Password Dialog */}
      <Dialog open={popup =='resetPW'} maxWidth='md' fullWidth>
        <DialogTitle>Reset Password for {targetUserEmail}</DialogTitle>
        <TextField placeholder='Enter new password' value={password} onChange={e => setPassword(e.target.value)} sx={{margin:2}}/>
        <DialogActions sx = {{ justifyContent: 'space-between' }}>
          <Button onClick={() => setPopup(null)}>Close</Button>
          <Button onClick={handleResetPassword}>Update Password</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default Home;

