document.addEventListener('DOMContentLoaded', () => {
    const connectWalletBtn = document.getElementById('connectWalletBtn');
    const walletAddressDiv = document.getElementById('walletAddress');
    const sendFundsBtn = document.getElementById('sendFundsBtn');
    const recipientAddressInput = document.getElementById('recipientAddress');
    const assetSelect = document.getElementById('asset');
    const amountInput = document.getElementById('amount');
    const transactionResultDiv = document.getElementById('transactionResult');

    let connectedAccount = null;

    // Example contract addresses for BUSD and USDT on BSC (REPLACE WITH ACTUAL ADDRESSES)
    const busdContractAddress = '0xe9e7CEA3DedcAe846fa077101708178003cdE6a';
    const usdtContractAddress = '0x55d398326f99059fF775485246999027B3197955';

    connectWalletBtn.addEventListener('click', async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                if (accounts.length > 0) {
                    connectedAccount = accounts[0];
                    walletAddressDiv.textContent = `Connected Wallet: ${connectedAccount.substring(0, 6)}...${connectedAccount.slice(-4)}`;
                    connectWalletBtn.textContent = 'Wallet Connected';
                    connectWalletBtn.disabled = true;
                    sendFundsBtn.disabled = false;
                    console.log('Connected address:', connectedAccount);
                } else {
                    walletAddressDiv.textContent = 'No accounts found. Please connect your wallet.';
                    sendFundsBtn.disabled = true;
                }
            } catch (error) {
                console.error('Error connecting to wallet:', error);
                walletAddressDiv.textContent = `Error connecting: ${error.message}`;
                sendFundsBtn.disabled = true;
            }
        } else {
            walletAddressDiv.textContent = 'Web3 provider not found. Please install MetaMask or a compatible wallet.';
            sendFundsBtn.disabled = true;
        }
    });

    sendFundsBtn.addEventListener('click', async () => {
        if (!connectedAccount) {
            transactionResultDiv.textContent = 'Please connect your wallet first.';
            return;
        }

        const recipientAddress = recipientAddressInput.value;
        const amountToSend = amountInput.value;
        const selectedAsset = assetSelect.value;

        if (!recipientAddress || !amountToSend || isNaN(amountToSend) || parseFloat(amountToSend) <= 0) {
            transactionResultDiv.textContent = 'Please enter a valid recipient address and amount.';
            return;
        }

        try {
            let txHash;

            if (selectedAsset === 'bnb') {
                const transactionParameters = {
                    from: connectedAccount,
                    to: recipientAddress,
                    value: ethers.utils.parseEther(amountToSend).toHexString(), // Amount in Wei
                    gas: '0x76c0',
                    gasPrice: '0x9184e72a000',
                };
                txHash = await window.ethereum.request({
                    method: 'eth_sendTransaction',
                    params: [transactionParameters],
                });
            } else if (selectedAsset === 'busd' || selectedAsset === 'usdt') {
                // For BEP-20 tokens, we need to interact with the contract
                const tokenContractAddress = selectedAsset === 'busd' ? busdContractAddress : usdtContractAddress;
                const tokenContract = new ethers.Contract(tokenContractAddress, [
                    'function transfer(address recipient, uint256 amount) external returns (bool)',
                    // You might need to fetch the number of decimals for the token
                ], new ethers.providers.Web3Provider(window.ethereum));

                // Assuming the token has 18 decimals (common for many BEP-20 tokens)
                const amountToSendWei = ethers.utils.parseUnits(amountToSend, 18).toHexString();

                txHash = await tokenContract.transfer(recipientAddress, amountToSendWei);
            } else {
                transactionResultDiv.textContent = 'Unsupported asset selected.';
                return;
            }

            transactionResultDiv.textContent = `Transaction sent: https://bscscan.com/tx/${txHash}`; // Use BSCScan for BSC network
            console.log('Transaction Hash:', txHash);

        } catch (error) {
            console.error('Error sending transaction:', error);
            transactionResultDiv.textContent = `Transaction failed: ${error.message}`;
        }
    });
});
