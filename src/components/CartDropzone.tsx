import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { Product } from '../types/product';

interface CartDropzoneProps {
  products: Product[];
  onRemove: (id: string) => void;
  onDropProduct: (id: string) => void;
}

export function CartDropzone({ products, onRemove, onDropProduct }: CartDropzoneProps) {
  return (
    <Paper
      component="aside"
      className="cart-panel"
      elevation={0}
      aria-label="Carrito de compra"
      onDragOver={(event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
      }}
      onDrop={(event) => {
        event.preventDefault();
        const id = event.dataTransfer.getData('text/product-id');
        if (id) onDropProduct(id);
      }}
    >
      <Box className="cart-heading">
        <Box>
          <Typography component="p" className="eyebrow">Tu selección</Typography>
          <Typography component="h2" variant="h5">Carrito</Typography>
        </Box>
        <Chip className="cart-count" label={products.length} aria-label={`${products.length} productos`} />
      </Box>
      <Box className="drop-copy" role="status">
        <i className="fa-solid fa-cart-shopping" aria-hidden="true" />
        <span>Arrastra productos aquí</span>
      </Box>
      {products.length > 0 ? (
        <List className="cart-list" disablePadding>
          {products.map((product) => (
            <ListItem key={product.id} component="li" disableGutters>
              <ListItemAvatar>
                <Avatar variant="rounded" src={product.imageUrl} alt="" />
              </ListItemAvatar>
              <ListItemText
                primary={product.name}
                secondary={new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency }).format(product.price)}
              />
              <IconButton
                className="cart-remove-button"
                size="small"
                type="button"
                onClick={() => onRemove(product.id)}
                aria-label={`Quitar ${product.name}`}
              >
                <i className="fa-solid fa-xmark" aria-hidden="true" />
              </IconButton>
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography component="p" className="empty-cart">Aún no hay productos. Usa “Agregar” o arrastra una tarjeta.</Typography>
      )}
    </Paper>
  );
}

