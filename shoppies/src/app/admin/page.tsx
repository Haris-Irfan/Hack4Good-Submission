"use client";

import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, Drawer,ListItem, List,
  IconButton, Dialog, DialogTitle, DialogActions, Table,
  TableHead, TableRow, TableCell, TableBody, Alert,
  Slider,} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { changeCostOfInventoryItem, createInventoryData, getAllInventoryData, getAllUserData, updateInventoryData } from '@/firebaseConfig';
import { useRouter } from 'next/navigation';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { reenableUser, suspendUser, updateUserPassword } from '@/firebaseAdminApiCalls';

const Home: React.FC = () => {

  const [popup, setPopup] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [messageType, setMessageType] = useState<string>('') //success or error
  const [msg, setMsg] = useState<string>('')
  const [alert, setAlert] = useState<boolean>(false)

  const [products, setProducts] = useState<QueryDocumentSnapshot<DocumentData, DocumentData>[]>([])
  const [targetProduct, setTargetProduct] = useState<string>('')
  const [adjustProductQuantity, setAdjustProductQuantity] = useState<number>(1)
  const [adjustPrice, setAdjustPrice] = useState<number>(1)
  const [itemName, setItemName] = useState<string>('')

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
        }
      } catch (error) {
        console.error(error)
      }
    }
    getProducts()
  }, [])


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

  const handleAdjustInventory = async (type : number) => {
    // type argument should be either 0 or 1. 0 represents subtract (purchase), 1 represents add (restock)
    if (type == 0) {
      const prod = products.find(x => x.data().item_name == targetProduct)
      if (prod) {
        if (prod.data().quantity < adjustProductQuantity) {
          setMessageType('error')
          setMsg("Invalid removal! Quantity to remove is greater than existing quantity")
          setAlert(true)
        } else {
          try {
            await updateInventoryData(targetProduct, adjustProductQuantity, 0)
            const data = await getAllInventoryData()
            if (data) {
              setProducts(data)
            }
            setMessageType('success')
            setMsg("Successfully updated item quantity")
            setAlert(true)
            setPopup(null)
            setTargetProduct('')
            setAdjustProductQuantity(1)
          } catch (error) {
            setMessageType('error')
            setMsg("Failed to update item quantity" + error)
            setAlert(true)
          }
        }
      }
    } else {
      try {
        await updateInventoryData(targetProduct, adjustProductQuantity, 1)
        const data = await getAllInventoryData()
        if (data) {
          setProducts(data)
        }
        setMessageType('success')
        setMsg("Successfully updated item quantity")
        setAlert(true)
        setPopup(null)
        setTargetProduct('')
        setAdjustProductQuantity(1)
      } catch (error) {
        setMessageType('error')
        setMsg("Failed to update item quantity" + error)
        setAlert(true)
      }
    }
  }

  const handleUpdatePrice = async () => {
    try {
      await changeCostOfInventoryItem(targetProduct, adjustPrice)
      const data = await getAllInventoryData()
      if (data) {
        setProducts(data)
      }
      setMessageType('success')
      setMsg("Successfully updated item price")
      setAlert(true)
      setPopup(null)
      setTargetProduct('')
      setAdjustPrice(1)
    } catch (error) {
      setMessageType('error')
      setMsg("Failed to update item price" + error)
      setAlert(true)
    }
  }

  const handleAddNewItem = async () => {
    try {
      await createInventoryData(itemName, adjustProductQuantity, adjustPrice)
      const data = await getAllInventoryData()
      if (data) {
        setProducts(data)
      }
      setMessageType('success')
      setMsg("Successfully added new item to inventory")
      setAlert(true)
      setPopup(null)
      setAdjustProductQuantity(1)
      setAdjustPrice(1)
    } catch (error) {
      setMessageType('error')
      setMsg("Failed to add new item to inventory" + error)
      setAlert(true)
    }
  }

  const shopTypeButtons = [
    { label: "Account Management", action: () => setPageView("Account Management") },
    { label: "Product Requests", action: () => console.log("Sign Out clicked") },
    { label: "Product Requests Summary", action: () => console.log("Sign Out clicked") },
    { label: "Inventory Management", action: () => {setPageView("Inventory Management"); console.log(products)} },
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
          
          {/* Account Management Tab */}
          {
            pageView == "Account Management" &&
            <Box>
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
              <Button sx={{margin:2}}>New User</Button>
            </Box>
          }

          {/* Inventory Management Tab */}
          {
            pageView == "Inventory Management" &&
            <Box>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align='center'>Item</TableCell>
                    <TableCell align='center'>Quantity</TableCell>
                    <TableCell align='center'>Current Price</TableCell>
                    <TableCell align='center'>Logs</TableCell>
                    <TableCell align='center'></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    products.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell align='center'>{item.data().item_name}</TableCell>
                        <TableCell align='center'>{item.data().quantity}</TableCell>
                        <TableCell align='center'>${item.data().cost}</TableCell>
                        <TableCell align='center'>
                          <List>
                            {
                              item.data()["log"].map((entry : string, id : number) => (
                                <ListItem key={id} sx={{ justifyContent: 'center' }}>
                                  <Typography variant='body2'>{id + 1}. {entry}</Typography>
                                </ListItem>
                              ))
                            }
                          </List>
                        </TableCell>
                        
                        <TableCell align='center'>
                          <Button onClick={ () => {setPopup("adjustQuantity"); setTargetProduct(item.data().item_name) }}>Adjust Quantity</Button>
                          <Button onClick={ () => {setPopup("changePrice") ; setTargetProduct(item.data().item_name)} }>Change Price</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
              <Button sx={{margin:2}} onClick={() => setPopup('newItem')}>New Item</Button>
            </Box>
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
        <DialogTitle sx={{textAlign:'center'}}>Reset Password for {targetUserEmail}</DialogTitle>
        <TextField placeholder='Enter new password' value={password} onChange={e => setPassword(e.target.value)} sx={{margin:2}}/>
        <DialogActions sx = {{ justifyContent: 'space-between' }}>
          <Button onClick={() => setPopup(null)}>Close</Button>
          <Button onClick={handleResetPassword}>Update Password</Button>
        </DialogActions>
      </Dialog>

      {/* Adjust Quantity Dialog */}
      <Dialog open={popup == 'adjustQuantity'} maxWidth='md' fullWidth>
        <DialogTitle sx={{textAlign:'center'}}>Adjust Quantity for {targetProduct}</DialogTitle>
          <Box sx={{ width: 300, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2, alignSelf:'center' }}>
            <Slider min={1} max={200} step={1} value={adjustProductQuantity} onChange={(e : any) => setAdjustProductQuantity(e.target.value)}/>
            <TextField disabled variant='outlined' size='small' value={adjustProductQuantity} sx={{width: 75}}></TextField>
          </Box>
        <DialogActions sx = {{ justifyContent: 'space-between' }}>
          <Button onClick={() => setPopup(null)}>Close</Button>
          <Box>
            <Button onClick={() => handleAdjustInventory(1)}>Add</Button>
            <Button onClick={() => handleAdjustInventory(0)}>Remove</Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Change Price Dialog */}
      <Dialog open={popup == 'changePrice'} maxWidth='md' fullWidth>
        <DialogTitle sx={{textAlign:'center'}}>Adjust Price for {targetProduct}</DialogTitle>
          <Box sx={{ width: 300, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2, alignSelf:'center' }}>
            <Slider min={0.01} max={300} step={0.01} value={adjustPrice} onChange={(e : any) => setAdjustPrice(e.target.value)}/>
            <TextField disabled variant='outlined' size='small' value={adjustPrice} sx={{width: 120}}></TextField>
          </Box>
        <DialogActions sx = {{ justifyContent: 'space-between' }}>
          <Button onClick={() => setPopup(null)}>Close</Button>
          <Button onClick={handleUpdatePrice}>Update</Button>
        </DialogActions>
      </Dialog>

      {/* New Item Dialog */}
      <Dialog open={popup == 'newItem'} maxWidth='md' fullWidth>
        <DialogTitle sx={{textAlign:'center'}}>Adjust New Item to Inventory</DialogTitle>
          <Box sx={{ display:'flex', flexDirection:'row', gap: 2, alignSelf:'center', margin:1}}>
            <Typography sx={{marginTop:1}}>Item Name:</Typography>
            <TextField placeholder='Enter Item Name' value={itemName} onChange={e => setItemName(e.target.value)} size='small'/>
          </Box>

          <Box sx={{ width: 300, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2, alignSelf:'center', margin:1 }}>
            <Typography>Quantity:</Typography>
            <Slider min={1} max={200} step={1} value={adjustProductQuantity} onChange={(e : any) => setAdjustProductQuantity(e.target.value)}/>
            <TextField disabled variant='outlined' size='small' value={adjustProductQuantity} sx={{width: 120}}></TextField>
          </Box>
          
          <Box sx={{ width: 300, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2, alignSelf:'center', margin: 1 }}>
            <Typography>Price:</Typography>
            <Slider min={0.01} max={300} step={0.01} value={adjustPrice} onChange={(e : any) => setAdjustPrice(e.target.value)}/>
            <TextField disabled variant='outlined' size='small' value={adjustPrice} sx={{width: 160}}></TextField>
          </Box>
        <DialogActions sx = {{ justifyContent: 'space-between' }}>
          <Button onClick={() => setPopup(null)}>Close</Button>
          <Button onClick={handleAddNewItem}>Add Item</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default Home;

