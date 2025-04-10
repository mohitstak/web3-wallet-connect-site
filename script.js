document.addEventListener('DOMContentLoaded', () => {
    const connectWalletBtn = document.getElementById('connectWalletBtn');
    const walletAddressDiv = document.getElementById('walletAddress');
    const balancesDiv = document.getElementById('balances');

    let connectedAccount = null;
    let provider = null;

    async function getBalance(address, asset, currentProvider, tokenAddress = null, tokenAbi = null) {
        if (!currentProvider || !address) return '0';
        try {
            console.log("getBalance Provider Network:", await currentProvider.getNetwork()); // Log provider network
            if (asset === 'native') {
                const balanceWei = await currentProvider.getBalance(address);
                return ethers.utils.formatEther(balanceWei);
            } else if (tokenAddress && tokenAbi) {
                const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, currentProvider);
                const balanceRaw = await tokenContract.balanceOf(address);
                const decimals = await tokenContract.decimals();
                return ethers.utils.formatUnits(balanceRaw, decimals);
            }
            return '0';
        } catch (error) {
            console.error(`Error fetching balance for ${asset}:`, error);
            return '0';
        }
    }

    async function displayBalances(chainId) {
        if (connectedAccount && provider) {
            balancesDiv.innerHTML = 'Testing USDT contract...';
            try {
                const usdtBnbAddress = '0x55d398326f99059fF775485246999027B3197955';
                const usdtBnbAbi = ['function decimals() view returns (uint8)'];
                const tokenContract = new ethers.Contract(usdtBnbAddress, usdtBnbAbi, provider);
                const decimals = await tokenContract.decimals();
                balancesDiv.innerHTML = `USDT decimals: ${decimals}`;
            } catch (error) {
                console.error('Error testing USDT contract:', error);
                balancesDiv.innerHTML = 'Error testing USDT contract.';
            }
        } else {
            balancesDiv.textContent = '';
        }
    }

    connectWalletBtn.addEventListener('click', async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                if (accounts && accounts.length > 0) {
                    connectedAccount = accounts[0];
                    walletAddressDiv.textContent = `Connected Wallet: ${connectedAccount.substring(0, 6)}...${connectedAccount.slice(-4)}`;
                    connectWalletBtn.textContent = 'Wallet Connected';
                    // Force BSC Mainnet provider
                    provider = new ethers.providers.Web3Provider(window.ethereum, {
                        chainId: 56,
                        name: 'binance'
                    });
                    console.log('Connected address:', connectedAccount);
                    console.log('window.ethereum:', window.ethereum);
                    let chainId = 56; // Force chain ID to 56
                    console.log('Chain ID (forced):', chainId);
                    console.log('Provider:', provider); // Log the provider object
                    displayBalances(chainId);
                } else {
                    walletAddressDiv.textContent = 'No accounts found. Please connect your Trust Wallet.';
                }
            } catch (error) {
                console.error('Error connecting to Trust Wallet:', error);
                walletAddressDiv.textContent = `Connection error: ${error.message}`;
            }
        } else {
            walletAddressDiv.textContent = 'Wallet provider not detected. Open in Trust Wallet browser.';
        }
    });
});
