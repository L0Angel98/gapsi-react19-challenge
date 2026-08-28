import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

interface HeaderProps {
  cartCount: number;
  onReset: () => void;
}

export function Header({ cartCount, onReset }: HeaderProps) {
  return (
    <AppBar
      component="header"
      position="sticky"
      elevation={0}
      className="site-header"
      sx={{
        backgroundColor: 'var(--surface)',
        borderBottom: '1px solid var(--line)',
        color: 'var(--ink)'
      }}
    >
      <Toolbar className="header-inner" disableGutters>
        <Box component="a" className="brand" href="/" aria-label="e-Commerce Gapsi, inicio">
          <Box component="img" src="/brand/logo.png" alt="Gapsi" width={161} height={74} />
          <Typography component="span">e-Commerce Gapsi</Typography>
        </Box>
        <Box className="header-actions">
          <Chip
            component="span"
            className="cart-pill"
            icon={<i className="fa-solid fa-bag-shopping" aria-hidden="true" />}
            label={cartCount}
            aria-label={`${cartCount} productos en el carrito`}
          />
          <Button className="ghost-button" variant="outlined" color="primary" type="button" onClick={onReset} title="Reiniciar aplicación">
            <i className="fa-solid fa-rotate-right" aria-hidden="true" />
            <Box component="span">Reiniciar</Box>
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

