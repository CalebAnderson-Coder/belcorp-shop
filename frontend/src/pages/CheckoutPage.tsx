import React from 'react';
import {
    Box,
    Button,
    Container,
    Heading,
    VStack,
    Text,
} from '@chakra-ui/react';
import { useCartStore } from '../store';
import { sendOrder } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const CheckoutPage: React.FC = () => {
    const cart = useCartStore((state) => state.cart);
    const clearCart = useCartStore((state) => state.clearCart);
    const navigate = useNavigate();

    const handleCheckout = async () => {
        try {
            const orderData = {
                items: cart.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    price: item.price
                })),
                total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
            };

            await sendOrder(orderData);
            alert('Pedido enviado correctamente');
            clearCart();
            navigate('/');
        } catch (error) {
            console.error('Error al procesar el pedido:', error);
            alert('No se pudo enviar el pedido');
        }
    };

    if (cart.length === 0) {
        return (
            <Container maxW="container.sm" py={10}>
                <VStack spacing={4} align="start">
                    <Heading size="lg">Carrito vacío</Heading>
                    <Text>Por favor, añade productos al carrito antes de proceder al checkout.</Text>
                    <Button onClick={() => navigate('/')} colorScheme="blue">
                        Volver a la tienda
                    </Button>
                </VStack>
            </Container>
        );
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <Container maxW="container.sm" py={10}>
            <VStack spacing={8} align="stretch">
                <Heading size="lg">Resumen del Pedido</Heading>
                {cart.map((item) => (
                    <Box key={item.id} p={4} borderWidth={1} borderRadius="md">
                        <Text fontWeight="bold">{item.name}</Text>
                        <Text>Cantidad: {item.quantity}</Text>
                        <Text>Precio unitario: ${item.price}</Text>
                        <Text>Subtotal: ${item.price * item.quantity}</Text>
                    </Box>
                ))}
                <Box p={4} borderWidth={1} borderRadius="md" bg="gray.50">
                    <Text fontWeight="bold" fontSize="lg">Total: ${total}</Text>
                </Box>
                <Button 
                    colorScheme="blue" 
                    size="lg" 
                    onClick={handleCheckout}
                    isDisabled={cart.length === 0}
                >
                    Confirmar Pedido
                </Button>
            </VStack>
        </Container>
    );
};
