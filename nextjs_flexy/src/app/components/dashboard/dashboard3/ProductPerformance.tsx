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
} from "@mui/material";
import DashboardCard from "../../shared/DashboardCard";
import ThemeSelect from "../dashboard1/ThemeSelect";

const products = [
  {
    imgsrc: "/images/users/1.jpg",
    name: "Sunil Joshi",
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
    name: "Micheal Doe",
    post: "Content Writer",
    pname: "Helping Hands Theme",
    priority: "Moderate",
    budget: "9.3",
  },
];

const ProductPerformance = () => (
  <DashboardCard title="Product Performance" subtitle="Ample Admin Vs Pixel Admin" action={<ThemeSelect />}>
    <Box overflow="auto">
      <Table
        aria-label="simple table"
        sx={{
          mt: 1,
          whiteSpace: 'nowrap',
          'td:first-of-type, th:first-of-type': {
            pl: 0,
          },
          'td:last-of-type, th:last-of-type': {
            pr: 0,
          },
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
                <Stack direction="row" alignItems="center" gap={2}>
                  <Avatar
                    src={product.imgsrc}
                    alt={product.imgsrc}
                    sx={{
                      width: 40,
                      height: 40,
                    }}
                  />
                  <Typography variant="h6" fontWeight="600">
                    {product.name}
                  </Typography>
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
    </Box>
  </DashboardCard>
);

export default ProductPerformance;
