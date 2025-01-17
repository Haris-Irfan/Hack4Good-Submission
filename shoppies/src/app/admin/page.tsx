"use client";

import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, TextField, Drawer,ListItem, List,
  IconButton, Dialog, DialogTitle, DialogActions, Table,
  TableHead, TableRow, TableCell, TableBody, Alert,
  Slider,
  DialogContent,
  TableContainer,
  Paper,} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

import { changeCostOfInventoryItem, createInventoryData, createUserData, createUserDataViaAdmin, getAllInventoryData, getAllUserData, getLast7DaysRequestData, getPendingRequestData, getRequestData, getTransactionDataByEmail, SignOut, updateInventoryData, updateRequestData } from '@/firebaseConfig';
import { useRouter } from 'next/navigation';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { createNewUser, reenableUser, suspendUser, updateUserPassword } from '@/firebaseAdminApiCalls';

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
  const [userList, setUserList] = useState<DocumentData>()

  const [allRequests, setAllRequests] = useState<QueryDocumentSnapshot<DocumentData, DocumentData>[]>([])
  const [pendingRequests, setPendingRequests] = useState<QueryDocumentSnapshot<DocumentData, DocumentData>[]>([])
  const [last7Requests, setLast7Requests] = useState<QueryDocumentSnapshot<DocumentData, DocumentData>[]>([])
  const [targetRequest, setTargetRequest] = useState<number>(0)

  const [pageView, setPageView] = useState<string>("Account Management")

  const [usersTransHist, setUsersTransHist] = useState()
  const [allUserData, setAllUserData] = useState<any[]>([])
  const [targetUserEmail, setTargetUserEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')

  const router = useRouter()

  useEffect(() => {
    const getAllUserAccounts = async () => {
      try {
        const data = await getAllUserData()
        if (data) {
          setAllUserData(data)
          const email_list = data.map(x => x.data().user_email)
          const txn_hist_list : any = await Promise.all(email_list.map(async (x) => {
            return await getTransactionDataByEmail(x)
          }))
          setUsersTransHist(txn_hist_list)
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

  useEffect(() => {
    const getPendingRequests = async () => {
      try {
        let data = await getPendingRequestData()
        if (data) {
          setPendingRequests(data)
        }
        data = await getRequestData()
        if (data) {
          setAllRequests(data)
        }
        data = await getLast7DaysRequestData()
        if (data) {
          setLast7Requests(data)
        }
      } catch (error) {
        console.error(error)
      }
    }
    getPendingRequests()
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
      const response = await updateUserPassword(targetUserEmail, password)
      if (response?.ok) {
        setMessageType('success')
        setMsg("Successfully updated user password")
        setAlert(true)
        setPopup(null)
        setTargetUserEmail('')
        setPassword('')
      }
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

  const handleAddNewUser = async () => {
    try {
      await createNewUser(itemName, password)
      await createUserDataViaAdmin(itemName, 0.00)
      const data = await getAllUserData()
      if (data) {
        setAllUserData(data)
      }
      setMessageType('success')
      setMsg("Successfully added new user")
      setAlert(true)
      setPopup(null)
      setItemName('')
      setPassword('')
    } catch (error) {
      setMessageType('error')
      setMsg("Failed to add new user" + error)
      setAlert(true)
    }
  }


  const most_requested = () => {
    if (last7Requests) {
      const itemNames = last7Requests.map(x => x.data().item_name)
      console.log(itemNames)
      const freqMap = itemNames.reduce((acc, x) => {
        acc[x] = (acc[x] || 0 ) + 1
        return acc
      }, {} as Record<string, number>)

      const freqArr : [string, number][]= Object.entries(freqMap)
      console.log(freqArr)
      freqArr.sort((a, b) => b[1] - a[1])
      console.log(freqArr.length)
      
      return freqArr.slice(0, 3)
   }
  }

  const handle_sign_out = async () => {
    await SignOut()
    router.push('../login/')
  }

  const handleAdjustRequest = async (index : number) => {
    try {
      await updateRequestData(pendingRequests[targetRequest].ref, index == 0 ? "rejected" : "approved", pendingRequests[targetRequest].data().log)
      let data = await getPendingRequestData()
      if (data) {
        setPendingRequests(data)
      } else {
        setPendingRequests([])
      }
      data = await getRequestData()
      if (data) {
        setAllRequests(data)
      }
      data = await getLast7DaysRequestData()
      if (data) {
        setLast7Requests(data)
      }
      setMessageType('success')
      setMsg("Successfully updated request")
      setAlert(true)
      setPopup(null)
      setTargetRequest(0)
    } catch (error) {
      setMessageType('error')
      setMsg("Failed to update request" + error)
      setAlert(true)
    }
  }

  const create_purchase_string = (arr : any[]) => {
    let new_string : string = ''
    for (let i = 0; i < arr.length; i++) {
      new_string = new_string + arr[i].quantity + "x " + arr[i].item_name + ", "
    }
    return new_string
  }

  const shopTypeButtons = [
    { label: "Account Management", action: () => setPageView("Account Management") },
    { label: "Inventory Management", action: () => setPageView("Inventory Management") },
    { label: "Inventory Summary", action: () => setPageView("Inventory Summary") },
    { label: "Product Requests Management", action: () => setPageView("Product Requests Management") },
    { label: "Product Requests Summary", action: () => setPageView("Product Requests Summary") },
    { label: "Sign Out", action: handle_sign_out },
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
                              usersTransHist && usersTransHist[index] &&
                              usersTransHist[index].map((x : any, id : number) => (
                                <ListItem key={id} sx={{justifyContent:'center'}}>
                                  <Typography variant='body2'>
                                    Purchased {create_purchase_string(x.data().purchase)} on {x.data().purchase_date.toDate().toLocaleString()}
                                  </Typography>
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
              <Button sx={{margin:2}} onClick={() => setPopup('newUser')}>New User</Button>
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
          
          {/* Inventory Summary Tab */}
          {
            pageView == "Inventory Summary" &&
            <Box>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align='center'>Item</TableCell>
                    <TableCell align='center'>Quantity</TableCell>
                    <TableCell align='center'>Current Price</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    products.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell align='center'>{item.data().item_name}</TableCell>
                        <TableCell align='center'>{item.data().quantity}</TableCell>
                        <TableCell align='center'>${item.data().cost}</TableCell>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            </Box>
          }

          {/* Product Requests Management Tab */}
          {
            pageView == 'Product Requests Management' &&
            <Box>
              <Typography variant='h6'>Pending Requests</Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align='center'>Requesting user's email</TableCell>
                    <TableCell align='center'>Item</TableCell>
                    <TableCell align='center'>Request Date</TableCell>
                    <TableCell align='center'>Log</TableCell>
                    <TableCell align='center'></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    pendingRequests && pendingRequests.map((x, index) => (
                      <TableRow key={index}>
                        <TableCell align='center'>{x.data().user_email}</TableCell>
                        <TableCell align='center'>{x.data().item_name}</TableCell>
                        <TableCell align='center'>{x.data().date.toDate().toLocaleString()}</TableCell>
                        <TableCell align='center'>
                          <List>
                          {
                            x.data().log.map((y : string, id : number) => (
                              <ListItem key={id} sx={{justifyContent:'center'}}>
                                <Typography variant='body2'>{id + 1}. {y}</Typography>
                              </ListItem>
                            ))
                          }
                          </List>
                        </TableCell>
                        <TableCell align='center'>
                          <Button onClick={ () => { setPopup("manageRequest"); }}>Manage Request</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>


              <Typography variant='h6' sx={{marginTop:20}}>All Requests</Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align='center'>Requesting user's email</TableCell>
                    <TableCell align='center'>Item</TableCell>
                    <TableCell align='center'>Request Date</TableCell>
                    <TableCell align='center'>Log</TableCell>
                    <TableCell align='center'>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {
                    allRequests.map((x, index) => (
                      <TableRow key={index}>
                        <TableCell align='center'>{x.data().user_email}</TableCell>
                        <TableCell align='center'>{x.data().item_name}</TableCell>
                        <TableCell align='center'>{x.data().date.toDate().toLocaleString()}</TableCell>
                        <TableCell align='center'>
                          <List>
                          {
                            x.data().log.map((y : string, id : number) => (
                              <ListItem key={id} sx={{justifyContent:'center'}}>
                                <Typography variant='body2'>{id + 1}. {y}</Typography>
                              </ListItem>
                            ))
                          }
                          </List>
                        </TableCell>
                        <TableCell align='center'>{x.data().status}</TableCell>
                      </TableRow>
                    ))
                  }
                </TableBody>
              </Table>
            </Box>
          }
          
          {/* Product Requests Summary Tab */}
          {
            pageView == 'Product Requests Summary' &&
            <Box>

              <Box sx={{margin:3}}>
                <Typography variant='h6'>Summary of Requests Made in last 7 Days</Typography>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell align='center'>Pending</TableCell>
                      <TableCell align='center'>Approved</TableCell>
                      <TableCell align='center'>Rejected</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell align='center'>{last7Requests.filter(x => x.data().status == "pending").length}</TableCell>
                      <TableCell align='center'>{last7Requests.filter(x => x.data().status == "approved").length}</TableCell>
                      <TableCell align='center'>{last7Requests.filter(x => x.data().status == "rejected").length}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>

              <Box sx={{margin:3}}>
                <Typography variant='h6'>Top 3 Most Requested Items in last 7 days</Typography>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell align='center'>Item</TableCell>
                      <TableCell align='center'>Number of times requested</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {
                      most_requested()?.map((x, index) => (
                        <TableRow key={index}>
                          <TableCell align='center'>{x[0]}</TableCell>
                          <TableCell align='center'>{x[1]}</TableCell>
                        </TableRow>
                      ))
                    }
                  </TableBody>
                </Table>
              </Box>

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

      {/* New User Dialog */}
      <Dialog open={popup == 'newUser'} maxWidth='md' fullWidth>
        <DialogTitle sx={{textAlign:'center'}}>Adjust New User</DialogTitle>
          <Box sx={{ display:'flex', flexDirection:'row', gap: 2, alignSelf:'center', margin:1,}}>
            <Typography sx={{marginTop:1}}>Email:</Typography>
            <TextField placeholder='Enter User Email' value={itemName} onChange={e => setItemName(e.target.value)} size='small'/>
          </Box>

          <Box sx={{ display:'flex', flexDirection:'row', gap: 2, alignSelf:'center', margin:1}}>
            <Typography sx={{marginTop:1}}>Password:</Typography>
            <TextField placeholder='Enter Password' value={password} onChange={e => setPassword(e.target.value)} size='small'/>
          </Box>

        <DialogActions sx = {{ justifyContent: 'space-between' }}>
          <Button onClick={() => setPopup(null)}>Close</Button>
          <Button onClick={handleAddNewUser}>Add User</Button>
        </DialogActions>
      </Dialog>
                
      {/* Account Management Dialog */}
      <Dialog open={popup == "accountManagement"} maxWidth="md" fullWidth>
          <DialogTitle>Account Management</DialogTitle>
          <DialogContent>
          <TableContainer component={Paper}>
              <Table>
              <TableHead>
                  <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>Voucher Amount</TableCell>
                  </TableRow>
              </TableHead>
              <TableBody>
                  {
                  userList?.map((user: { email: any, voucher_amount: number, disabled: boolean }, index: number) => (
                      <TableRow key={index}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.voucher_amount}</TableCell>
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

      {/* Manage Request Dialog */}
      <Dialog open={popup == 'manageRequest'}>
        <DialogTitle sx={{textAlign:'center'}}>
          Manage {pendingRequests[targetRequest]?.data().user_email}'s request for {pendingRequests[targetRequest]?.data().item_name}
        </DialogTitle>
        <Box sx={{margin:2}}>
          <Typography variant='body1'>Request Logs:</Typography>
          <List> 
            {
              pendingRequests[targetRequest]?.data().log.map((x : string, index : number) => (
                <Typography key={index}>{index + 1}: {x}</Typography>
              ))
            }
          </List>
        </Box>
        <DialogActions sx = {{ justifyContent: 'space-between' }}>
          <Button onClick={() => setPopup(null)}>Close</Button>
          <Box>
            <Button onClick={() => handleAdjustRequest(1)}>Approve</Button>
            <Button onClick={() => handleAdjustRequest(0)}>Reject</Button>
          </Box>
        </DialogActions>
      </Dialog>

    </Box>
  );
};


export default Home;
