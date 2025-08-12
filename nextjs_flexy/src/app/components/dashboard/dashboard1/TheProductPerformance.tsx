import React from "react";
import Image from "next/image";
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Avatar,
  Chip,
  Stack,
  TableContainer,
  Paper,
} from "@mui/material";
import ThemeSelect from "./ThemeSelect";
import DashboardCard from "../../shared/DashboardCard";

const products = [
  {
    imgsrc: "/images/users/1.jpg",
    name: "Olivia Rhye",
    post: "Web Designer",
    pname: "Elite Admin",
    priority: "Low",
    budget: "3.9",
  },
  {
    imgsrc: "/images/users/2.jpg",
    name: "Andrew McDownland",
    post: "Project Manager",
    pname: "Real Homes WP Theme",
    priority: "Medium",
    budget: "24.5",
  },
  {
    imgsrc: "/images/users/3.jpg",
    name: "Christopher Jamil",
    post: "Project Manager",
    pname: "MedicalPro WP Theme",
    priority: "High",
    budget: "12.8",
  },
  {
    imgsrc: "/images/users/4.jpg",
    name: "Nirav Joshi",
    post: "Frontend Engineer",
    pname: "Hosting Press HTML",
    priority: "Critical",
    budget: "2.4",
  },
  {
    imgsrc: "/images/users/5.jpg",
    name: "Tommy Garza",
    post: "Content Writer",
    pname: "Helping Hands Theme",
    priority: "Moderate",
    budget: "9.3",
  },
];

const ProductPerformance = () => (
  <DashboardCard title="Product Performance" subtitle="Ample Admin Vs Pixel Admin" action={<ThemeSelect />}>
    <Box mt={-1} overflow='hidden'>
      <TableContainer sx={{
        width: {
          xs: '280px',
          sm: '100%'
        }
      }}>
        <Table
          aria-label="simple table"
          sx={{
            whiteSpace: "nowrap",
            pt: 5,
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="h5">Assigned</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h5">Name</Typography>
              </TableCell>
              <TableCell>
                <Typography variant="h5">Priority</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="h5">Budget</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.name}>
                <TableCell>
                  <Stack direction="row" gap={2}>
                    <Avatar
                      src={product.imgsrc}
                      alt={product.imgsrc}
                      sx={{
                        width: 40,
                        height: 40,
                      }}
                    />
                    <Box>
                      <Typography variant="h6" fontWeight="600">
                        {product.name}
                      </Typography>
                      <Typography
                        color="textSecondary"
                        variant="h6"
                        fontWeight="400"
                      >
                        {product.post}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography color="textSecondary" variant="h6">
                    {product.pname}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    sx={{
                      backgroundColor:
                        product.priority === "Low"
                          ? (theme) => theme.palette.primary.main
                          : product.priority === "Medium"
                            ? (theme) => theme.palette.secondary.main
                            : product.priority === "High"
                              ? (theme) => theme.palette.warning.main
                              : product.priority === "Moderate"
                                ? (theme) => theme.palette.success.main
                                : product.priority === "Critical"
                                  ? (theme) => theme.palette.error.main
                                  : (theme) => theme.palette.secondary.main,
                      color: "#fff",
                      borderRadius: "6px",
                    }}
                    size="small"
                    label={product.priority}
                  />
                </TableCell>
                <TableCell align="right">
                  <Typography variant="h6">${product.budget}k</Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  </DashboardCard>
);

export default ProductPerformance;
