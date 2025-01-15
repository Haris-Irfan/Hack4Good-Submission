"use client";

import React, { useState, useEffect } from 'react';
import { Container, Typography, TextField, Box, Button, IconButton, Alert, MenuItem, FormControl, InputLabel, Select, SelectChangeEvent } from '@mui/material';
import CloseIcon from "@mui/icons-material/Close";
import { browserLocalPersistence, onAuthStateChanged, setPersistence, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, createUserData, getUserData, newUserSignUp, SignOut, updateUserData } from './firebaseConfig';
import { Timestamp } from 'firebase/firestore';
import Router from 'next/router';
import { useAuth } from './AuthProvider';

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

  return (
    <Box className="min-h-screen flex flex-col">
      <Box component="main" display="flex" justifyContent="center" gap={150} className="bg-gray-100 py-8">
        <Container className="text-center">
          <Typography variant="h4" className="mb-4">Welcome to Test</Typography>
          <Typography variant="body1" color="textSecondary">This is a test website</Typography>
        </Container>
        <Container className="text-center">
          <Typography variant="h4" className="mb-4">{auth.currentUser? auth.currentUser?.email[0].toUpperCase() : "User"}</Typography>
          <Typography variant="body1" color="textSecondary">{points} points</Typography>
        </Container>
      </Box>
      <Box component="header" className="bg-gray-800 text-left text-white py-4">
        <Container className="flex flex-wrap items-center justify-between">
          <Box className="flex space-x-4">
            {['Categories', 'Travel', 'Fashion', 'Electronics', 'Health', 'Marketplace', 'Beauty'].map((item) => (
              <Button key={item} className="text-sm font-medium hover:text-gray-300" color="inherit">
                {item}
              </Button>
            ))}
            <Button
              size="small" 
              color="inherit" 
              onClick={handleRedeemRewards} 
              className="text-sm font-medium"
            >
              Redeem Rewards
            </Button>
            <Button 
              size="small" 
              color="inherit" 
              onClick={handleWeeklyQuest} 
              className="text-sm font-medium"
            >
              Weekly Quests
            </Button>
            <Button 
              size="small" 
              color="inherit" 
              onClick={handleSimulatePurchasePress} 
              className="text-sm font-medium"
            >
              Purchase
            </Button>
            <Button 
              size="small" 
              color="inherit" 
              onClick={handlePurchaseStreak} 
              className="text-sm font-medium"
            >
              Daily Purchase Streak
            </Button>
            <Button 
              size="small" 
              color="inherit" 
              onClick={handleLoginPress} 
              className="text-sm font-medium"
            >
              Login
            </Button>
          </Box>
        </Container>
      </Box>

      {popup == 'purchase' && (
        <Box className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <Box className="bg-white p-6 rounded shadow-md w-400 h-100">
            <Typography variant="h6" className="mb-4">Simulate a purchase</Typography>
            <FormControl fullWidth>
              <InputLabel>Purchase Category</InputLabel>
              <Select value={purchaseCategory} onChange={handlePurchaseFormChange}>
                <MenuItem value={"travel"}>Travel</MenuItem>
                <MenuItem value={"fashion"}>Fashion</MenuItem>
                <MenuItem value={"electronics"}>Electronics</MenuItem>
                <MenuItem value={"health"}>Health</MenuItem>
                <MenuItem value={"beauty"}>Beauty</MenuItem>
              </Select>
            </FormControl>

            <Button onClick={handleMakePurchase}>Make Purchase</Button>

            <Button 
              variant="contained" 
              color="error" 
              className="mt-4"
              onClick={() => setPopup(null)}
            >
              Close
            </Button>
          </Box>
        </Box>
      )}

      {popup === 'weeklyQuest' && (
        <Box className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <Box className="bg-white p-6 rounded shadow-md w-96">
            <Typography variant="h6" className="mb-4">Weekly Quests</Typography>
            <ul className="list-disc list-inside space-y-2">
              <li>10 points: Log in ({successfulLogin}/{questLogin}){successfulLogin >= questLogin ? ". Quest completed! Points have been added." : ""}</li>
              <li>20 points: Purchase items ({successfulPurchase}/{questPurchase}){successfulPurchase >= questPurchase ? ". Quest completed! Points have been added." : ""}</li>
              <li>30 points: Visited 'Rewards' Page? ({questRewards ? "1/1). Quest completed! Points have been added." : "0/1)"}</li>
            </ul>
            <Button 
              variant="contained" 
              color="error" 
              className="mt-4"
              onClick={() => setPopup(null)}
            >
              Close
            </Button>
          </Box>
        </Box>
      )}

           
      {popup === 'login' && (
        <Box className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Box className="bg-white p-6 rounded shadow-md w-96">
            <IconButton
                className="absolute top-2 right-2"
                onClick={() => setPopup(null)}
            >
                <CloseIcon/>
            </IconButton>
            <Typography variant="h6" align= "center" className="mb-4">
                Login
            </Typography>
            {
              signUpSuccessAlert && <Alert severity='success' onClose={() => setSignUpSuccessAlert(false)}>
                Successfully signed up!. Please press the 'Login' Button
              </Alert>
            }
            <form onSubmit={handleLogin}>
                <Box display="flex" 
                     flexDirection="column"
                     justifyContent= "center"
                     gap={2} 
                    >
                    <TextField
                        label="Email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        label="Password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                    >
                        Login
                    </Button>
                    <Button onClick={handleSignUp}>Sign Up</Button>
                    <Button onClick={SignOut}>Sign Out</Button>
                </Box>
            </form>
            {error && (
                <Typography variant="body2" color="error" align = "right" className="mb-4">
                {error}
                </Typography>
            )}
            </Box>
        </Box>
      )}
    </Box>
  );
};

export default Home;
