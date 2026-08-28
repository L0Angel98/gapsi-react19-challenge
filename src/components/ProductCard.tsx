import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import type { Product } from '../types/product';

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  const [image, setImage] = useState(product.imageUrl);
  const price = new Intl.NumberFormat('en-US', { style: 'currency', currency: product.currency }).format(product.price);

  return (
    <Card
      component="article"
      className="product-card"
      draggable
      elevation={0}
      onDragStart={(event) => {
        event.dataTransfer.effectAllowed = 'copy';
        event.dataTransfer.setData('text/product-id', product.id);
      }}
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <div className="product-image-wrap">
        <CardMedia component="img" image={image} alt={product.name} loading="lazy" width={720} height={540} onError={() => setImage('/brand/logo.png')} />
        <Chip
          className="drag-hint"
          size="small"
          label={<><i className="fa-solid fa-up-down-left-right" aria-hidden="true" /> Arrastra</>}
        />
      </div>
      <CardContent className="product-info" sx={{ flex: 1 }}>
        <Typography component="p" className="product-brand">{product.brand || 'Selección Gapsi'}</Typography>
        <Typography component="h3" className="product-name" title={product.name}>{product.name}</Typography>
      </CardContent>
      <CardActions className="product-footer">
        <Typography component="strong" className="product-price">{price}</Typography>
        <Button
          className="add-button"
          variant="outlined"
          color="primary"
          type="button"
          onClick={() => onAdd(product)}
          aria-label={`Agregar ${product.name} al carrito`}
        >
          <i className="fa-solid fa-plus" aria-hidden="true" />
          <span>Agregar</span>
        </Button>
      </CardActions>
    </Card>
  );
}

