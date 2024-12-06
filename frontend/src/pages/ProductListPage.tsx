import React from 'react';
import { SimpleGrid, Container, Heading, VStack } from '@chakra-ui/react';
import { ProductCard, LoadingSpinner } from '../components';
import { Product } from '../types';
import { getProducts } from '../services/api';

export const ProductListPage: React.FC = () => {
    const [products, setProducts] = React.useState<Product[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getProducts();
                setProducts(data);
            } catch (error) {
                console.error('Error al cargar los productos:', error);
                alert('No se pudieron cargar los productos');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    return (
        <Container maxW="container.xl" py={10}>
            <VStack spacing={8} align="start">
                <Heading>Catálogo de Productos</Heading>
                <SimpleGrid 
                    columns={{ base: 1, sm: 2, md: 3, lg: 4 }} 
                    gap={8} 
                    width="100%"
                >
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </SimpleGrid>
            </VStack>
        </Container>
    );
};
