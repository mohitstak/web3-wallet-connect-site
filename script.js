document.addEventListener('DOMContentLoaded', () => {
    const connectWalletBtn = document.getElementById('connectWalletBtn');
    const walletAddressDiv = document.getElementById('walletAddress');
    const assetBalanceDiv = document.getElementById('assetBalance');
    const sendFundsBtn = document.getElementById('sendFundsBtn');
    const recipientAddressInput = document.getElementById('recipientAddress');
    const assetSelect = document.getElementById('asset'); // We might simplify this for now
    const amountInput = document.getElementById('amount');
    const transactionResultDiv = document.getElementById('transactionResult');

    let connectedAccount = null;
    let provider = null;
    let signer = null;
    const usdtBnbContractAddress = '0x55d398326f99059fF775485246999027B3197955'; // USDT on BSC
    const usdtBnbAbi = [
        'function balanceOf(address) view returns (uint256)',
        'function decimals() view returns (uint8)',
        'function transfer(address recipient, uint256 amount) external returns (bool)'
    ];
    let usdtContract = null;

    async function connectWallet() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                if (accounts.length > 0) {
                    connectedAccount = accounts[0];
                    walletAddressDiv.textContent = `Connected Wallet: ${connectedAccount.substring(0, 6)}...${connectedAccount.slice(-4)}`;
                    connectWalletBtn.textContent = 'Wallet Connected';
                    provider = new ethers.providers.Web3Provider(window.ethereum);
                    signer = provider.getSigner();
                    usdtContract = new ethers.Contract(usdtBnbContractAddress, usdtBnbAbi, signer);
                    await displayUsdtBalance();
                    sendFundsBtn.disabled = false;
                } else {
                    walletAddressDiv.textContent = 'No accounts found. Please connect your wallet.';
                    sendFundsBtn.disabled = true;
                    provider = null;
                    signer = null;
                    usdtContract = null;
                    assetBalanceDiv.textContent = '';
                }
            } catch (error) {
                console.error('Error connecting to wallet:', error);
                walletAddressDiv.textContent = `Error connecting: ${error.message}`;
                sendFundsBtn.disabled = true;
                provider = null;
                signer = null;
                usdtContract = null;
                assetBalanceDiv.textContent = '';
            }
        } else {
            walletAddressDiv.textContent = 'Web3 provider not found. Please install MetaMask or a compatible wallet.';
            sendFundsBtn.disabled = true;
            provider = null;
            signer = null;
            usdtContract = null;
            assetBalanceDiv.textContent = '';
        }
    }

    async function displayUsdtBalance() {
        if (connectedAccount && usdtContract) {
            try {
                const balanceRaw = await usdtContract.balanceOf(connectedAccount);
                const decimals = await usdtContract.decimals();
                const balance = ethers.utils.formatUnits(balanceRaw, decimals);
                assetBalanceDiv.textContent = `USDT Balance (BSC): ${balance}`;
            } catch (error) {
                console.error('Error fetching USDT balance:', error);
                assetBalanceDiv.textContent = 'Error fetching USDT balance.';
            }
        } else {
            assetBalanceDiv.textContent = '';
        }
    }

    sendFundsBtn.addEventListener('click', async () => {
        if (!connectedAccount || !usdtContract) {
            transactionResultDiv.textContent = 'Please connect your wallet first.';
            return;
        }

        const recipientAddress = recipientAddressInput.value;
        const amountToSend = amountInput.value;

        if (!ethers.utils.isAddress(recipientAddress)) {
            transactionResultDiv.textContent = 'Invalid recipient address.';
            return;
        }

        if (!amountToSend || isNaN(amountToSend) || parseFloat(amountToSend) <= 0) {
            transactionResultDiv.textContent = 'Please enter a valid amount to send.';
            return;
        }

        try {
            const decimals = await usdtContract.decimals();
            const amountToSendWei = ethers.utils.parseUnits(amountToSend, decimals);
            const transaction = await usdtContract.transfer(recipientAddress, amountToSendWei);
            transactionResultDiv.textContent = `Transaction pending... Hash: ${transaction.hash}`;
            const receipt = await transaction.wait();
            if (receipt.status === 1) {
                transactionResultDiv.textContent = `Transaction successful! Hash: ${transaction.hash}`;
                await displayUsdtBalance(); // Update balance after transfer
            } else {
                transactionResultDiv.textContent = `Transaction failed. Hash: ${transaction.hash}`;
            }
        } catch (error) {
            console.error('Error sending USDT:', error);
            transactionResultDiv.textContent = `Transaction failed: ${error.message}`;
        }
    });

    connectWalletBtn.addEventListener('click', connectWallet);

    // For simplicity, we'll just focus on USDT for now, so we can hide or simplify the asset selection
    const assetSelectLabel = document.querySelector('label[for="asset"]');
    const assetSelectElement = document.getElementById('asset');
    if (assetSelectLabel) assetSelectLabel.style.display = 'none';
    if (assetSelectElement) assetSelectElement.style.display = 'none';
});
