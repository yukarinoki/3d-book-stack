import { Routes, Route } from 'react-router-dom';
import { Layout, Book3DView, BookDataTable } from '@/components';
import './App.css';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Book3DView />} />
        <Route path="/books/manage" element={<BookDataTable />} />
      </Routes>
    </Layout>
  );
}
