'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Box,
    Typography,
    useMediaQuery,
    useTheme,
    CircularProgress,
} from '@mui/material';
import { IconX } from '@tabler/icons-react';

interface DemoModalProps {
    open: boolean;
    onClose: () => void;
    serviceType: 'market-research' | 'factory-contact' | 'inspection' | null;
    title: string;
}

const DemoModal: React.FC<DemoModalProps> = ({ open, onClose, serviceType, title }) => {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const [loading, setLoading] = useState(false);

    const getIframeUrl = () => {
        switch (serviceType) {
            case 'market-research':
                return '/frontend-pages/demo/market-research';
            case 'factory-contact':
                return '/frontend-pages/demo/factory-contact';
            case 'inspection':
                return '/frontend-pages/demo/inspection';
            default:
                return '';
        }
    };

    const handleIframeLoad = () => {
        setLoading(false);
    };

    React.useEffect(() => {
        if (open && serviceType) {
            setLoading(true);
        }
    }, [open, serviceType]);

    return (
        <Dialog
            fullScreen={fullScreen}
            open={open}
            onClose={onClose}
            maxWidth="xl"
            fullWidth
            PaperProps={{
                sx: {
                    height: fullScreen ? '100%' : '90vh',
                    maxHeight: fullScreen ? '100%' : '90vh',
                }
            }}
        >
            <DialogTitle sx={{ 
                m: 0, 
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: `1px solid ${theme.palette.divider}`,
                fontSize: '1.25rem',
                fontWeight: 600
            }}>
                {title} - 데모 화면
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        color: theme.palette.grey[500],
                        '&:hover': {
                            backgroundColor: theme.palette.action.hover,
                        }
                    }}
                >
                    <IconX size={24} />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 0, position: 'relative' }}>
                {loading && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 2
                        }}
                    >
                        <CircularProgress size={48} />
                        <Typography variant="body1" color="text.secondary">
                            데모 화면을 불러오는 중...
                        </Typography>
                    </Box>
                )}
                {serviceType && (
                    <iframe
                        src={getIframeUrl()}
                        style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            display: loading ? 'none' : 'block',
                        }}
                        onLoad={handleIframeLoad}
                        title={`${title} Demo`}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
};

export default DemoModal;