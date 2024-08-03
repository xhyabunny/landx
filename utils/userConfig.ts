interface Props {
    clickToLoad: boolean
}

export let config = {
    clickToLoad: true,
};

export const setConfig = (newConfig: Props) => {
    config = { ...config, ...newConfig };
    localStorage.setItem('settings', JSON.stringify({ config }))
    return config;
};
