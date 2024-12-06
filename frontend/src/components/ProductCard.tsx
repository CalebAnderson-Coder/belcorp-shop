import React from 'react';
import {
    Box,
    Image,
    Text,
    Button,
    VStack,
    HStack,
    useNumberInput,
    Input,
} from '@chakra-ui/react';
import { Product } from '../types';
import { useCartStore } from '../store';

interface ProductCardProps {
    product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const addToCart = useCartStore((state) => state.addToCart);
    
    const { getInputProps, getIncrementButtonProps, getDecrementButtonProps, value } =
        useNumberInput({
            step: 1,
            defaultValue: 1,
            min: 1,
            max: product.stock,
        });

    const inc = getIncrementButtonProps();
    const dec = getDecrementButtonProps();
    const input = getInputProps();

    const handleAddToCart = () => {
        addToCart(product, parseInt(value));
    };

    return (
        <Box
            maxW="sm"
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            p={4}
            _hover={{ shadow: 'md' }}
        >
            <Image
                src={product.image_url || 'https://via.placeholder.com/200'}
                alt={product.name}
                height="200px"
                width="100%"
                objectFit="cover"
            />
            <VStack mt={4} align="start" spacing={2}>
                <Text fontSize="xl" fontWeight="semibold">
                    {product.name}
                </Text>
                <Text color="gray.600">{product.description}</Text>
                <Text fontSize="lg" fontWeight="bold" color="teal.600">
                    ${product.price.toFixed(2)}
                </Text>
                <HStack>
                    <Button {...dec}>-</Button>
                    <Input {...input} width="60px" textAlign="center" />
                    <Button {...inc}>+</Button>
                </HStack>
                <Button
                    colorScheme="teal"
                    width="100%"
                    onClick={handleAddToCart}
                    isDisabled={product.stock === 0}
                >
                    Agregar al Carrito
                </Button>
            </VStack>
        </Box>
    );
};
