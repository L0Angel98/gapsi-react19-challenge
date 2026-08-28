import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

interface SearchBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
}

export function SearchBar({ query, onQueryChange, onSubmit, loading }: SearchBarProps) {
  return (
    <form className="search-form" onSubmit={(event) => { event.preventDefault(); onSubmit(); }}>
      <label htmlFor="product-search">¿Qué estás buscando?</label>
      <div className="row g-2 align-items-center">
        <div className="col">
          <TextField
            id="product-search"
            fullWidth
            size="small"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="computer, nintendo, sony..."
            slotProps={{
              htmlInput: { maxLength: 100, autoComplete: 'off', 'aria-label': 'Buscar productos' },
              input: { startAdornment: <InputAdornment position="start"><i className="fa-solid fa-magnifying-glass" aria-hidden="true" /></InputAdornment> }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                minHeight: 58,
                borderRadius: 3,
                color: 'var(--ink)',
                backgroundColor: 'var(--surface)',
                '& fieldset': { borderColor: 'var(--line-strong)' },
                '&:hover fieldset, &.Mui-focused fieldset': { borderColor: 'var(--brand)' }
              },
              '& .MuiInputAdornment-root': { color: 'var(--brand)' },
              '& input::placeholder': { color: 'var(--muted)', opacity: 1 }
            }}
          />
        </div>
        <div className="col-12 col-sm-auto">
          <Button
            className="search-submit"
            variant="contained"
            color="primary"
            type="submit"
            fullWidth
            disabled={loading || !query.trim()}
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </Button>
        </div>
      </div>
      <p>Explora por páginas; al seguir bajando cargaremos más resultados automáticamente.</p>
    </form>
  );
}

