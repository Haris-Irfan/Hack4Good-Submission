"use client";

import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Button, TextField, MenuItem, FormControl, Select, InputLabel, SelectChangeEvent, Drawer, Checkbox, ListItem, List, ListItemText, IconButton, Menu } from "@mui/material";
import { Search, ShoppingCart, FilterList } from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { browserLocalPersistence, onAuthStateChanged, setPersistence, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, createUserData, getUserData, newUserSignUp, SignOut, updateUserData } from '../firebaseConfig';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '../AuthProvider';

const randomNumberInRange = (min: number, max: number) => {
  return Math.floor(Math.random()
      * (max - min + 1)) + min;
};

let points = 0;
let successfulLogin = 0;
let successfulPurchase = 0;
let streak : number[] = []
let questLogin = randomNumberInRange(3, 5);
let questPurchase = randomNumberInRange(3, 5);
let questRewards = false
let questExpiry = new Timestamp(Timestamp.now().seconds + 7 * 24 * 60 * 60, 0)
let travel = 0
let fashion = 0
let electronics = 0
let health = 0
let beauty = 0


const Home: React.FC = () => {
  const { user } = useAuth();
  const [popup, setPopup] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [signUpSuccessAlert, setSignUpSuccessAlert] = useState<boolean>(false)
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [purchaseCategory, setPurchaseCategory] = useState<string>("")

  const handleRedeemRewards = async () => {
    if (!questRewards) {
      questRewards = true
      await handleViewRewardsPageCompletion()
    }
    window.location.href = '/rewards';
  };

  const handleRedeemPurchases = async () => {
    if (successfulPurchase == questPurchase) {
      await updateUserData(successfulLogin, questLogin, successfulPurchase, questPurchase, questRewards,
        questExpiry, points + 20, streak, travel, fashion, electronics, health, beauty)
      points += 20
    }
  }

  const handleWeeklyQuest = () => {
    setPopup('weeklyQuest');
  };

  const handleLoginPress = () => {
    setPopup('login');
  };

  const handleSimulatePurchasePress = () => {
    setPopup('purchase')
  }

  const handlePurchaseStreak = () => {
    window.location.href = '/streak';
  };

  const handleViewRewardsPageCompletion = async () => {
    if (questRewards) {
      try {
        await updateUserData(successfulLogin, questLogin, successfulPurchase, questPurchase, questRewards,
          questExpiry, points + 30, streak, travel, fashion, electronics, health, beauty)
        points += 30
      } catch (error) {
        console.error(error)
      }
    }
  }

  const handleLoginQuestCompletion = async () => {
    if (successfulLogin == questLogin) {
        try {
          await updateUserData(successfulLogin, questLogin, successfulPurchase, questPurchase, questRewards,
            questExpiry, points + 10, streak, travel, fashion, electronics, health, beauty)
          points += 10
        } catch (error) {
          console.error(error)
        }
    }
  }

  const handleMakePurchase = async () => {
    const day = (new Date()).getDay()
    let prevDay = 0
    if (day == 0) {
      prevDay = 6
    } else {
      prevDay = day - 1
    }
    successfulPurchase += 1
    if (streak.length == 0) {
      streak = []
      streak.push(day)
    } else if (streak[streak.length - 1] == prevDay) {
      streak.push(day)
    } else if (streak[streak.length - 1] == day) {
      console.log("same day")
    } else {
      streak = []
      streak.push(day)
    }
    if (purchaseCategory == "travel") {
      travel++
    } else if (purchaseCategory == "fashion") {
      fashion++
    } else if (purchaseCategory == 'electronics') {
      electronics++
    } else if (purchaseCategory == 'health') {
      health++
    } else {
      beauty++
    }
    await storeToFirestore()
    await handleRedeemPurchases()
  }

  const loadUserData = async () => {
    if (!auth.currentUser) {
        console.error("No user signed in");
        return;
    }
    const data = await getUserData()
    if (data) {
      if (Timestamp.now().valueOf() < data["quest_expiry"].valueOf()) {
        points = data["points"]
        successfulLogin = data["successful_logins"]
        successfulPurchase = data["successful_purchases"]
        questLogin = data["quest_logins"]
        questPurchase = data["quest_purchases"]
        questRewards = data["quest_has_visited_rewards"]
        questExpiry = data["quest_expiry"]
        streak = data["streak"]
        travel = data["travel"]
        fashion = data["fashion"]
        electronics = data["electronics"]
        health = data["health"]
        beauty = data["beauty"]
      } else {
        points = data["points"]
        successfulLogin = 0
        successfulPurchase = 0
        questLogin = randomNumberInRange(3, 5);
        questPurchase = randomNumberInRange(3, 5);
        questRewards = false
        streak = []
        questExpiry = new Timestamp(Timestamp.now().seconds + 7 * 24 * 60 * 60, 0)
        travel = 0,
        fashion = 0,
        electronics = 0,
        health = 0,
        beauty = 0
      }
    }
  }

  const storeToFirestore = async () => {
    updateUserData(successfulLogin, questLogin, successfulPurchase, questPurchase, questRewards,
      questExpiry, points, streak, travel, fashion, electronics, health, beauty)
  }

  const handleSignUp = async () => {
    try {
      const response = await newUserSignUp(email, password)
      if (response) {
        await createUserData(1, randomNumberInRange(3, 5), 0, randomNumberInRange(3, 5), false, new Timestamp(Timestamp.now().seconds + 7 * 24 * 60 * 60, 0), 0, [], 0, 0, 0, 0, 0)
        setSignUpSuccessAlert(true)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      await loadUserData()
      successfulLogin++;
      await storeToFirestore()
      setPopup(null);
      await handleLoginQuestCompletion();
      await storeToFirestore()
      console.log("Successful login")
    } catch (err: any) {
      console.error(err.message);
      setError('Invalid email or password. Please try again.');
    }
  };

  const handlePurchaseFormChange = (event: SelectChangeEvent) => {
    setPurchaseCategory(event.target.value as string);
  };

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

  const shopTypeButtons = [
    { label: "About Us", action: () => console.log("About Us clicked") },
    { label: "Weekly Quests", action: handleWeeklyQuest },
    { label: "Donation Streak", action: handlePurchaseStreak },
    { label: "Redeem Rewards", action: handleRedeemRewards },
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
              onClick={handleLoginPress}
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

      {/* Weekly Quest Popup */}
      {popup === 'weeklyQuest' && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1300,
          }}
        >
          <Box
            sx={{
              backgroundColor: 'white',
              padding: 4,
              borderRadius: 2,
              boxShadow: 3,
              width: '24rem',
              textAlign: 'center',
            }}
          >
            <Typography variant="h6" sx={{ marginBottom: 2, fontWeight: 'bold' }}>
              Weekly Quests
            </Typography>
            <Box component="ul" sx={{ listStyleType: 'disc', paddingLeft: 2, marginBottom: 3 }}>
              <Box component="li" sx={{ marginBottom: 1 }}>
                10 points: Log in (1/3)
              </Box>
              <Box component="li" sx={{ marginBottom: 1 }}>
                20 points: Purchase items (0/5)
              </Box>
              <Box component="li">
                30 points: Visit 'Rewards' Page (1/1)
              </Box>
            </Box>
            <Button
              variant="contained"
              color="error"
              sx={{ marginTop: 2 }}
              onClick={() => setPopup(null)}
            >
              Close
            </Button>
          </Box>
        </Box>
      )}

      {/* Drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Home;

