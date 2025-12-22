import React from 'react';


import React, { useEffect, useState } from 'react';
import { TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';

interface Order {
  id: number;
  user: string;
  created_at: string;
  money: number;
  completed: boolean;
}

const mockOrders: Order[] = [
  { id: 1, user: 'Nguyễn Văn A', created_at: '2025-12-01', money: 500000, completed: true },
  { id: 2, user: 'Trần Thị B', created_at: '2025-12-10', money: 1200000, completed: false },
];

function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    // TODO: Replace with API call
    setOrders(mockOrders);
  }, []);

  const filtered = orders.filter(o => {
    const matchSearch =
      o.user.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toString().includes(search);
    const matchStatus = status ? (status === 'done' ? o.completed : !o.completed) : true;
    const matchUser = userFilter ? o.user.toLowerCase().includes(userFilter.toLowerCase()) : true;
    const matchDate = date ? o.created_at === date : true;
    return matchSearch && matchStatus && matchUser && matchDate;
  });

  return (
    <Paper style={{ padding: 24 }}>
      <h2>Quản lý đơn hàng</h2>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <TextField
          label="Tìm kiếm đơn hàng"
          value={search}
          onChange={e => setSearch(e.target.value)}
          variant="outlined"
          size="small"
        />
        <TextField
          label="Khách hàng"
          value={userFilter}
          onChange={e => setUserFilter(e.target.value)}
          variant="outlined"
          size="small"
        />
        <TextField
          label="Ngày tạo"
          value={date}
          onChange={e => setDate(e.target.value)}
          variant="outlined"
          size="small"
          type="date"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Trạng thái"
          select
          SelectProps={{ native: true }}
          value={status}
          onChange={e => setStatus(e.target.value)}
          variant="outlined"
          size="small"
        >
          <option value="">Tất cả</option>
          <option value="done">Hoàn thành</option>
          <option value="pending">Chưa hoàn thành</option>
        </TextField>
      </div>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Khách hàng</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell>Tổng tiền</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(order => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.user}</TableCell>
                <TableCell>{order.created_at}</TableCell>
                <TableCell>{order.money.toLocaleString()}</TableCell>
                <TableCell>{order.completed ? 'Hoàn thành' : 'Chưa hoàn thành'}</TableCell>
                <TableCell>
                  <Button size="small" variant="outlined">Xem</Button>
                  <Button size="small" variant="outlined" style={{ marginLeft: 8 }}>Sửa</Button>
                  <Button size="small" color="error" variant="outlined" style={{ marginLeft: 8 }}>Xóa</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default Orders;
