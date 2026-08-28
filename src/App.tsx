import { useCallback, useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { CartDropzone } from './components/CartDropzone';
import { Header } from './components/Header';
import { ProductGrid } from './components/ProductGrid';
import { SearchBar } from './components/SearchBar';
import { useCart } from './hooks/useCart';
import { useProductSearch } from './hooks/useProductSearch';
import type { Product } from './types/product';

export function App() {
  const { query, products, loading, error, hasMore, search, loadMore } = useProductSearch();
  const { products: cart, ids: cartIds, add, remove, clear } = useCart();
  const [input, setInput] = useState(query);
  const [status, setStatus] = useState('Listo para buscar productos.');

  const availableProducts = useMemo(() => products.filter((product) => !cartIds.has(product.id)), [cartIds, products]);

  const addProduct = useCallback((product: Product) => {
    add(product);
    setStatus(`${product.name} se agregó al carrito.`);
  }, [add]);

  const removeProduct = useCallback((id: string) => {
    remove(id);
    setStatus('Producto retirado del carrito.');
  }, [remove]);

  const handleSearch = useCallback(() => {
    void search(input);
    clear();
    setStatus(`Buscando “${input.trim()}”.`);
  }, [clear, input, search]);

  const handleReset = useCallback(() => {
    setInput('computer');
    clear();
    void search('computer');
    setStatus('Aplicación reiniciada.');
  }, [clear, search]);

  const handleDropProduct = useCallback((id: string) => {
    const product = products.find((item) => item.id === id);
    if (product) addProduct(product);
  }, [addProduct, products]);

  return <div className="app-shell container-fluid">
    <Header cartCount={cart.length} onReset={handleReset} />
    <main className="app-main">
      <section className="hero-section container" aria-labelledby="hero-title">
        <Paper className="hero-panel" elevation={0}>
          <Typography component="p" className="eyebrow">Búsqueda inteligente <span /> React 19</Typography>
          <Typography id="hero-title" component="h1" className="hero-title">
            Encuentra lo que <Box component="span">te mueve.</Box>
          </Typography>
          <Typography component="p" className="hero-description">Una experiencia de compra rápida, visual y lista para descubrir tu próximo favorito.</Typography>
        </Paper>
      </section>
      <section className="workspace container" aria-label="Buscador y carrito">
        <div className="row g-4 align-items-start">
          <div className="col-12 col-xl-8 catalog-column">
            <SearchBar query={input} onQueryChange={setInput} onSubmit={handleSearch} loading={loading} />
            {error && <Alert
              className="error-banner"
              severity="error"
              role="alert"
              action={<Button color="inherit" size="small" type="button" onClick={() => void search(input)}>Reintentar</Button>}
            >{error} Si no configuraste RapidAPI, puedes usar el modo demo sin key.</Alert>}
            {!error && <ProductGrid products={availableProducts} onAdd={addProduct} loading={loading} hasMore={hasMore} onLoadMore={loadMore} />}
            {availableProducts.length === 0 && !loading && !error && <Paper className="empty-results" elevation={0}>
              <i className="fa-solid fa-box-open" aria-hidden="true" />
              <Typography component="h2" variant="h6">No hay productos para mostrar</Typography>
              <Typography component="p">Prueba otra búsqueda o retira algún producto del carrito.</Typography>
            </Paper>}
          </div>
          <div className="col-12 col-xl-4">
            <CartDropzone products={cart} onRemove={removeProduct} onDropProduct={handleDropProduct} />
          </div>
        </div>
      </section>
    </main>
    <div className="sr-only" aria-live="polite">{status}</div>
    <footer className="container app-footer"><span className="footer-brand"><img src="/brand/logoBlanco.png" alt="Gapsi" width="67" height="32" /><span>e-Commerce challenge</span></span><span>React 19 · TypeScript · PWA</span></footer>
  </div>;
}

