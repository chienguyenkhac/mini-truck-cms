import React from 'react';


import React, { useEffect, useState } from 'react';
import { TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';

interface Product {
  id: number;
  code: string;
  name: string;
  price: number;
  price_bulk: number;
  type: string;
  total: number;
  image: string;
  mansx: string;
  category_id: number;
  weight: number;
  order_pending: number;
  note: string;
  min: number;
}

const mockProducts: Product[] = [
  { id: 1, code: 'SP001', name: 'Sản phẩm 1', price: 10000, price_bulk: 9000, type: 'Loại A', total: 50, image: '', mansx: 'NSX1', category_id: 1, weight: 1, order_pending: 0, note: '', min: 5 },
  { id: 2, code: 'SP002', name: 'Sản phẩm 2', price: 20000, price_bulk: 18000, type: 'Loại B', total: 30, image: '', mansx: 'NSX2', category_id: 2, weight: 2, order_pending: 1, note: '', min: 3 },
];

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [mansx, setMansx] = useState('');
  const [minTotal, setMinTotal] = useState('');

  useEffect(() => {
    // TODO: Replace with API call
    setProducts(mockProducts);
  }, []);

  const filtered = products.filter(p => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase());
    const matchType = type ? p.type === type : true;
    const matchMansx = mansx ? p.mansx === mansx : true;
    const matchMinTotal = minTotal ? p.total >= Number(minTotal) : true;
    return matchSearch && matchType && matchMansx && matchMinTotal;
  });

  return (
    <Paper style={{ padding: 24 }}>
      <h2>Quản lý sản phẩm</h2>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <TextField
          label="Tìm kiếm sản phẩm"
          value={search}
          onChange={e => setSearch(e.target.value)}
          variant="outlined"
          size="small"
        />
        <TextField
          label="Loại"
          value={type}
          onChange={e => setType(e.target.value)}
          variant="outlined"
          size="small"
        />
        <TextField
          label="NSX"
          value={mansx}
          onChange={e => setMansx(e.target.value)}
          variant="outlined"
          size="small"
        />
        <TextField
          label="Tồn kho tối thiểu"
          value={minTotal}
          onChange={e => setMinTotal(e.target.value)}
          variant="outlined"
          size="small"
          type="number"
        />
      </div>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Mã SP</TableCell>
              <TableCell>Tên sản phẩm</TableCell>
              <TableCell>Giá lẻ</TableCell>
              <TableCell>Giá sỉ</TableCell>
              <TableCell>Loại</TableCell>
              <TableCell>Tồn kho</TableCell>
              <TableCell>NSX</TableCell>
              <TableCell>Ghi chú</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map(product => (
              <TableRow key={product.id}>
                <TableCell>{product.code}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.price.toLocaleString()}</TableCell>
                <TableCell>{product.price_bulk.toLocaleString()}</TableCell>
                <TableCell>{product.type}</TableCell>
                <TableCell>{product.total}</TableCell>
                <TableCell>{product.mansx}</TableCell>
                <TableCell>{product.note}</TableCell>
                <TableCell>
                  <Button size="small" variant="outlined">Sửa</Button>
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

export default Products;
