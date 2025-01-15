"use client"

import React, { useEffect, useState } from "react";
import { getUserData } from "../../firebaseConfig";
import { Box, FormControlLabel, Checkbox, Container, Button } from "@mui/material";
import {auth} from '../../firebaseConfig'
import { onAuthStateChanged } from "firebase/auth";
import router from "next/router";
import Router from "next/router";
import { useAuth } from "../../AuthProvider";

export default function Streak() {
    const { user } = useAuth();
    const [streak, setStreak] = useState<number[]>([])

    const setUp = async () => {
        console.log(auth.currentUser)
        if (auth.currentUser) {
            const data = await getUserData()
            if (data) {
                setStreak(data["streak"])
            }
        }
    }

    setUp()

    return (
        <Container className=" bg-black h-screen w-screen">
            <Box className='flex justify-center bg-black'>
                <FormControlLabel
                    control={<Checkbox checked={streak.length >= 1} disabled />}
                    label="Day 1"
                />
                <FormControlLabel
                    control={<Checkbox checked={streak.length >= 2} disabled />}
                    label="Day 2"
                />
                <FormControlLabel
                    control={<Checkbox checked={streak.length >= 3} disabled />}
                    label="Day 3"
                />
                <FormControlLabel
                    control={<Checkbox checked={streak.length >= 4} disabled />}
                    label="Day 4"
                />
                <FormControlLabel
                    control={<Checkbox checked={streak.length >= 5} disabled />}
                    label="Day 5"
                />
                <FormControlLabel
                    control={<Checkbox checked={streak.length >= 6} disabled />}
                    label="Day 6"
                />
                <FormControlLabel
                    control={<Checkbox checked={streak.length >= 7} disabled />}
                    label="Day 7"
                />
            </Box>
            <Button onClick={() => window.location.href = '../'}>Return</Button>
        </Container>
    )
}

