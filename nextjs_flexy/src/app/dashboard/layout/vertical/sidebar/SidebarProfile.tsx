import {
    Box,
    Typography,
    Button,
} from '@mui/material';
import { Stack } from "@mui/system";
import React from 'react';
import  Link  from 'next/link'
import Image from 'next/image'

const SidebarProfile = () => {
    return (
        <Box bgcolor='primary.light' p={3} position='relative'>
            <Stack direction='row' spacing={1} justifyContent='space-between'>
                <Box>
                    <Typography variant="h5" fontWeight={600} mb={2} color="textPrimary">
                        Unlimited <br /> Access

                    </Typography>
                    <Button
                        href="/auth/login"
                        variant="contained"
                        color="primary"
                        component={Link}
                    >
                        Upgrade 
                    </Button>
                </Box>
                <Image src={"/images/backgrounds/sidebar-buynow.png"} width={150} height={183} style={{ height: 'auto', width: 'auto' }} alt="unlimited" className='buynow-img' />
                {/* <img src='/images/backgrounds/sidebar-buynow.png' alt='bg-img' className='buynow-img' /> */}
            </Stack>
        </Box>
    );
};

export default SidebarProfile;
