import React from 'react';
import {
    Box,
    Button,
    VStack,
    HStack,
    Text,
    IconButton,
    Input,
} from '@chakra-ui/react';
import { FaTrash, FaTimes } from 'react-icons/fa';
import { useCartStore } from '../store';
import { useNavigate } from 'react-router-dom';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
    const { cart, removeFromCart, updateQuantity } = useCartStore();
    const navigate = useNavigate();

    const handleCheckout = () => {
        if (cart.items.length === 0) {
            alert('Agrega productos antes de continuar');
            return;
        }
        onClose();
        navigate('/checkout');
    };

    if (!isOpen) return null;

    return (
        <Box
            position="fixed"
            top={0}
            right={0}
            bottom={0}
            width="100%"
            maxW="md"
            bg="white"
            boxShadow="lg"
            zIndex={1000}
        >
            <Box p={4} borderBottomWidth={1}>
                <HStack justify="space-between" align="center">
                    <Text fontSize="xl" fontWeight="bold">
                        Carrito de Compras
                    </Text>
                    <IconButton
                        aria-label="Cerrar"
                        icon={<FaTimes />}
                        variant="ghost"
                        onClick={onClose}
                    />
                </HStack>
            </Box>

            <Box p={4} overflowY="auto" height="calc(100vh - 180px)">
                <VStack spacing={4} align="stretch">
                    {cart.items?.map((item) => (
                        <Box
                            key={item.id}
                            p={4}
                            borderWidth={1}
                            borderRadius="md"
                        >
                            <HStack justify="space-between">
                                <VStack align="start" spacing={1}>
                                    <Text fontWeight="bold">{item.name}</Text>
                                    <Text>Precio: ${item.price}</Text>
                                </VStack>
                                <HStack>
                                    <Input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) =>
                                            updateQuantity(
                                                item.id,
                                                parseInt(e.target.value)
                                            )
                                        }
                                        min={1}
                                        max={99}
                                        width="70px"
                                    />
                                    <IconButton
                                        aria-label="Eliminar"
                                        icon={<FaTrash />}
                                        colorScheme="red"
                                        variant="ghost"
                                        onClick={() => removeFromCart(item.id)}
                                    />
                                </HStack>
                            </HStack>
                        </Box>
                    ))}
                </VStack>
            </Box>

            <Box p={4} borderTopWidth={1} bg="gray.50">
                <Button
                    colorScheme="teal"
                    width="100%"
                    onClick={handleCheckout}
                    isDisabled={!cart.items?.length}
                >
                    Proceder al Pago
                </Button>
            </Box>
        </Box>
    );
};
