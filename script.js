import com.yourpackage.ERC20; // Replace with your generated contract wrapper package
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;
import org.web3j.utils.Convert;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.util.concurrent.ExecutionException;

public class BEP20Balance {

    public static void main(String[] args) throws Exception {
        String walletAddress = "0xYourWalletAddress"; // Replace with your wallet address
        String contractAddress = "0x55d398326f99059fF775485246999027B3197955"; // USDT on BSC or other BEP-20 contract address.
        String rpcUrl = "https://bsc-dataseed.binance.org/"; // Binance Smart Chain RPC URL

        Web3j web3 = Web3j.build(new HttpService(rpcUrl));
        Credentials credentials = Credentials.create("0x0000000000000000000000000000000000000000000000000000000000000000"); // Dummy credentials for read-only operations.

        BEP20 contract = BEP20.load(contractAddress, web3, credentials, BigInteger.ZERO, BigInteger.ZERO);

        try {
            BigInteger balanceRaw = contract.balanceOf(walletAddress).sendAsync().get();
            BigInteger decimals = contract.decimals().sendAsync().get();

            BigDecimal balance = Convert.fromWei(balanceRaw.toString(), decimals);

            System.out.println("BEP-20 Token Balance: " + balance + " Tokens");

        } catch (InterruptedException | ExecutionException e) {
            System.err.println("Error fetching BEP-20 token balance: " + e.getMessage());
            e.printStackTrace();
        } finally {
            web3.shutdown();
        }
    }
}
