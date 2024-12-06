import React from 'react';
import {
    Box,
    Button,
    Input,
    VStack,
    Container,
    Heading,
    Text,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { login } from '../services/api';

export const LoginPage: React.FC = () => {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const setUser = useAuthStore((state) => state.setUser);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await login({ username, password });
            localStorage.setItem('token', response.access_token);
            setUser({ username, token: response.access_token });
            navigate('/');
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container maxW="container.sm" py={10}>
            <VStack spacing={8} align="stretch">
                <Heading textAlign="center">Iniciar Sesión</Heading>
                <Box as="form" onSubmit={handleSubmit}>
                    <VStack spacing={4}>
                        <Box>
                            <Text mb={2}>Usuario</Text>
                            <Input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Ingrese su usuario"
                                required
                            />
                        </Box>
                        <Box>
                            <Text mb={2}>Contraseña</Text>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Ingrese su contraseña"
                                required
                            />
                        </Box>
                        <Button
                            type="submit"
                            colorScheme="teal"
                            width="100%"
                            isLoading={isLoading}
                            loadingText="Iniciando sesión..."
                        >
                            Iniciar Sesión
                        </Button>
                    </VStack>
                </Box>
            </VStack>
        </Container>
    );
};
