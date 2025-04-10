document.addEventListener('DOMContentLoaded', () => {
    const connectWalletBtn = document.getElementById('connectWalletBtn');
    const walletAddressDiv = document.getElementById('walletAddress');
    const balancesDiv = document.getElementById('balances');

    let connectedAccount = null;
    let provider = null;

    async function getBalance(address, asset, currentProvider, tokenAddress = null, tokenAbi = null) {
        if (!currentProvider || !address) return '0';
        try {
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

    async function displayBalances() {
        if (connectedAccount && provider) {
            balancesDiv.innerHTML = 'Fetching balances...';
            try {
                const network = await provider.getNetwork();
                console.log("Network:", network);

                let balances = {};
                const tokenAddresses = {
                    'USDT (BSC)': '0x55d398326f99059fF775485246999027B3197955',
                    // Add more token addresses here.
                };

                const tokenAbi = [
                    'function balanceOf(address) view returns (uint256)',
                    'function decimals() view returns (uint8)'
                ];

                // Get native token balance
                const nativeBalance = await getBalance(connectedAccount, 'native', provider);
                if (parseFloat(nativeBalance) > 0) {
                    balances[network.nativeCurrency.symbol] = nativeBalance;
                }

                // Get ERC-20/BEP-20 token balances
                for (const asset in tokenAddresses) {
                    try {
                        const tokenBalance = await getBalance(connectedAccount, asset, provider, tokenAddresses[asset], tokenAbi);
                        if (parseFloat(tokenBalance) > 0) {
                            balances[asset] = tokenBalance;
                        }
                    } catch (tokenError) {
                        console.error(`Error fetching ${asset} balance:`, tokenError);
                    }
                }

                let balancesText = 'Balances:<br>';
                for (const asset in balances) {
                    balancesText += `${asset}: ${balances[asset]}<br>`;
                }
                balancesDiv.innerHTML = balancesText;

            } catch (error) {
                console.error('Error displaying balances:', error);
                balancesDiv.textContent = 'Error fetching balances.';
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
                    provider = new ethers.providers.Web3Provider(window.ethereum);
                    console.log('Connected address:', connectedAccount);
                    console.log('window.ethereum:', window.ethereum);
                    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
                    console.log('Chain ID:', chainId);
                    const network = await provider.getNetwork();
                    console.log('Network:', network);
                    displayBalances();
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
