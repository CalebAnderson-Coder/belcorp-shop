import React from 'react';
import { Flex, Spinner } from '@chakra-ui/react';

export const LoadingSpinner: React.FC = () => {
    return (
        <Flex justify="center" align="center" height="100vh">
            <Spinner
                thickness="4px"
                speed="0.65s"
                emptyColor="gray.200"
                color="teal.500"
                size="xl"
            />
        </Flex>
    );
};
