import React from "react";
import {Box, Typography} from "@mui/material";

export default function Home() {
  return (
      <Box textAlign="center" sx={{mt: 5}}>
        <Typography variant="h3" gutterBottom>
          Chào mừng đến với Volunteer Hub 🌍
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Nơi kết nối trái tim tình nguyện 💖
        </Typography>
      </Box>
  );
}
