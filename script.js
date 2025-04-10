document.addEventListener('DOMContentLoaded', () => {
    const connectWalletBtn = document.getElementById('connectWalletBtn');
    const walletAddressDiv = document.getElementById('walletAddress');
    const assetBalanceDiv = document.getElementById('assetBalance');
    const sendFundsBtn = document.getElementById('sendFundsBtn');
    const recipientAddressInput = document.getElementById('recipientAddress');
    const assetSelect = document.getElementById('asset');
    const amountInput = document.getElementById('amount');
    const transactionResultDiv = document.getElementById('transactionResult');

    let connectedAccount = null;
    let provider = null;
    const usdtBnbContractAddress = '0x55d398326f99059fF775485246999027B3197955'; // USDT on BSC
    const usdtBnbAbi = [
        'function balanceOf(address) view returns (uint256)',
        'function decimals() view returns (uint8)',
        'function transfer(address recipient, uint256 amount) external returns (bool)'
    ];

    async function getBalance(address, asset, currentProvider) {
        if (!currentProvider || !address) return '0';
        try {
            if (asset === 'eth') {
                const balanceWei = await currentProvider.getBalance(address);
                return ethers.utils.formatEther(balanceWei);
            } else if (asset === 'usdt_bnb') {
                const tokenContract = new ethers.Contract(usdtBnbContractAddress, usdtBnbAbi, currentProvider);
                const balanceRaw = await tokenContract.balanceOf(address);
                const decimals = await tokenContract.decimals();
                return ethers.utils.formatUnits(balanceRaw, decimals);
            } else if (asset === 'bnb') {
                const balanceWei = await currentProvider.getBalance(address);
                return ethers.utils.formatEther(balanceWei);
            }
            return '0';
        } catch (error) {
            console.error(`Error fetching balance for ${asset}:`, error);
            return '0';
        }
    }

    async function displayAllBalances() {
        if (connectedAccount && provider) {
            const network = await provider.getNetwork();
            let balances = {};

            if (network.chainId === 1) { // Ethereum Mainnet
                balances['ETH'] = await getBalance(connectedAccount, 'eth', provider);
            } else if (network.chainId === 56) { // Binance Smart Chain Mainnet
                balances['BNB'] = await getBalance(connectedAccount, 'bnb', provider);
                balances['USDT (BSC)'] = await getBalance(connectedAccount, 'usdt_bnb', provider);
            } else {
                assetBalanceDiv.textContent = 'Unsupported Network';
                return;
            }

            let balancesText = 'Balances: ';
            for (const asset in balances) {
                balancesText += `${asset}: ${balances[asset]} `;
            }
            assetBalanceDiv.textContent = balancesText;

            // Update the asset dropdown based on the detected network
            assetSelect.innerHTML = '';
            if (network.chainId === 1) {
                const ethOption = new Option('ETH (Ethereum Mainnet)', 'eth');
                assetSelect.add(ethOption);
            } else if (network.chainId === 56) {
                const bnbOption = new Option('BNB (Binance Smart Chain)', 'bnb');
                assetSelect.add(bnbOption);
                const usdtOption = new Option('USDT (BEP-20 on BSC)', 'usdt_bnb');
                assetSelect.add(usdtOption);
            }
        } else {
            assetBalanceDiv.textContent = '';
            assetSelect.innerHTML = '<option value="">Select Asset</option>';
        }
    }

    connectWalletBtn.addEventListener('click', async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                if (accounts.length > 0) {
                    connectedAccount = accounts[0];
                    walletAddressDiv.textContent = `Connected Wallet: <span class="math-inline">\{connectedAccount\.substring\(0, 6\)\}\.\.\.</span>{connectedAccount.slice(-4)}`;
                    connectWalletBtn.textContent = 'Wallet Connected';
                    sendFundsBtn.disabled = false;
                    provider = new ethers.providers.Web3Provider(window.ethereum);
                    console.log('Connected address:', connectedAccount);
                    displayAllBalances();
                } else {
                    walletAddressDiv.textContent = 'No accounts found. Please connect your wallet.';
                    sendFundsBtn.disabled = true;
                    provider = null;
                    assetBalanceDiv.textContent = '';
                    assetSelect.innerHTML = '<option value="">Select Asset</option>';
                    amountInput.value = '';
                }
            } catch (error) {
                console.error('Error connecting to wallet:', error);
                walletAddressDiv.textContent = `Error connecting: ${error.message}`;
                sendFundsBtn.disabled = true;
                provider = null;
                assetBalanceDiv.textContent = '';
                assetSelect.innerHTML = '<option value="">Select Asset</option>';
                amountInput.value = '';
            }
        } else {
            walletAddressDiv.textContent = 'Web3 provider not found. Please install MetaMask or a compatible wallet.';
            sendFundsBtn.disabled = true;
            provider = null;
            assetBalanceDiv.textContent = '';
            assetSelect.innerHTML = '<option value="">Select Asset</option>';
            amountInput.value = '';
        }
    });

    // Update displayed balance when the selected asset changes
    asset
