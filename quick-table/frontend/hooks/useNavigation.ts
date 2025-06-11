import { useRouter, LinkProps } from 'expo-router';

const useNavigation = () => {
    const router = useRouter();

    const navigateTo = (path: LinkProps["href"]) => {
        router.push(path);
    };

    const goBack = () => {
        router.back();
    };

    return {
        navigateTo,
        goBack,
    };
};

export default useNavigation;