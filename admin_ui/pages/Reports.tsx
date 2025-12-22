import React from 'react';


import React from 'react';
import { Paper, Grid, Typography, Button } from '@mui/material';

function Reports() {
  // TODO: Replace with real data/API
  const totalProducts = 120;
  const totalOrders = 45;
  const totalCustomers = 30;
  const totalRevenue = 150000000;

  return (
    <Paper style={{ padding: 24 }}>
      <h2>Báo cáo & Thống kê</h2>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper style={{ padding: 16, textAlign: 'center' }}>
            <Typography variant="h6">Sản phẩm</Typography>
            <Typography variant="h4">{totalProducts}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper style={{ padding: 16, textAlign: 'center' }}>
            <Typography variant="h6">Đơn hàng</Typography>
            <Typography variant="h4">{totalOrders}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper style={{ padding: 16, textAlign: 'center' }}>
            <Typography variant="h6">Khách hàng</Typography>
            <Typography variant="h4">{totalCustomers}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper style={{ padding: 16, textAlign: 'center' }}>
            <Typography variant="h6">Doanh thu</Typography>
            <Typography variant="h4">{totalRevenue.toLocaleString()} đ</Typography>
          </Paper>
        </Grid>
      </Grid>
      <div style={{ marginTop: 32 }}>
        <Button variant="contained" color="primary">Xuất báo cáo Excel</Button>
        <Button variant="outlined" style={{ marginLeft: 16 }}>Xuất PDF</Button>
      </div>
    </Paper>
  );
}

export default Reports;
