import React from 'react';


import React, { useEffect, useState } from 'react';
import { TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  money: number;
}

const mockCustomers: Customer[] = [
  { id: 1, name: 'Nguyễn Văn A', phone: '0901234567', email: 'a@gmail.com', address: 'Hà Nội', money: 1000000 },
  { id: 2, name: 'Trần Thị B', phone: '0912345678', email: 'b@gmail.com', address: 'HCM', money: 500000 },
];

function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [minMoney, setMinMoney] = useState('');

  useEffect(() => {
    // TODO: Replace with API call
    setCustomers(mockCustomers);
  }, []);

  const filtered = customers.filter(c => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchMinMoney = minMoney ? c.money >= Number(minMoney) : true;
    return matchSearch && matchMinMoney;
  });

  return (
    <Paper style={{ padding: 24 }}>
      <h2>Quản lý khách hàng</h2>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <TextField
          label="Tìm kiếm khách hàng"
          value={search}
          onChange={e => setSearch(e.target.value)}
          variant="outlined"
          size="small"
        />
        <TextField
          label="Số dư tối thiểu"
          value={minMoney}
          onChange={e => setMinMoney(e.target.value)}
          variant="outlined"
          size="small"
          type="number"
        />
      </div>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Tên khách hàng</TableCell>
              <TableCell>Điện thoại</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Địa chỉ</TableCell>
              <TableCell>Số dư</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(customer => (
              <TableRow key={customer.id}>
                <TableCell>{customer.id}</TableCell>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.address}</TableCell>
                <TableCell>{customer.money.toLocaleString()}</TableCell>
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

export default Customers;
