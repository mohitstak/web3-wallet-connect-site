document.addEventListener('DOMContentLoaded', () => {
    const connectWalletBtn = document.getElementById('connectWalletBtn');
    const walletAddressDiv = document.getElementById('walletAddress');
    const sendFundsBtn = document.getElementById('sendFundsBtn');
    const recipientAddressInput = document.getElementById('recipientAddress');
    const amountInput = document.getElementById('amount');
    const transactionResultDiv = document.getElementById('transactionResult');

    let connectedAccount = null;

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

        if (!recipientAddress || !amountToSend || isNaN(amountToSend) || parseFloat(amountToSend) <= 0) {
            transactionResultDiv.textContent = 'Please enter a valid recipient address and amount.';
            return;
        }

        try {
            const transactionParameters = {
                from: connectedAccount,
                to: recipientAddress,
                value: ethers.utils.parseEther(amountToSend).toHexString(), // Convert amount to Wei (for Ether/BNB)
                gas: '0x76c0', // Example gas limit
                gasPrice: '0x9184e72a000', // Example gas price
            };

            const txHash = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [transactionParameters],
            });

            transactionResultDiv.textContent = `Transaction sent: https://etherscan.io/tx/${txHash}`; // Replace with appropriate explorer URL
            console.log('Transaction Hash:', txHash);

        } catch (error) {
            console.error('Error sending transaction:', error);
            transactionResultDiv.textContent = `Transaction failed: ${error.message}`;
        }
    });
});
