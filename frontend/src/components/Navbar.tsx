import React from 'react';
import {
    Box,
    Flex,
    Button,
    IconButton,
    useDisclosure,
    Text,
    Badge,
    Popover,
    PopoverTrigger,
    PopoverContent,
    VStack,
} from '@chakra-ui/react';
import { FaShoppingCart, FaUser } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore, useCartStore } from '../store';
import { CartDrawer } from './CartDrawer';

export const Navbar: React.FC = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { user, logout } = useAuthStore();
    const cart = useCartStore((state) => state.cart);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            <Box bg="teal.500" px={4} position="fixed" width="100%" zIndex={10}>
                <Flex h={16} alignItems="center" justifyContent="space-between">
                    <Link to="/">
                        <Text fontSize="2xl" fontWeight="bold" color="white">
                            Belcorp Shop
                        </Text>
                    </Link>

                    <Flex alignItems="center">
                        <IconButton
                            aria-label="Cart"
                            icon={
                                <>
                                    <FaShoppingCart />
                                    {cart.items.length > 0 && (
                                        <Badge
                                            colorScheme="red"
                                            position="absolute"
                                            top="-1"
                                            right="-1"
                                            fontSize="xs"
                                        >
                                            {cart.items.length}
                                        </Badge>
                                    )}
                                </>
                            }
                            variant="ghost"
                            color="white"
                            _hover={{ bg: 'teal.600' }}
                            onClick={onOpen}
                            mr={4}
                        />

                        <Popover placement="bottom-end">
                            <PopoverTrigger>
                                <IconButton
                                    aria-label="User menu"
                                    icon={<FaUser />}
                                    variant="ghost"
                                    color="white"
                                    _hover={{ bg: 'teal.600' }}
                                />
                            </PopoverTrigger>
                            <PopoverContent p={2}>
                                <VStack spacing={2} align="stretch">
                                    {user ? (
                                        <>
                                            <Text p={2}>
                                                Bienvenido, {user.username}
                                            </Text>
                                            <Button
                                                variant="ghost"
                                                onClick={handleLogout}
                                                width="100%"
                                            >
                                                Cerrar Sesión
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            as={Link}
                                            to="/login"
                                            variant="ghost"
                                            width="100%"
                                        >
                                            Iniciar Sesión
                                        </Button>
                                    )}
                                </VStack>
                            </PopoverContent>
                        </Popover>
                    </Flex>
                </Flex>
            </Box>

            <CartDrawer isOpen={isOpen} onClose={onClose} />
        </>
    );
};
