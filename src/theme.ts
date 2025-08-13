// src/theme.ts
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        primary: {
            main: '#CC6E30', // cam trầm vừa phải
            contrastText: '#fff',
        },
        secondary: {
            main: '#6C4F3D', // màu nâu nhẹ làm điểm nhấn
        },
    },
    typography: {
        fontFamily: `'Roboto', 'Helvetica', 'Arial', sans-serif`,
        button: {
            textTransform: 'none',
        },
        h2: {
            color: '#e87c2f', // hoặc theme.palette.primary.main nếu bạn dùng callback
            fontWeight: 700,
        },
    },

    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    '&:hover': {
                        backgroundColor: "#F57C00", // Màu hover cho button
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    boxShadow: "none",
                },
            },
        },
    },
});

export default theme;
