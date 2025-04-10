const connectWalletBtn = document.getElementById('connectWalletBtn');
const walletAddressDiv = document.getElementById('walletAddress');

connectWalletBtn.addEventListener('click', async () => {
    console.log('Connect button clicked!');
    console.log('window.ethereum:', window.ethereum);

    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            if (accounts.length > 0) {
                const address = accounts[0];
                walletAddressDiv.textContent = `Connected Wallet: ${address}`;
                connectWalletBtn.textContent = 'Wallet Connected';
                connectWalletBtn.disabled = true;
                console.log('Connected address:', address);
            } else {
                walletAddressDiv.textContent = 'No accounts found. Please connect your wallet.';
            }
        } catch (error) {
            console.error('Error connecting to wallet:', error);
            walletAddressDiv.textContent = `Error connecting: ${error.message}`;
        }
    } else {
        walletAddressDiv.textContent = 'Web3 provider not found. Please install MetaMask or a compatible wallet.';
    }
});